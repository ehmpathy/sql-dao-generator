import { UnexpectedCodePathError } from '@ehmpathy/error-fns';
import { isPropertyNameAReferenceIntuitively } from 'domain-objects';
import { isPresent } from 'type-fns';

export class AmbiguouslyNamedDomainObjectReferencePropertyError extends Error {
  constructor({
    propertyName,
    parentDomainObjectName,
    ambiguousOptions,
  }: {
    propertyName: string;
    parentDomainObjectName: string;
    ambiguousOptions: string[];
  }) {
    super(
      `
Property referencing a domain object was found to be ambiguously named. '${parentDomainObjectName}.${propertyName}' could be referencing any of the following domain objects: ${JSON.stringify(
        ambiguousOptions,
      )})

Please update the name of this property or the names of your domain objects in order to remove this ambiguity.
      `.trim(),
    );
  }
}

/**
 * look at all of the domain objects in scope of this dao and figure out the most precise one that this property is named after
 *
 * purpose is to allow people to reference other domain objects with natural, comfortable english (e.g., using partial names instead of full names)
 *
 * details:
 * - walks through all domain object names and attempts to figure out the most precise one that this property name can be referencing
 *   - will incrementally drop "qualifiers" on the domain object name until we find a match of exactly one domain object
 *   - will throw an error if dropping "qualifiers" results in more than one reference (i.e., ambiguous situation)
 *
 * for example:
 * - address, ['Address', 'Geocode', 'User'] => 'Address'
 * - homeAddress, ['Address', 'Geocode', 'User'] => 'Address'
 * - homeAddress, ['HomeAddress', 'Geocode', 'User'] => 'HomeAddress'
 * - address, ['HomeAddress', 'Geocode', 'User'] => 'HomeAddress'
 * - address, ['HomeAddress', 'WorkAddress', 'Geocode', 'User'] => throws AmbiguouslyImplicitUuidReferencePropertyNameError('could reference either WorkAddress or HomeAddress. please remove this ambiguity');
 * - externalId, ['PlaneExternalId', 'Airport', 'PlaneManufacturer'] => 'PlaneExternalId'
 *
 * todo:
 * - eliminate this entirely, in favor of using explicit references, via `Ref<Dobj>` or `public static refs = { }`
 */
export const getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter =
  ({
    parentDomainObjectName,
    propertyName,
    allDomainObjectNames,
  }: {
    parentDomainObjectName: string;
    propertyName: string;
    allDomainObjectNames: string[];
  }): string | null => {
    // determine whether there is a domain object with that exact same name
    const domainObjectWithExactSameName = allDomainObjectNames.filter(
      (dobjName) =>
        propertyName.toLowerCase() === dobjName.toLowerCase() ||
        propertyName.toLowerCase() ===
          [dobjName, 'uuid'].join('').toLowerCase() || // todo: getPrimaryKey of dobj class, dont just assume its uuid
        propertyName.toLowerCase() ===
          [dobjName, 'uuids'].join('').toLowerCase(), // todo: getPrimaryKey of dobj class, dont just assume its uuid
    );
    if (domainObjectWithExactSameName.length > 1)
      throw new AmbiguouslyNamedDomainObjectReferencePropertyError({
        parentDomainObjectName,
        propertyName,
        ambiguousOptions: domainObjectWithExactSameName,
      });
    if (domainObjectWithExactSameName.length === 1)
      return domainObjectWithExactSameName[0]!;

    // determine all of the domain objects that are intuitively referenced by this property name
    const intuitivelyReferencedDomainObjectNames = allDomainObjectNames
      .map((domainObjectName) => {
        const reference = isPropertyNameAReferenceIntuitively({
          propertyName,
          domainObjectName,
        });
        if (!reference) return null;
        return {
          domainObjectName,
          referenceVia: reference.via,
        };
      })
      .filter(isPresent);

    // if there's either exactly one or none, then we can use it
    if (intuitivelyReferencedDomainObjectNames.length <= 1)
      return (
        intuitivelyReferencedDomainObjectNames[0]?.domainObjectName ?? null
      );

    // if more than one, then see if one of them has a more distinct reference (i.e., a longer reference match)
    const referenceViaLengthMax = intuitivelyReferencedDomainObjectNames
      .map(({ referenceVia }) => referenceVia.length)
      .sort((a, b) => (a < b ? -1 : 1)) // sort ascending
      .slice(-1)[0]; // get the max
    const referencesViaLengthMax =
      intuitivelyReferencedDomainObjectNames.filter(
        ({ referenceVia }) => referenceVia.length === referenceViaLengthMax,
      );
    if (referencesViaLengthMax.length === 0)
      throw new UnexpectedCodePathError(
        'should have found atleast one reference with same max length',
        {
          referenceViaLengthMax,
          referencesViaLengthMax,
          intuitivelyReferencedDomainObjectNames,
        },
      );
    if (referencesViaLengthMax.length === 1)
      return (
        referencesViaLengthMax[0]?.domainObjectName ??
        UnexpectedCodePathError.throw(
          'array w/ length === 1 should have first element defined',
        )
      );

    // otherwise, its ambiguous
    throw new AmbiguouslyNamedDomainObjectReferencePropertyError({
      parentDomainObjectName,
      propertyName,
      ambiguousOptions: intuitivelyReferencedDomainObjectNames.map(
        (option) => option.domainObjectName,
      ),
    });
  };
