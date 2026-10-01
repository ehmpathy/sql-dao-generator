import {
  type DomainObjectPropertyMetadata,
  DomainObjectPropertyType,
  isPrimitiveArrayProperty,
} from 'domain-objects-metadata';

/**
 * .what = whether an array property is an implicit by-uuid reference array — a `_uuids`-suffixed
 *   string array (e.g. photo_uuids: string[]), stored as a uuid join table, not a native array
 * .why = the schema-generator and schema-control both consume this one predicate, so the manifest
 *   never declares a join table the generator never builds (an absent-file error at apply time)
 * .note = a non-string `_uuids` array (score_uuids: number[]) is a native array
 * .note = `name` is the sql-schema property name; a null domainObjectProperty is never one
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
