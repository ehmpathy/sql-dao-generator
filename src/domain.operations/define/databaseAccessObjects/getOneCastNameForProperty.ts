import {
  DomainObjectPropertyType,
  isPrimitiveArrayProperty,
} from 'domain-objects-metadata';

import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';

import { DAO_CAST_NAME_DATE, DAO_CAST_NAME_NUMBER } from './constants';

/**
 * .what = the cast operation each divergence-prone property type needs at the persistence boundary
 * .why  = a DATE is a `Date` raw and an iso string inside json; a NUMBER is a `number` or a
 *         `string`, per the consumer's pg type parsers. every other type agrees on both paths
 */
const castNameByPropertyType: Partial<
  Record<DomainObjectPropertyType, string>
> = {
  [DomainObjectPropertyType.DATE]: DAO_CAST_NAME_DATE,
  [DomainObjectPropertyType.NUMBER]: DAO_CAST_NAME_NUMBER,
};

/**
 * .what = gets the cast operation one property needs, or null when it needs none
 * .why  = the imports and the property code must agree on which casts are used
 * .note = the upsert definer asks too: upsert reads database-generated values off its own select,
 *         with no `castFromDatabaseObject` between
 * .note = its own file, since the cast definer and the upsert definer both ask it;
 *         inside the definer it would form a cycle `dpdm` refuses
 */
export const getOneCastNameForProperty = ({
  sqlSchemaProperty,
  domainObjectProperty,
}: {
  sqlSchemaProperty: SqlSchemaToDomainObjectRelationship['properties'][number]['sqlSchema'];
  domainObjectProperty: SqlSchemaToDomainObjectRelationship['properties'][number]['domainObject'];
}): string | null => {
  // a property with no domain declaration is not instantiated at all
  if (!domainObjectProperty) return null;

  // a referenced property is cast by the nested dao's own cast, not here
  if (sqlSchemaProperty.reference) return null;

  // a primitive array carries the same divergence its element type does
  if (isPrimitiveArrayProperty(domainObjectProperty))
    return castNameByPropertyType[domainObjectProperty.of.type] ?? null;

  return castNameByPropertyType[domainObjectProperty.type] ?? null;
};
