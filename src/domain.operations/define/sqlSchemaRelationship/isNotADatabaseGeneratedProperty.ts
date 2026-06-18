import type { DomainObjectPropertyMetadata } from 'domain-objects-metadata';

import type { SqlSchemaPropertyMetadata } from '@src/domain';

export const isNotADatabaseGeneratedProperty = (propertyRelationship: {
  domainObject: DomainObjectPropertyMetadata | null;
  sqlSchema: SqlSchemaPropertyMetadata;
}): propertyRelationship is {
  domainObject: DomainObjectPropertyMetadata;
  sqlSchema: SqlSchemaPropertyMetadata;
} => !propertyRelationship.sqlSchema.isDatabaseGenerated;
