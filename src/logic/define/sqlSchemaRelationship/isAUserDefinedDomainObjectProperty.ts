import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';
import { SqlSchemaPropertyMetadata } from '../../../domain';

/**
 * specifies whether this domain object property was defined by the user (as opposed to just existing because its something that the db will be tracking regardless, e.g., created_at)
 *
 * this changes per domain object, since some domain objects _do_ get created_at defined as a property explicitly (when useful)
 */
export const isAUserDefinedDomainObjectProperty = (propertyRelationship: {
  domainObject: DomainObjectPropertyMetadata | null;
  sqlSchema: SqlSchemaPropertyMetadata;
}): propertyRelationship is { domainObject: DomainObjectPropertyMetadata; sqlSchema: SqlSchemaPropertyMetadata } =>
  !!propertyRelationship.domainObject;
