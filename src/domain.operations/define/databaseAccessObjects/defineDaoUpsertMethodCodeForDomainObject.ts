import { camelCase } from 'change-case';
import type { DomainObjectMetadata } from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import { SqlSchemaReferenceMethod } from '@src/domain.objects/SqlSchemaReferenceMetadata';
import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';
import { isNotADatabaseGeneratedProperty } from '@src/domain.operations/define/sqlSchemaRelationship/isNotADatabaseGeneratedProperty';

import { castDomainObjectNameToDaoName } from './castDomainObjectNameToDaoName';
import { DAO_CASTS_IMPORT_PATH, DAO_CASTS_NAMESPACE } from './constants';
import { defineOutputTypeOfFoundDomainObject } from './defineOutputTypeOfFoundDomainObject';
import {
  defineQueryFunctionInputExpressionForDomainObjectProperty,
  GetTypescriptCodeForPropertyContext,
} from './defineQueryFunctionInputExpressionForDomainObjectProperty';
import { defineQueryInputExpressionForSqlSchemaProperty } from './defineQueryInputExpressionForSqlSchemaProperty';
import { getAllDbGeneratedPropertiesForUpsert } from './getAllDbGeneratedPropertiesForUpsert';
import { getReferencedDomainObjectNames } from './getReferencedDomainObjectNames';

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

  // define the db generated properties that the user has defined on their domain object
  const dbGeneratedPropertiesOnDomainObject =
    getAllDbGeneratedPropertiesForUpsert({ sqlSchemaRelationship });

  // define whether this upsert calls any shared cast, so we import the namespace only then
  const hasSomeCast = dbGeneratedPropertiesOnDomainObject.some(
    (property) => property.castName,
  );

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
        ? `import { isRefByPrimary } from 'domain-objects';`
        : '',
      '', // split module from relative imports
      "import { DatabaseConnection } from '$PATH_TO_DATABASE_CONNECTION';",
      `import { ${[
        domainObject.name,
        ...getReferencedDomainObjectNames({ sqlSchemaRelationship }),
      ].join(', ')} } from '$PATH_TO_DOMAIN_OBJECT';`,
      `import { sqlQueryUpsert${domainObject.name} } from '$PATH_TO_GENERATED_SQL_QUERY_FUNCTIONS';`,
      // note: ONE symbol, however many casts — they are members of one namespace, so the import
      //   line is the same whether this upsert calls one cast or both
      ...(hasSomeCast
        ? [`import { ${DAO_CASTS_NAMESPACE} } from '${DAO_CASTS_IMPORT_PATH}';`]
        : []),
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

  /**
   * .what = the properties the CALLER supplies to an upsert
   * .why  = the database generates the rest (`id`, `uuid`, `created_at`). the sql and the
   *         query-function expressions both render this one set, so they agree on what is written
   */
  const propertiesSuppliedByCaller = Object.values(
    sqlSchemaRelationship.properties,
  ).filter(isNotADatabaseGeneratedProperty);

  // define the sql expression each supplied property takes inside the upsert's own query
  const queryInputExpressions: string[] = propertiesSuppliedByCaller.map(
    ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
      defineQueryInputExpressionForSqlSchemaProperty({
        sqlSchemaName,
        sqlSchemaProperty,
        domainObjectProperty,
        allSqlSchemaRelationships,
      }),
  );

  // define the typescript expression each supplied property takes at the query function call
  const queryFunctionInputExpressions: string[] =
    propertiesSuppliedByCaller.map(
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

  // define the content
  const code = `
${imports.join('\n')}

export const sql = \`
  -- query_name = upsert_${sqlSchemaName}
  SELECT
    ${dbGeneratedPropertiesOnDomainObject
      .map((property) => `dgv.${property.sqlSchemaName}`)
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
    .map((property) => {
      if (property.domainObjectName === property.sqlSchemaName)
        return `${property.domainObjectName}`;
      return `${property.sqlSchemaName}: ${property.domainObjectName}`;
    })
    .join(', ')} } = results[0]!; // grab the db generated values
  return new ${
    domainObject.name
  }({ ...${dobjInputVarName}, ${dbGeneratedPropertiesOnDomainObject
    .map((property) => {
      // no divergence for this type, so read it directly
      if (!property.castName) return property.domainObjectName;

      // otherwise, cast at the boundary, so the declared domain type is true on this path too
      return `${property.domainObjectName}: ${property.castName}(${property.domainObjectName})`;
    })
    .join(', ')} }) as ${outputType};
};
`.trim();

  // return the code
  return code;
};
