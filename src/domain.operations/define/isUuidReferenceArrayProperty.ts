import {
  type DomainObjectPropertyMetadata,
  DomainObjectPropertyType,
  isPrimitiveArrayProperty,
} from 'domain-objects-metadata';

/**
 * .what = whether an array property is an implicit by-uuid reference array — a `_uuids`-suffixed
 *   array of primitive strings (e.g. photo_uuids: string[]), which this repo stores as
 *   prop.ARRAY_OF(prop.UUID()) / a uuid join table rather than as a native primitive array.
 * .why = the schema-generator (which emits the column) and the schema-control (which declares the
 *   join-table resource) must agree on exactly which arrays are uuid-reference arrays. if they
 *   diverge, the manifest declares a join table the generator never builds, and the mismatch only
 *   surfaces later as an absent-file error at apply time. this is the one predicate both layers
 *   consume, so the name-based heuristic can not drift from the element-type check. a `_uuids`
 *   array whose element is NOT a string (e.g. score_uuids: number[]) is a native primitive array,
 *   not a uuid reference, and must fall through to the native-array branch in BOTH layers.
 *   `name` is the sql-schema property name (where the `_uuids` suffix lives); a null
 *   domainObjectProperty (a database-generated column) is never a uuid reference array.
 */
export const isUuidReferenceArrayProperty = ({
  name,
  domainObjectProperty,
}: {
  name: string;
  domainObjectProperty: DomainObjectPropertyMetadata | null;
}): boolean => {
  const endsWithUuidsSuffix = new RegExp(/_uuids$/).test(name);
  if (!endsWithUuidsSuffix) return false;
  if (!domainObjectProperty) return false;
  return (
    isPrimitiveArrayProperty(domainObjectProperty) &&
    domainObjectProperty.of.type === DomainObjectPropertyType.STRING
  );
};
