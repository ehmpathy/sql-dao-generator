import { UnexpectedCodePathError } from '@ehmpathy/error-fns';
import { isPropertyNameAReferenceIntuitively } from 'domain-objects';

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
    const intuitivelyReferencedDomainObjectNames = allDomainObjectNames.filter(
      (domainObjectName) =>
        isPropertyNameAReferenceIntuitively({ propertyName, domainObjectName }),
    );

    // if more than one, then its ambiguously specified
    if (intuitivelyReferencedDomainObjectNames.length > 1)
      throw new AmbiguouslyNamedDomainObjectReferencePropertyError({
        parentDomainObjectName,
        propertyName,
        ambiguousOptions: intuitivelyReferencedDomainObjectNames,
      });

    // otherwise, there's either exactly one or none
    return intuitivelyReferencedDomainObjectNames[0] ?? null;
  };
