import {
  DomainObjectPropertyMetadata,
  isDomainObjectArrayProperty,
  isDomainObjectReferenceProperty,
} from 'domain-objects-metadata';

import {
  SqlSchemaPropertyMetadata,
  SqlSchemaReferenceMethod,
} from '../../../domain';
import { isAUserDefinedDomainObjectProperty } from './isAUserDefinedDomainObjectProperty';

/**
 * specifies whether this domain object property is a reference to another domain object implicitly by uuid (in array or solo)
 */
export const isAnImplicitlyReferencedDomainObjectProperty =
  (propertyRelationship: {
    domainObject: DomainObjectPropertyMetadata | null;
    sqlSchema: SqlSchemaPropertyMetadata;
  }): propertyRelationship is {
    domainObject: DomainObjectPropertyMetadata;
    sqlSchema: SqlSchemaPropertyMetadata;
  } => {
    if (!isAUserDefinedDomainObjectProperty(propertyRelationship)) return false; // if not user defined, then its defo not a reference
    if (
      propertyRelationship.sqlSchema.reference?.method ===
      SqlSchemaReferenceMethod.IMPLICIT_BY_UUID
    )
      return true;
    return false;
  };
