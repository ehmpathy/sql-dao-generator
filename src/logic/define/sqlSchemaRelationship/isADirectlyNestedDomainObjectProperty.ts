import {
  DomainObjectPropertyMetadata,
  isDomainObjectArrayProperty,
  isDomainObjectReferenceProperty,
} from 'domain-objects-metadata';

import { SqlSchemaPropertyMetadata } from '../../../domain';
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
  if (isDomainObjectReferenceProperty(propertyRelationship.domainObject))
    return true; // if its directly nested, its directly nested
  if (
    isDomainObjectArrayProperty(propertyRelationship.domainObject) &&
    isDomainObjectReferenceProperty(propertyRelationship.domainObject.of)
  )
    return true; // if its an array of directly nested objects, still true
  return false; // otherwise, false
};
