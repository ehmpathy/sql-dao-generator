import {
  type DomainObjectPropertyMetadata,
  isEnumArrayProperty,
  isPrimitiveArrayProperty,
} from 'domain-objects-metadata';

/**
 * .what = whether a domain object property is a native array column — a primitive array
 *   (string[]/number[]/boolean[]/Date[]) or an enum array (Status[]).
 * .why = a native array is captured by a single postgres array column (text[]/numeric[]/enum[]/…)
 *   on the base table, unlike a reference array (a join-table relation) or a _uuids array (an
 *   implicit by-uuid reference, also a join table). schema-control uses this predicate to decide an
 *   array needs NO join table, at both its base-table and version-table passes, so that one decision
 *   can not drift between the two passes if a new primitive/enum element kind is added upstream.
 *   the schema-generator does not consume this predicate — it branches on isPrimitiveArrayProperty
 *   vs isEnumArrayProperty directly because it emits a DIFFERENT column expression per kind
 *   (prop.ARRAY_OF(prop.VARCHAR()) vs prop.ARRAY_OF(prop.ENUM([...]))). the two layers stay in
 *   agreement on the uuid-reference fork via the shared isUuidReferenceArrayProperty predicate, not
 *   this one. returns false for a null property (a database-generated column that has no
 *   domain-object property).
 * .note = evaluate this ONLY after you rule out reference and uuid-reference arrays. a `_uuids`
 *   string array passes this predicate as `true` (it is a primitive string array), yet the codebase
 *   stores it as a join table, not a native column — so a caller must check isUuidReferenceArrayProperty
 *   first, as defineArrayJoinTableRelpath does. a standalone or out-of-order call would mis-classify a
 *   `_uuids` array as a native column.
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
