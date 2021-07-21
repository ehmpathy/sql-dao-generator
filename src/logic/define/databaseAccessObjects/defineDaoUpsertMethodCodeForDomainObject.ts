import { camelCase } from 'change-case';
import { DomainObjectMetadata } from 'domain-objects-metadata';

import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { castDomainObjectNameToDaoName } from './castDomainObjectNameToDaoName';
import { defineOutputTypeOfFoundDomainObject } from './defineOutputTypeOfFoundDomainObject';
import {
  defineQueryFunctionInputExpressionForDomainObjectProperty,
  GetTypescriptCodeForPropertyContext,
} from './defineQueryFunctionInputExpressionForDomainObjectProperty';
import { defineQueryInputExpressionForSqlSchemaProperty } from './defineQueryInputExpressionForSqlSchemaProperty';

export const defineDaoUpsertMethodCodeForDomainObject = ({
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
  const hasUuidProperty = !!domainObject.properties.uuid;

  // define the imports
  const imports = [
    // always present imports
    `import { HasId${hasUuidProperty ? ', HasUuid' : ''} } from 'simple-type-guards';`,
    "import { DatabaseConnection } from '$PATH_TO_DATABASE_CONNECTION';",
    `import { ${domainObject.name} } from '$PATH_TO_DOMAIN_OBJECT';`, // import this domain object; note: higher level function will swap out the import path
    "import { log } from '$PATH_TO_LOG_OBJECT';",
    `import { sqlQueryUpsert${domainObject.name} } from '$PATH_TO_GENERATED_SQL_QUERY_FUNCTIONS';`,
    ...sqlSchemaRelationship.properties
      .filter(
        (propertyRelationship) =>
          propertyRelationship.sqlSchema.reference?.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING, // this property is nested directly
      )
      .map((propertyRelationship) => {
        const nameOfDaoToImport = castDomainObjectNameToDaoName(propertyRelationship.sqlSchema.reference!.of.name);
        return `import { ${nameOfDaoToImport} } from '../${nameOfDaoToImport}';`;
      })
      .sort(),
  ];

  // define the query input expressions
  const queryInputExpressions: string[] = Object.values(sqlSchemaRelationship.properties).map(
    ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
      defineQueryInputExpressionForSqlSchemaProperty({
        sqlSchemaName,
        sqlSchemaProperty,
        domainObjectProperty,
        allSqlSchemaRelationships,
      }),
  );

  // define the queryFunctionInputExpressions
  const queryFunctionInputExpressions: string[] = Object.values(sqlSchemaRelationship.properties).map(
    ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
      defineQueryFunctionInputExpressionForDomainObjectProperty({
        domainObjectName: domainObject.name,
        sqlSchemaProperty,
        domainObjectProperty,
        allSqlSchemaRelationships,
        context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
      }),
  );

  // define the output type
  const outputType = defineOutputTypeOfFoundDomainObject(domainObject);

  // define the content
  const code = `
${imports.join('\n')}

export const sql = \`
  -- query_name = upsert_${sqlSchemaName}
  SELECT
    id, uuid
  FROM upsert_${sqlSchemaName}(
    ${queryInputExpressions.join(',\n    ')}
  );
\`;

export const upsert = async ({
  dbConnection,
  ${camelCase(domainObject.name)},
}: {
  dbConnection: DatabaseConnection;
  ${camelCase(domainObject.name)}: ${domainObject.name};
}): Promise<${outputType}> => {
  const results = await sqlQueryUpsert${domainObject.name}({
    dbExecute: dbConnection.query,
    logDebug: log.debug,
    input: {
      ${queryFunctionInputExpressions.join(',\n      ')},
    },
  });
  const { id${hasUuidProperty ? ', uuid' : ''} } = result[0]; // grab the db generated values
  return new ${domainObject.name}({ ...${camelCase(domainObject.name)}, id${
    hasUuidProperty ? ', uuid' : ''
  } }) as ${outputType};
};
`.trim();

  // return the code
  return code;
};
