import {
  type DomainObjectPropertyMetadata,
  isReferenceArrayProperty,
  isReferenceProperty,
} from 'domain-objects-metadata';

import type { SqlSchemaPropertyMetadata } from '@src/domain';

import { isAUserDefinedDomainObjectProperty } from './isAUserDefinedDomainObjectProperty';

/**
 * specifies whether this domain object property is a reference to another domain object directly by nesting (in array or solo)
 */
export const isADirectlyNestedDomainObjectProperty = (propertyRelationship: {
  domainObject: DomainObjectPropertyMetadata | null;
  sqlSchema: SqlSchemaPropertyMetadata;
}): propertyRelationship is {
  domainObject: DomainObjectPropertyMetadata;
  sqlSchema: SqlSchemaPropertyMetadata;
} => {
  if (!isAUserDefinedDomainObjectProperty(propertyRelationship)) return false; // if not user defined, then its def not a reference
  if (isReferenceProperty(propertyRelationship.domainObject)) return true; // if its directly nested, its directly nested
  if (
    isReferenceArrayProperty(propertyRelationship.domainObject) &&
    isReferenceProperty(propertyRelationship.domainObject.of)
  )
    return true; // if its an array of directly nested objects, still true
  return false; // otherwise, false
};
