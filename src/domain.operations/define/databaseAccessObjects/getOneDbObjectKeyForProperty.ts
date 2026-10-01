import { snakeCase } from 'change-case';

import { SqlSchemaReferenceMethod } from '@src/domain.objects/SqlSchemaReferenceMetadata';
import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';

import { asDbObjectKeyForDeclaredRef } from './asDbObjectKeyForDeclaredRef';

/**
 * .what = gets the key this property is read from on the database object
 * .why  = the key is not always the sql column name: a reference is read by the domain property's
 *         name, and a declared ref swaps `_ref` for `_uuid`. the find-by select and the cast both
 *         ask here, so their keys agree by construction
 * .note = `null` for a property with no domain counterpart, or an unknown reference method
 */
export const getOneDbObjectKeyForProperty = ({
  sqlSchemaProperty,
  domainObjectProperty,
}: {
  sqlSchemaProperty: SqlSchemaToDomainObjectRelationship['properties'][number]['sqlSchema'];
  domainObjectProperty: SqlSchemaToDomainObjectRelationship['properties'][number]['domainObject'];
}): string | null => {
  if (!domainObjectProperty) return null;

  // a non-reference property is read by its sql column name
  if (!sqlSchemaProperty.reference) return sqlSchemaProperty.name;

  // a nested or implicitly-referenced property is read by the domain property's name
  if (
    sqlSchemaProperty.reference.method ===
      SqlSchemaReferenceMethod.DIRECT_BY_NESTING ||
    sqlSchemaProperty.reference.method ===
      SqlSchemaReferenceMethod.IMPLICIT_BY_UUID
  )
    return snakeCase(domainObjectProperty.name);

  // a declared ref carries a uuid, so its `_ref` suffix is swapped for `_uuid`
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION
  )
    return asDbObjectKeyForDeclaredRef({
      propertyName: domainObjectProperty.name,
      isArray: sqlSchemaProperty.isArray,
    });

  return null;
};
