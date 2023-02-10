import { getDomainObjectNameAfterDroppingSomeQualifiers } from './getDomainObjectNameAfterDroppingSomeQualifiers';
import { isPropertyNamedAfterDomainObject } from './isPropertyNamedAfterDomainObject';

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
    let qualifiersToDrop = 0;
    let iterationLimitExceeded = false;
    while (!iterationLimitExceeded) {
      // for this qualifiersToDrop count, define the names for domain objects after dropping those qualifiers
      const allDomainObjectNamesWithoutQualifiers = allDomainObjectNames
        .map((domainObjectName) => {
          return {
            withoutQualifiers: getDomainObjectNameAfterDroppingSomeQualifiers({
              domainObjectName,
              qualifiersToDrop,
            }),
            withQualifiers: domainObjectName,
          };
        })
        .filter(
          (
            name,
          ): name is { withoutQualifiers: string; withQualifiers: string } =>
            !!name.withoutQualifiers,
        );
      if (allDomainObjectNamesWithoutQualifiers.length === 0) return null; // if we reached here, then that means we can't find a domain object name that this property name references in any way

      // check if there are any domain objects which it is named for unambiguously, at this level of dropping qualifiers
      const namedForAtThisQualifiersToDropLevel =
        allDomainObjectNamesWithoutQualifiers.filter(
          (name) =>
            isPropertyNamedAfterDomainObject({
              propertyName,
              domainObjectName: name.withoutQualifiers,
            }) ||
            isPropertyNamedAfterDomainObject({
              propertyName: propertyName.replace(/s$/, ''), // without trailing s
              domainObjectName: name.withoutQualifiers,
            }),
        );

      // if there is exactly one, job done - unambiguously specified
      if (namedForAtThisQualifiersToDropLevel.length === 1)
        return namedForAtThisQualifiersToDropLevel[0].withQualifiers;

      // if more than one, then its ambiguously specified
      if (namedForAtThisQualifiersToDropLevel.length > 1)
        throw new AmbiguouslyNamedDomainObjectReferencePropertyError({
          parentDomainObjectName,
          propertyName,
          ambiguousOptions: namedForAtThisQualifiersToDropLevel.map(
            (name) => name.withQualifiers,
          ),
        });

      // otherwise, go another layer deeper and try again
      qualifiersToDrop += 1;

      // safety check: if we passed more than 20 qualifiers, there's been some sort of error
      if (qualifiersToDrop > 20) {
        iterationLimitExceeded = true; // this is redundant, but feels better than having a `while(true)` defined
        throw new Error(
          'attempted to drop more than 20 qualifiers. does someone really have 20 qualifiers on a name? this is probably a bug',
        );
      }
    }
    throw new Error('something unexpected went wrong'); // we shouldn't reach here
  };
