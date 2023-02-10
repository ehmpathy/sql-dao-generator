import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';

import { SqlSchemaPropertyMetadata } from '../../../domain';

export const isNotADatabaseGeneratedProperty = (propertyRelationship: {
  domainObject: DomainObjectPropertyMetadata | null;
  sqlSchema: SqlSchemaPropertyMetadata;
}): propertyRelationship is {
  domainObject: DomainObjectPropertyMetadata;
  sqlSchema: SqlSchemaPropertyMetadata;
} => !propertyRelationship.sqlSchema.isDatabaseGenerated;
