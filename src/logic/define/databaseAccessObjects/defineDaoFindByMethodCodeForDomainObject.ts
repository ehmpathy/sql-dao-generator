import { camelCase, snakeCase } from 'change-case';
import {
  DomainObjectMetadata,
  DomainObjectPropertyMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
  isDomainObjectArrayProperty,
  isDomainObjectReferenceProperty,
} from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import { SqlSchemaPropertyMetadata } from '../../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { castDomainObjectNameToDaoName } from './castDomainObjectNameToDaoName';
import { defineOutputTypeOfFoundDomainObject } from './defineOutputTypeOfFoundDomainObject';
import {
  defineQueryFunctionInputExpressionForDomainObjectProperty,
  GetTypescriptCodeForPropertyContext,
} from './defineQueryFunctionInputExpressionForDomainObjectProperty';
import { defineQueryInputExpressionForSqlSchemaProperty } from './defineQueryInputExpressionForSqlSchemaProperty';

export enum FindByQueryType {
  ID = 'Id',
  UUID = 'Uuid',
  UNIQUE = 'Unique',
}

const getTypescriptTypeForDomainObjectProperty = ({
  domainObjectName,
  domainObjectProperty,
  sqlSchemaProperty,
}: {
  domainObjectName: string;
  domainObjectProperty: DomainObjectPropertyMetadata;
  sqlSchemaProperty: SqlSchemaPropertyMetadata;
}) => {
  if (domainObjectProperty.type === DomainObjectPropertyType.STRING)
    return 'string';
  if (domainObjectProperty.type === DomainObjectPropertyType.NUMBER)
    return 'number';
  if (domainObjectProperty.type === DomainObjectPropertyType.BOOLEAN)
    return 'boolean';
  if (domainObjectProperty.type === DomainObjectPropertyType.DATE)
    return 'Date';
  if (domainObjectProperty.type === DomainObjectPropertyType.ENUM)
    return `${domainObjectName}['${domainObjectProperty.name}']`;
  if (domainObjectProperty.type === DomainObjectPropertyType.REFERENCE) {
    const referencedDomainObjectName = sqlSchemaProperty.reference!.of.name;
    return referencedDomainObjectName;
  }
  if (domainObjectProperty.type === DomainObjectPropertyType.ARRAY) {
    if (
      sqlSchemaProperty.reference!.method ===
      SqlSchemaReferenceMethod.IMPLICIT_BY_UUID
    )
      return 'string[]';
    const referencedDomainObjectName = sqlSchemaProperty.reference!.of.name;
    return `${referencedDomainObjectName}[]`;
  }
  throw new UnexpectedCodePathDetectedError({
    reason:
      'unsupported property type. could not get typescript type for domain object property',
    domainObjectName,
    domainObjectPropertyName: domainObjectProperty.name,
  }); // fail fast
};

export const getReferencedDomainObjectNames = (input: {
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
}): string[] => {
  const referencedDomainObjectNames = input.sqlSchemaRelationship.properties
    .map(
      ({
        domainObject: domainObjectProperty,
        sqlSchema: sqlSchemaProperty,
      }) => {
        // if its not explicitly defined property, then not needed in imports
        if (!domainObjectProperty) return null;

        // if its not part of the unique key, then its not needed in imports
        if (
          !input.sqlSchemaRelationship.decorations.unique.sqlSchema?.includes(
            sqlSchemaProperty.name,
          )
        )
          return null;

        // if its a solo reference to a domain literal, then its needed
        if (isDomainObjectReferenceProperty(domainObjectProperty))
          return domainObjectProperty.of.name;

        // if its a array reference to a domain literal, then its needed
        if (
          isDomainObjectArrayProperty(domainObjectProperty) &&
          isDomainObjectReferenceProperty(domainObjectProperty.of)
        )
          return domainObjectProperty.of.of.name;

        // otherwise, we dont care about it
        return null;
      },
    )
    .filter(isPresent);
  return referencedDomainObjectNames;
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
    ({ sqlSchema: sqlSchemaProperty }) =>
      sqlSchemaProperty.isUpdatable || sqlSchemaProperty.isArray,
  );

  // define the dobj name to use in the input
  const dobjInputVarName =
    domainObject.decorations.alias ?? camelCase(domainObject.name);

  // define which domain objects are referenced in this method
  const referencedDomainObjectNames = [
    ...new Set([
      domainObject.name, // the domain object itself is always referenced
      ...(findByQueryType === FindByQueryType.UNIQUE
        ? getReferencedDomainObjectNames({ sqlSchemaRelationship })
        : []),
    ]),
  ];

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
      `import { HasMetadata } from 'type-fns';`,
      hasSomeDirectDeclarationReference
        ? `import { isPrimaryKeyRef } from 'domain-objects';`
        : '',
      '', // split module from relative imports
      "import { DatabaseConnection } from '$PATH_TO_DATABASE_CONNECTION';",
      "import { log } from '$PATH_TO_LOG_OBJECT';",
      `import { ${referencedDomainObjectNames
        .sort()
        .join(', ')} } from '$PATH_TO_DOMAIN_OBJECT';`,
      `import { sqlQueryFind${domainObject.name}By${findByQueryType} } from '$PATH_TO_GENERATED_SQL_QUERY_FUNCTIONS';`,
      "import { castFromDatabaseObject } from './castFromDatabaseObject';",
      ...sqlSchemaRelationship.properties
        .map((property) =>
          property.sqlSchema.reference &&
          [
            SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
            SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION,
          ].includes(property.sqlSchema.reference.method)
            ? property.sqlSchema.reference.of.name
            : null,
        )
        .filter(isPresent)
        .filter((nestedDomainObjectName) =>
          referencedDomainObjectNames.includes(nestedDomainObjectName),
        )
        .map((referencedDomainObjectName) => {
          const nameOfDaoToImport = castDomainObjectNameToDaoName(
            referencedDomainObjectName,
          );
          return `import { ${nameOfDaoToImport} } from '../${nameOfDaoToImport}';`;
        })
        .sort(),
    ]),
  ];

  // define the where conditions
  const whereConditions = (() => {
    if (findByQueryType === FindByQueryType.ID)
      return `${sqlSchemaName}.id = :id`;
    if (findByQueryType === FindByQueryType.UUID)
      return `${sqlSchemaName}.uuid = :uuid`;
    if (findByQueryType === FindByQueryType.UNIQUE) {
      const conditions =
        sqlSchemaRelationship.decorations.unique.sqlSchema?.map(
          (sqlSchemaPropertyName) => {
            const propertyRelationship = sqlSchemaRelationship.properties.find(
              ({ sqlSchema: sqlSchemaProperty }) =>
                sqlSchemaProperty.name === sqlSchemaPropertyName,
            );
            if (!propertyRelationship)
              throw new UnexpectedCodePathDetectedError({
                reason:
                  'could not find sqlSchemaRelationship for property, for where conditions in generating find by method',
                domainObjectName: domainObject.name,
                domainObjectPropertyName: camelCase(sqlSchemaPropertyName),
              }); // fail fast, this should never occur
            if (!propertyRelationship.domainObject)
              throw new UnexpectedCodePathDetectedError({
                reason:
                  'propertyRelationship.domainObject for property was not defined, for where conditions in generating find by method',
                domainObjectName: domainObject.name,
                domainObjectPropertyName: camelCase(sqlSchemaPropertyName),
              }); // fail fast, this should never occur
            const {
              domainObject: domainObjectProperty,
              sqlSchema: sqlSchemaProperty,
            } = propertyRelationship;
            const isDirectlyNestedDomainLiteral = Boolean(
              sqlSchemaProperty.reference,
            );
            const sourceTableAlias = isDirectlyNestedDomainLiteral
              ? `view_${sqlSchemaName}_current`
              : sqlSchemaName;
            return `${sourceTableAlias}.${sqlSchemaPropertyName} = ${defineQueryInputExpressionForSqlSchemaProperty(
              {
                sqlSchemaName,
                sqlSchemaProperty,
                domainObjectProperty,
                allSqlSchemaRelationships,
              },
            )}`;
          },
        );
      if (!conditions)
        throw new UnexpectedCodePathDetectedError({
          reason: 'no conditions found for a findByUnique query',
          domainObjectName: domainObject.name,
        }); // should not reach here, fail fast
      return `
1=1
  ${conditions.map((condition) => `  AND ${condition}`).join('\n  ')}
      `.trim();
    }
    throw new UnexpectedCodePathDetectedError({
      reason: 'unexpected FindByQueryType',
      domainObjectName: domainObject.name,
    }); // should not reach here, fail fast
  })();

  // define the function parameters (w/ types)
  const parameters: { [index: string]: string } = (() => {
    if (findByQueryType === FindByQueryType.ID) return { id: 'number' };
    if (findByQueryType === FindByQueryType.UUID) return { uuid: 'string' };
    if (findByQueryType === FindByQueryType.UNIQUE) {
      const conditions =
        sqlSchemaRelationship.decorations.unique.sqlSchema?.map(
          (sqlSchemaPropertyName) => {
            const propertyRelationship = sqlSchemaRelationship.properties.find(
              ({ sqlSchema: sqlSchemaProperty }) =>
                sqlSchemaProperty.name === sqlSchemaPropertyName,
            );
            if (!propertyRelationship)
              throw new UnexpectedCodePathDetectedError({
                reason:
                  'could not find sqlSchemaRelationship for property, for parameters in generating find by method',
                domainObjectName: domainObject.name,
                domainObjectPropertyName: camelCase(sqlSchemaPropertyName),
              }); // fail fast, this should never occur
            if (!propertyRelationship.domainObject)
              throw new UnexpectedCodePathDetectedError({
                reason:
                  'propertyRelationship.domainObject for property was not defined, for parameters in generating find by method',
                domainObjectName: domainObject.name,
                domainObjectPropertyName: camelCase(sqlSchemaPropertyName),
              }); // fail fast, this should never occur
            const {
              domainObject: domainObjectProperty,
              sqlSchema: sqlSchemaProperty,
            } = propertyRelationship;
            const typeOfProperty = getTypescriptTypeForDomainObjectProperty({
              domainObjectProperty,
              sqlSchemaProperty,
              domainObjectName: domainObject.name,
            });
            return {
              [domainObjectProperty.name]: typeOfProperty,
            };
          },
        );
      if (!conditions)
        throw new UnexpectedCodePathDetectedError({
          reason: 'no conditions found for a findByUnique query',
          domainObjectName: domainObject.name,
        }); // should not reach here, fail fast
      return conditions.reduce((mergedConditions, thisCondition) => ({
        ...mergedConditions,
        ...thisCondition,
      }));
    }
    throw new UnexpectedCodePathDetectedError({
      reason: 'unexpected FindByQueryType',
      domainObjectName: domainObject.name,
    }); // should not reach here, fail fast
  })();

  // define the typescriptInputExpressions
  const queryFunctionInputExpressions: string[] = (() => {
    if (findByQueryType === FindByQueryType.ID) return ['id'];
    if (findByQueryType === FindByQueryType.UUID) return ['uuid'];
    if (findByQueryType === FindByQueryType.UNIQUE) {
      const conditions =
        sqlSchemaRelationship.decorations.unique.sqlSchema?.map(
          (sqlSchemaPropertyName) => {
            const propertyRelationship = sqlSchemaRelationship.properties.find(
              ({ sqlSchema: sqlSchemaProperty }) =>
                sqlSchemaProperty.name === sqlSchemaPropertyName,
            );
            if (!propertyRelationship)
              throw new UnexpectedCodePathDetectedError({
                reason:
                  'could not find sqlSchemaRelationship for property, for  query fn input expressions  in generating find by method',
                domainObjectName: domainObject.name,
                domainObjectPropertyName: camelCase(sqlSchemaPropertyName),
              }); // fail fast, this should never occur
            if (!propertyRelationship.domainObject)
              throw new UnexpectedCodePathDetectedError({
                reason:
                  'propertyRelationship.domainObject for property was not defined, for query fn input expressions in generating find by method',
                domainObjectName: domainObject.name,
                domainObjectPropertyName: camelCase(sqlSchemaPropertyName),
              }); // fail fast, this should never occur
            const {
              domainObject: domainObjectProperty,
              sqlSchema: sqlSchemaProperty,
            } = propertyRelationship;
            return defineQueryFunctionInputExpressionForDomainObjectProperty({
              domainObjectName: domainObject.name,
              dobjInputVarName,
              sqlSchemaProperty,
              domainObjectProperty,
              allSqlSchemaRelationships,
              context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
            });
          },
        );
      if (!conditions)
        throw new UnexpectedCodePathDetectedError({
          reason: 'no conditions found for a findByUnique query',
          domainObjectName: domainObject.name,
        }); // should not reach here, fail fast
      return conditions;
    }
    throw new UnexpectedCodePathDetectedError({
      reason: 'unexpected FindByQueryType',
      domainObjectName: domainObject.name,
    }); // should not reach here, fail fast
  })();

  // define the output type
  const outputType = defineOutputTypeOfFoundDomainObject(domainObject);

  // define whether there was a directly nested  dobjs
  const hasReferenceInUniqueKey = sqlSchemaRelationship.properties.some(
    (property) =>
      property.sqlSchema.reference &&
      sqlSchemaRelationship.decorations.unique.sqlSchema?.includes(
        property.sqlSchema.name,
      ),
  );

  // define the content
  const code = `
${imports.join('\n')}

export const sql = \`
  -- query_name = find_${sqlSchemaName}_by_${snakeCase(findByQueryType)}
  SELECT
    ${sqlSchemaRelationship.properties
      .map(({ domainObject: domainObjectProperty }) =>
        !domainObjectProperty
          ? null
          : `${sqlSchemaName}.${
              isDomainObjectReferenceProperty(domainObjectProperty) &&
              domainObjectProperty.of.extends ===
                DomainObjectVariant.DOMAIN_ENTITY // if its a DIRECT_BY_DECLARATION reference, then replace the name; // todo: upgrade to selecting the full ref-by-unique instead and leverage that to stop renaming adhoc to _uuid
                ? snakeCase(domainObjectProperty.name)
                    .replace(/_refs$/, '_uuids')
                    .replace(/_ref$/, '_uuid')
                : snakeCase(domainObjectProperty.name)
            }`,
      )
      .filter(isPresent)
      .join(',\n    ')}
  ${[
    `FROM view_${sqlSchemaName}_hydrated AS ${sqlSchemaName}`,
    hasReferenceInUniqueKey && findByQueryType === FindByQueryType.UNIQUE
      ? hasCurrentView
        ? `JOIN view_${sqlSchemaName}_current ON ${sqlSchemaName}.id = view_${sqlSchemaName}_current.id`
        : `JOIN ${sqlSchemaName} as view_${sqlSchemaName}_current ON ${sqlSchemaName}.id = view_${sqlSchemaName}_current.id` // todo: upgrade schemas to always supply a "current" view && _static table
      : null,
  ]
    .filter(isPresent)
    .join('\n  ')}
  WHERE ${whereConditions};
\`;

export const findBy${findByQueryType} = async (
  {
    ${Object.keys(parameters).join(',\n    ')},
  }: {
    ${Object.entries(parameters)
      .map((entry) => `${entry[0]}: ${entry[1]}`)
      .join(';\n    ')};
  },
  context: { dbConnection: DatabaseConnection },
): Promise<${outputType} | null> => {
  const results = await sqlQueryFind${domainObject.name}By${findByQueryType}({
    dbExecute: context.dbConnection.query,
    logDebug: log.debug,
    input: {
      ${queryFunctionInputExpressions.join(',\n      ')},
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};

`.trim();

  // return the code
  return code;
};
