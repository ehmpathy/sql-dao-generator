import type { SqlSchemaPropertyMetadata } from '@src/domain.objects/SqlSchemaPropertyMetadata';

/**
 * .what = whether a sql-schema property is a native array column (text[]/numeric[]/enum[]), not a relation
 * .why = the unique-key guard depends on it. both reference arrays and `_uuids` arrays carry a
 *   `.reference`, so `isArray && !reference` is exactly a native array column
 * .note = not interchangeable with isNativeArrayColumnProperty: a `_uuids` string array is native at
 *   the domain layer but a relation here, so only this one allows `_uuids` in a unique key
 */
export const isNonReferenceArrayColumn = (
  sqlSchemaProperty: SqlSchemaPropertyMetadata,
): boolean => sqlSchemaProperty.isArray && !sqlSchemaProperty.reference;
