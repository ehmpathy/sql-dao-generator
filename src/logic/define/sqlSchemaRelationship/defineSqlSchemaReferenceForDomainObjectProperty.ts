// tslint:disable: max-classes-per-file
import {
  DomainObjectMetadata,
  DomainObjectPropertyMetadata,
  DomainObjectPropertyType,
  DomainObjectReferenceMetadata,
  DomainObjectVariant,
  isDomainObjectArrayProperty,
  isDomainObjectReferenceProperty,
} from 'domain-objects-metadata';
import omit from 'lodash.omit';

import {
  SqlSchemaReferenceMetadata,
  SqlSchemaReferenceMethod,
} from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { UserInputError } from '../../UserInputError';
import { getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter } from './getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter/getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter';

export class PropertyReferencingDomainObjectNotNamedCorrectlyError extends Error {
  constructor({
    domainObject,
    property,
    referencedDomainObject,
  }: {
    domainObject: DomainObjectMetadata;
    property: DomainObjectPropertyMetadata;
    referencedDomainObject: {
      expected: string;
      inferred: string | null;
    };
  }) {
    super(
      `
Properties that reference a domain-object must be named after the domain-object they reference. '${domainObject.name}.${property.name}: ${referencedDomainObject.expected}' does not meet this criteria.

For example:
- allowed:
  - 'address: Address'
  - 'homeAddress: Address'
  - 'address: HomeAddress'
  - 'homeAddress: HomeAddress'
  - 'home: HomeAddress'
- not allowed:
  - 'home: Address'

Ambiguity:
- expected: ${referencedDomainObject.expected}
- inferred: ${referencedDomainObject.inferred}

Tip: the prefixes or suffixes should unambiguously match
`.trim(),
    );
  }
}

export class DirectlyNestedNonDomainObjectReferenceForbiddenError extends Error {
  constructor({
    domainObject,
    property,
    referencedDomainObject,
  }: {
    domainObject: DomainObjectMetadata;
    property: DomainObjectPropertyMetadata;
    referencedDomainObject: DomainObjectReferenceMetadata;
  }) {
    super(
      `
${referencedDomainObject.extends} found directly nested inside of another domain object. '${domainObject.name}.${property.name}' reference '${referencedDomainObject.name}'

This is not allowed, as this is bad practice when persisting domain-objects due to maintainability problems with this pattern. See the readme for more details.

Instead, reference the entity by 'ref' and ensure that the name ends with the 'Ref' suffix. For example:

\`\`\`ts
-- say you're referencing this domain-entity
export class User extends DomainEntity<User> implements User {};

-- instead of this
interface Profile {
  user: User; -- forbidden: referencing domain entity by nesting
  ...
}

-- do this
interface Profile {
  userRef: Ref<typeof User>; -- suggested: reference it by ref
  ...
}
\`\`\`

Note: the generated sql-schema will be the same as if it was a nested reference, but the domain-object referencing by ref will make your code easier to maintain.
  `.trim(),
    );
  }
}

export const defineSqlSchemaReferenceForDomainObjectProperty = ({
  property,
  domainObject,
  allDomainObjects,
}: {
  property: DomainObjectPropertyMetadata;
  domainObject: DomainObjectMetadata;
  allDomainObjects: DomainObjectMetadata[];
}): SqlSchemaReferenceMetadata | null => {
  // determine what kind of reference it can be
  const isDirectReferenceCandidate = isDomainObjectReferenceProperty(property);
  const isDirectReferenceArrayCandidate =
    isDomainObjectArrayProperty(property) &&
    isDomainObjectReferenceProperty(property.of);
  const isDirectDeclarationReferenceCandidate =
    property.type === DomainObjectPropertyType.REFERENCE &&
    new RegExp(/Ref$/).test(property.name);
  const isImplicitUuidReferenceCandidate =
    property.type === DomainObjectPropertyType.STRING &&
    new RegExp(/Uuid/).test(property.name);
  const isImplicitUuidReferenceArrayCandidate =
    isDomainObjectArrayProperty(property) &&
    property.of.type === DomainObjectPropertyType.STRING &&
    new RegExp(/Uuids/).test(property.name);

  // handle direct nested references
  if (isDirectReferenceCandidate || isDirectReferenceArrayCandidate) {
    // grab the referenced object
    const referencedDomainObject = (() => {
      if (isDirectReferenceCandidate)
        return property.of as DomainObjectReferenceMetadata;
      if (isDirectReferenceArrayCandidate)
        return (property.of as DomainObjectPropertyMetadata)
          .of as DomainObjectReferenceMetadata;
      throw new UnexpectedCodePathDetectedError({
        reason:
          'should have met one of the above criteria for sql schema reference definition',
        domainObjectName: domainObject.name,
        domainObjectPropertyName: property.name,
      }); // fail fast
    })();

    // check that the property-name is unambiguously and naturally named after this domain object
    const domainObjectNamePropertyIsNamedAfter =
      getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter({
        parentDomainObjectName: domainObject.name,
        propertyName: property.name,
        allDomainObjectNames: [
          ...new Set([
            ...allDomainObjects.map(({ name }) => name),
            referencedDomainObject.name,
          ]),
        ], // note: We add the referenced domain object name her because we _have_ the reference, even if its not in the "metadatas" of available domain objects; this avoids a class of errors from technically being possible (ones that _shouldn't occur in real life)
      });
    if (domainObjectNamePropertyIsNamedAfter !== referencedDomainObject.name)
      throw new PropertyReferencingDomainObjectNotNamedCorrectlyError({
        property,
        domainObject,
        referencedDomainObject: {
          expected: referencedDomainObject.name,
          inferred: domainObjectNamePropertyIsNamedAfter,
        },
      });

    // if its a domain literal, then we allow a directly nested reference
    if (referencedDomainObject.extends === DomainObjectVariant.DOMAIN_LITERAL)
      return new SqlSchemaReferenceMetadata({
        method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
        of: new DomainObjectReferenceMetadata(referencedDomainObject),
      });

    // otherwise, it must be a directly referenced reference and the name should represent that too // todo: trace that the dobj was defined with `Ref<>` explicitly; today, the metadata calls both `: Dobj` and `: Ref<typeof Dobj>` as a "REFERENCE"
    if (!isDirectDeclarationReferenceCandidate)
      throw new DirectlyNestedNonDomainObjectReferenceForbiddenError({
        domainObject,
        property,
        referencedDomainObject,
      });
    return new SqlSchemaReferenceMetadata({
      method: SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION,
      of: new DomainObjectReferenceMetadata(referencedDomainObject),
    });
  }

  // handle inferred uuid references
  const referenceOfUuid = (() => {
    if (
      !isImplicitUuidReferenceCandidate &&
      !isImplicitUuidReferenceArrayCandidate
    )
      return null; // no reference if not a candidate of either
    const foundReferencedDomainObjectName =
      getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter({
        parentDomainObjectName: domainObject.name,
        propertyName: property.name,
        allDomainObjectNames: allDomainObjects.map(({ name }) => name),
      });
    const foundReferencedDomainObjectMetadata = allDomainObjects.find(
      (thisDomainObject) =>
        thisDomainObject.name === foundReferencedDomainObjectName,
    );
    if (!foundReferencedDomainObjectMetadata) return null;
    if (
      foundReferencedDomainObjectMetadata.extends ===
      DomainObjectVariant.DOMAIN_LITERAL
    )
      // safety check
      throw new UserInputError({
        reason:
          'domain-literals persisted in the same database as this domain-object should not be referenced by implicit uuid reference. reference them by direct nesting instead.',
        domainObjectName: domainObject.name,
        domainObjectPropertyName: property.name,
      });
    return foundReferencedDomainObjectMetadata;
  })();
  if (referenceOfUuid)
    return new SqlSchemaReferenceMetadata({
      method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
      of: new DomainObjectReferenceMetadata(
        omit(referenceOfUuid, ['properties', 'decorations']),
      ),
    });

  // otherwise, no reference
  return null;
};
