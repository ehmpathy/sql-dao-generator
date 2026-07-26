import type { SqlSchemaPropertyMetadata } from '@src/domain.objects/SqlSchemaPropertyMetadata';

/**
 * .what = whether a sql-schema property is a non-reference array column — an array that lives as a
 *   native inline column on the table (e.g. text[]/numeric[]/enum[]), NOT a relation.
 * .why = names the sql-layer classification the unique-key guard depends on, so the intent reads at
 *   the call site and the three-way array split does not silently drift at this fourth site. it keys
 *   on the post-classification sql metadata: a `.reference` is set for BOTH a domain-object-reference
 *   array AND a `_uuids` implicit-by-uuid reference array (both become relations / join tables), so
 *   `isArray && !reference` is exactly a native primitive/enum array column. this is the sql-layer
 *   twin of the domain-layer isNativeArrayColumnProperty, and they are deliberately NOT
 *   interchangeable: a `_uuids` string array is a native array at the domain layer (a primitive
 *   string array) but a relation at the sql layer (it carries a `.reference`), so only this
 *   sql-metadata predicate correctly excludes the allowed `_uuids`-in-unique-key case.
 */
export const isNonReferenceArrayColumn = (
  sqlSchemaProperty: SqlSchemaPropertyMetadata,
): boolean => sqlSchemaProperty.isArray && !sqlSchemaProperty.reference;
