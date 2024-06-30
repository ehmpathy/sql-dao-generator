import { DomainObjectMetadata } from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import { SqlSchemaToDomainObjectRelationship } from '../../../domain';
import { defineQuerySelectExpressionForSqlSchemaProperty } from '../databaseAccessObjects/defineQuerySelectExpressionForSqlSchemaProperty';

export const defineSqlSchemaViewDomainObjectHydrated = ({
  domainObject,
  sqlSchemaRelationship,
  allSqlSchemaRelationships,
}: {
  domainObject: DomainObjectMetadata;
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
  allSqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}) => {
  // define some useful constants
  const sqlSchemaName = sqlSchemaRelationship.name.sqlSchema;
  const hasCurrentView = sqlSchemaRelationship.properties.some(
    ({ sqlSchema: sqlSchemaProperty }) =>
      sqlSchemaProperty.isUpdatable || sqlSchemaProperty.isArray,
  );
  const sql = `
CREATE OR REPLACE VIEW view_${sqlSchemaName}_hydrated AS
  SELECT
    ${sqlSchemaRelationship.properties
      .map(
        ({
          sqlSchema: sqlSchemaProperty,
          domainObject: domainObjectProperty,
        }) => {
          if (!domainObjectProperty) return null;
          return defineQuerySelectExpressionForSqlSchemaProperty({
            sqlSchemaName,
            sqlSchemaProperty,
            domainObjectProperty,
            allSqlSchemaRelationships,
          });
        },
      )
      .filter(isPresent)
      .flat()
      .join(',\n    ')}
  FROM ${
    hasCurrentView
      ? `view_${sqlSchemaName}_current AS ${sqlSchemaName}`
      : sqlSchemaName
  };
  `.trim();
  return sql;
};
