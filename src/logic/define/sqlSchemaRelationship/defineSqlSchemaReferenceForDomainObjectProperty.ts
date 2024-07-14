// tslint:disable: max-classes-per-file
import { isPropertyNameAReferenceIntuitively } from 'domain-objects';
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

This is not allowed, as this is bad practice when persisting domain-objects due to maintainability problems with this pattern in backend code. See the readme for more details.

Instead, reference the entity by 'uuid' in the backend. For example:

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
  userUuid: string; -- suggested: reference it by uuid
  ...
}
\`\`\`

Note: the generated sql-schema will be the same as if it was a nested reference, but the domain-object referencing by uuid will make your backend code easier to maintain.
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
  const isDirectNestedReferenceCandidate =
    isDomainObjectReferenceProperty(property);
  const isDirectNestedReferenceArrayCandidate =
    isDomainObjectArrayProperty(property) &&
    isDomainObjectReferenceProperty(property.of);
  const isImplicitUuidReferenceCandidate =
    property.type === DomainObjectPropertyType.STRING &&
    new RegExp(/Uuid/).test(property.name);
  const isImplicitUuidReferenceArrayCandidate =
    isDomainObjectArrayProperty(property) &&
    property.of.type === DomainObjectPropertyType.STRING &&
    new RegExp(/Uuids/).test(property.name);

  // handle direct nested references
  if (
    isDirectNestedReferenceCandidate ||
    isDirectNestedReferenceArrayCandidate
  ) {
    // grab the referenced object
    const referencedDomainObject = (() => {
      if (isDirectNestedReferenceCandidate)
        return property.of as DomainObjectReferenceMetadata;
      if (isDirectNestedReferenceArrayCandidate)
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

    // check that the domain object referenced by direct nesting is not a domain entity or a domain event
    if (referencedDomainObject.extends !== DomainObjectVariant.DOMAIN_LITERAL)
      throw new DirectlyNestedNonDomainObjectReferenceForbiddenError({
        domainObject,
        property,
        referencedDomainObject,
      });

    // if the above passes, then we're good to move forward
    return new SqlSchemaReferenceMetadata({
      method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
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
      (domainObject) => domainObject.name === foundReferencedDomainObjectName,
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
