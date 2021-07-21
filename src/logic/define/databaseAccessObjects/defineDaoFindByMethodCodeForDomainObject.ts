import { snakeCase } from 'change-case';
import { DomainObjectMetadata, DomainObjectPropertyMetadata, DomainObjectPropertyType } from 'domain-objects-metadata';
import { SqlSchemaPropertyMetadata } from '../../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';

import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { defineOutputTypeOfFoundDomainObject } from './defineOutputTypeOfFoundDomainObject';
import {
  defineQueryFunctionInputExpressionForDomainObjectProperty,
  GetTypescriptCodeForPropertyContext,
} from './defineQueryFunctionInputExpressionForDomainObjectProperty';
import { defineQueryInputExpressionForSqlSchemaProperty } from './defineQueryInputExpressionForSqlSchemaProperty';
import { defineQuerySelectExpressionForSqlSchemaProperty } from './defineQuerySelectExpressionForSqlSchemaProperty';

export enum FindByQueryType {
  ID = 'Id',
  UUID = 'Uuid',
  UNIQUE = 'Unique',
}

const getTypescriptTypeForDomainObjectProperty = ({
  domainObjectProperty,
  sqlSchemaProperty,
}: {
  domainObjectProperty: DomainObjectPropertyMetadata;
  sqlSchemaProperty: SqlSchemaPropertyMetadata;
}) => {
  if (domainObjectProperty.type === DomainObjectPropertyType.STRING) return 'string';
  if (domainObjectProperty.type === DomainObjectPropertyType.NUMBER) return 'number';
  if (domainObjectProperty.type === DomainObjectPropertyType.BOOLEAN) return 'boolean';
  if (domainObjectProperty.type === DomainObjectPropertyType.DATE) return 'Date';
  if (domainObjectProperty.type === DomainObjectPropertyType.REFERENCE) {
    const referencedDomainObjectName = sqlSchemaProperty.reference!.of.name;
    return `HasId<${referencedDomainObjectName}>`;
  }
  if (domainObjectProperty.type === DomainObjectPropertyType.ARRAY) {
    if (sqlSchemaProperty.reference!.method === SqlSchemaReferenceMethod.IMPLICIT_BY_UUID) return 'string[]';
    const referencedDomainObjectName = sqlSchemaProperty.reference!.of.name;
    return `HasId<${referencedDomainObjectName}>[]`;
  }
  throw new Error('unsupported property type. this is a bug with sql-dao-generator'); // fail fast
};

export const defineDaoFindByMethodCodeForDomainObject = ({
  domainObject,
  sqlSchemaRelationship,
  allSqlSchemaRelationships,
  findByQueryType,
}: {
  domainObject: DomainObjectMetadata;
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
  allSqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
  findByQueryType: FindByQueryType;
}) => {
  // define some useful constants
  const sqlSchemaName = sqlSchemaRelationship.name.sqlSchema;
  const hasCurrentView = sqlSchemaRelationship.properties.some(
    ({ sqlSchema: sqlSchemaProperty }) => sqlSchemaProperty.isUpdatable || sqlSchemaProperty.isArray,
  );

  // define the imports
  const imports = [
    // always present imports
    "import { DatabaseConnection } from '$PATH_TO_DATABASE_CONNECTION';",
    "import { log } from '$PATH_TO_LOG_OBJECT';",
    `import { sqlQueryFind${domainObject.name}By${findByQueryType} } from '$PATH_TO_GENERATED_SQL_QUERY_FUNCTIONS';`,
    "import { fromDatabaseObject } from './cast/fromDatabaseObject';",
  ];

  // define the where conditions
  const whereConditions = (() => {
    if (findByQueryType === FindByQueryType.ID) return `${sqlSchemaName}.id = :id`;
    if (findByQueryType === FindByQueryType.UUID) return `${sqlSchemaName}.uuid = :uuid`;
    if (findByQueryType === FindByQueryType.UNIQUE) {
      const conditions = sqlSchemaRelationship.decorations.unique.sqlSchema?.map((sqlSchemaPropertyName) => {
        const propertyRelationship = sqlSchemaRelationship.properties.find(
          ({ sqlSchema: sqlSchemaProperty }) => sqlSchemaProperty.name === sqlSchemaPropertyName,
        );
        if (!propertyRelationship)
          throw new Error('could not find sqlSchemaRelationship for property. this is a bug within sql-dao-generator.'); // fail fast, this should never occur
        const { domainObject: domainObjectProperty, sqlSchema: sqlSchemaProperty } = propertyRelationship;
        return `${sqlSchemaName}.${sqlSchemaPropertyName} = ${defineQueryInputExpressionForSqlSchemaProperty({
          sqlSchemaName,
          sqlSchemaProperty,
          domainObjectProperty,
          allSqlSchemaRelationships,
        })}`;
      });
      if (!conditions)
        throw new Error('no conditions found for a findByUnique query. this is a bug within sql-dao-generator'); // should not reach here, fail fast
      return `
1=1
  ${conditions.map((condition) => `  AND ${condition}`).join('\n  ')}
      `.trim();
    }
    throw new Error('unexpected FindByQueryType. this is a bug within sql-dao-generator.'); // fail fast, should never occur
  })();

  // define the function parameters (w/ types)
  const parameters: { [index: string]: string } = (() => {
    if (findByQueryType === FindByQueryType.ID) return { id: 'number' };
    if (findByQueryType === FindByQueryType.UUID) return { uuid: 'string' };
    if (findByQueryType === FindByQueryType.UNIQUE) {
      const conditions = sqlSchemaRelationship.decorations.unique.sqlSchema?.map((sqlSchemaPropertyName) => {
        const propertyRelationship = sqlSchemaRelationship.properties.find(
          ({ sqlSchema: sqlSchemaProperty }) => sqlSchemaProperty.name === sqlSchemaPropertyName,
        );
        if (!propertyRelationship)
          throw new Error('could not find sqlSchemaRelationship for property. this is a bug within sql-dao-generator.'); // fail fast, this should never occur
        const { domainObject: domainObjectProperty, sqlSchema: sqlSchemaProperty } = propertyRelationship;
        const typeOfProperty = getTypescriptTypeForDomainObjectProperty({
          domainObjectProperty,
          sqlSchemaProperty,
        });
        return {
          [domainObjectProperty.name]: typeOfProperty,
        };
      });
      if (!conditions)
        throw new Error('no conditions found for a findByUnique query. this is a bug within sql-dao-generator'); // should not reach here, fail fast
      return conditions.reduce((mergedConditions, thisCondition) => ({ ...mergedConditions, ...thisCondition }));
    }
    throw new Error('unexpected FindByQueryType. this is a bug within sql-dao-generator.'); // fail fast, should never occur
  })();

  // define the typescriptInputExpressions
  const queryFunctionInputExpressions: string[] = (() => {
    if (findByQueryType === FindByQueryType.ID) return ['id'];
    if (findByQueryType === FindByQueryType.UUID) return ['uuid'];
    if (findByQueryType === FindByQueryType.UNIQUE) {
      const conditions = sqlSchemaRelationship.decorations.unique.sqlSchema?.map((sqlSchemaPropertyName) => {
        const propertyRelationship = sqlSchemaRelationship.properties.find(
          ({ sqlSchema: sqlSchemaProperty }) => sqlSchemaProperty.name === sqlSchemaPropertyName,
        );
        if (!propertyRelationship)
          throw new Error('could not find sqlSchemaRelationship for property. this is a bug within sql-dao-generator.'); // fail fast, this should never occur
        const { domainObject: domainObjectProperty, sqlSchema: sqlSchemaProperty } = propertyRelationship;
        return defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: domainObject.name,
          sqlSchemaProperty,
          domainObjectProperty,
          allSqlSchemaRelationships,
          context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
        });
      });
      if (!conditions)
        throw new Error('no conditions found for a findByUnique query. this is a bug within sql-dao-generator'); // should not reach here, fail fast
      return conditions;
    }
    throw new Error('unexpected FindByQueryType. this is a bug within sql-dao-generator.'); // fail fast, should never occur
  })();

  // define the output type
  const outputType = defineOutputTypeOfFoundDomainObject(domainObject);

  // define the content
  const code = `
${imports.join('\n')}

export const sql = \`
  -- query_name = find_${sqlSchemaName}_by_${snakeCase(findByQueryType)}
  SELECT
    ${sqlSchemaName}.id,
    ${sqlSchemaName}.uuid,
    ${sqlSchemaRelationship.properties
      .map(({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
        defineQuerySelectExpressionForSqlSchemaProperty({
          sqlSchemaName,
          sqlSchemaProperty,
          domainObjectProperty,
          allSqlSchemaRelationships,
        }),
      )
      .flat()
      .join(',\n    ')}
  FROM ${hasCurrentView ? `view_${sqlSchemaName}_current AS ${sqlSchemaName}` : sqlSchemaName}
  WHERE ${whereConditions};
\`;

export const findBy${findByQueryType} = async ({
  dbConnection,
  ${Object.keys(parameters).join(',\n  ')},
}: {
  dbConnection: DatabaseConnection;
  ${Object.entries(parameters)
    .map((entry) => `${entry[0]}: ${entry[1]}`)
    .join(';\n  ')};
}): Promise<${outputType}> => {
  const results = await sqlQueryFind${domainObject.name}By${findByQueryType}({
    dbExecute: dbConnection.query,
    logDebug: log.debug,
    input: {
      ${queryFunctionInputExpressions.join(',\n      ')},
    },
  });
  if (results.length > 1) throw new Error('should only be one');
  if (!results.length) return null;
  return fromDatabaseObject({ dbConnection, dbObject: results[0] });
};

`.trim();

  // return the code
  return code;
};
