import {
  type DomainObjectPropertyMetadata,
  isEnumArrayProperty,
  isPrimitiveArrayProperty,
} from 'domain-objects-metadata';

/**
 * .what = whether a domain object property is a native array column — a primitive array
 *   (string[]/number[]/boolean[]/Date[]) or an enum array (Status[])
 * .why = a native array is one postgres array column on the base table, with no join table.
 *   schema-control asks this at both its base-table and version-table passes, so the two agree
 * .note = false for a null property (a database-generated column with no domain property)
 * .note = check isUuidReferenceArrayProperty first, as defineArrayJoinTableRelpath does: a `_uuids`
 *   string array passes this predicate, yet is stored as a join table
 */
export const isNativeArrayColumnProperty = (
  domainObjectProperty: DomainObjectPropertyMetadata | null,
): boolean => {
  if (!domainObjectProperty) return false;
  return (
    isPrimitiveArrayProperty(domainObjectProperty) ||
    isEnumArrayProperty(domainObjectProperty)
  );
};
