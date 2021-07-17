import { camelCase, pascalCase } from 'change-case';

/**
 * detects whether a property is named after a domain object
 *
 * for example:
 *  - `address: Address` => true
 *  - `homeAddress: Address` => true
 *  - `home: Address` => false
 *  - `engineerUuid: Engineer` => true
 *  - `leadEngineerUuid: Engineer` => true
 *  - `engineerUuids: Engineer` => true
 *  - `assignedEngineerUuids: Engineer` => true
 *  - `lead: Engineer` => false
 *  - `leadUuid: Engineer` => false
 *  - `assignedUuids: Engineer` => false
 */
export const isPropertyNamedAfterDomainObject = ({
  propertyName: propertyNamePotentiallyWithIrrelevantSuffixes,
  domainObjectName,
}: {
  propertyName: string;
  domainObjectName: string;
}) => {
  // remove the potential `uuid` or `uuids` suffix of the property name (used in implicit uuid references)
  const propertyName = propertyNamePotentiallyWithIrrelevantSuffixes.replace(/Uuids?$/, '');

  // check whether the property is exactly named after it
  const namedAfterItExactly = camelCase(domainObjectName) === propertyName;
  if (namedAfterItExactly) return true;

  // check whether the property is named after it as a suffix
  const namedAfterItAsASuffix = new RegExp(`${pascalCase(domainObjectName)}$`).test(propertyName); // e.g., /Engineer$/.test('leadEngineer');
  if (namedAfterItAsASuffix) return true;

  // otherwise, false
  return false;
};
