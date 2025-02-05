import { camelCase } from 'change-case';
import { DomainObjectMetadata } from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { isNotADatabaseGeneratedProperty } from '../sqlSchemaRelationship/isNotADatabaseGeneratedProperty';
import { castDomainObjectNameToDaoName } from './castDomainObjectNameToDaoName';
import { getReferencedDomainObjectNames } from './defineDaoFindByMethodCodeForDomainObject';
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
  const isUniqueOnUuid = !!domainObject.decorations.unique?.includes('uuid');

  // define the dobj name to use in the input
  const dobjInputVarName =
    domainObject.decorations.alias ?? camelCase(domainObject.name);

  // define the imports
  const hasSomeDirectDeclarationReference =
    sqlSchemaRelationship.properties.some(
      (property) =>
        property.sqlSchema.reference &&
        [SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION].includes(
          property.sqlSchema.reference.method,
        ),
    );
  const imports = [
    ...new Set([
      // always present imports
      "import { VisualogicContext } from 'visualogic';",
      `import { HasMetadata${
        isUniqueOnUuid ? ', HasUuid' : ''
      } } from 'type-fns';`,
      hasSomeDirectDeclarationReference
        ? `import { isPrimaryKeyRef } from 'domain-objects';`
        : '',
      '', // split module from relative imports
      "import { DatabaseConnection } from '$PATH_TO_DATABASE_CONNECTION';",
      `import { ${[
        domainObject.name,
        ...getReferencedDomainObjectNames({ sqlSchemaRelationship }),
      ].join(', ')} } from '$PATH_TO_DOMAIN_OBJECT';`,
      `import { sqlQueryUpsert${domainObject.name} } from '$PATH_TO_GENERATED_SQL_QUERY_FUNCTIONS';`,
      ...sqlSchemaRelationship.properties
        .filter((property) =>
          property.sqlSchema.reference &&
          [
            SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
            SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION,
          ].includes(property.sqlSchema.reference.method)
            ? property.sqlSchema.reference.of.name
            : null,
        )
        .filter(isPresent)
        .map((propertyRelationship) => {
          const nameOfDaoToImport = castDomainObjectNameToDaoName(
            propertyRelationship.sqlSchema.reference!.of.name,
          );
          return `import { ${nameOfDaoToImport} } from '../${nameOfDaoToImport}';`;
        })
        .sort(),
    ]),
  ];

  // define the query input expressions
  const queryInputExpressions: string[] = Object.values(
    sqlSchemaRelationship.properties,
  )
    .filter(isNotADatabaseGeneratedProperty)
    .map(
      ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
        defineQueryInputExpressionForSqlSchemaProperty({
          sqlSchemaName,
          sqlSchemaProperty,
          domainObjectProperty,
          allSqlSchemaRelationships,
        }),
    );

  // define the queryFunctionInputExpressions
  const queryFunctionInputExpressions: string[] = Object.values(
    sqlSchemaRelationship.properties,
  )
    .filter(isNotADatabaseGeneratedProperty)
    .map(
      ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: domainObject.name,
          dobjInputVarName,
          sqlSchemaProperty,
          domainObjectProperty,
          allSqlSchemaRelationships,
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        }),
    );

  // define the output type
  const outputType = defineOutputTypeOfFoundDomainObject(domainObject);

  // define the db generated properties that the user has defined on their domain object
  const dbGeneratedPropertiesOnDomainObject = Object.values(
    sqlSchemaRelationship.properties,
  )
    .filter(
      ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
        sqlSchemaProperty.isDatabaseGenerated && !!domainObjectProperty, // pick the properties that are db generated and defined on the domain object
    )
    .map(({ sqlSchema: sqlSchemaProperty }) => sqlSchemaProperty.name);

  // define the content
  const code = `
${imports.join('\n')}

export const sql = \`
  -- query_name = upsert_${sqlSchemaName}
  SELECT
    ${dbGeneratedPropertiesOnDomainObject
      .map((name) => `dgv.${name}`)
      .join(', ')}
  FROM upsert_${sqlSchemaName}(
    ${queryInputExpressions.join(',\n    ')}
  ) as dgv;
\`;

export const upsert = async (
  {
    ${dobjInputVarName},
  }: {
    ${dobjInputVarName}: ${
    isUniqueOnUuid ? `HasUuid<${domainObject.name}>` : domainObject.name
  };
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<${outputType}> => {
  const results = await sqlQueryUpsert${domainObject.name}({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      ${queryFunctionInputExpressions.join(',\n      ')},
    },
  });
  const { ${dbGeneratedPropertiesOnDomainObject
    .map((sqlSchemaPropertyName) => {
      const domainObjectPropertyName = camelCase(sqlSchemaPropertyName);
      if (domainObjectPropertyName === sqlSchemaPropertyName)
        return `${domainObjectPropertyName}`;
      return `${sqlSchemaPropertyName}: ${domainObjectPropertyName}`;
    })
    .join(', ')} } = results[0]!; // grab the db generated values
  return new ${
    domainObject.name
  }({ ...${dobjInputVarName}, ${dbGeneratedPropertiesOnDomainObject
    .map((sqlSchemaPropertyName) => camelCase(sqlSchemaPropertyName))
    .join(', ')} }) as ${outputType};
};
`.trim();

  // return the code
  return code;
};
