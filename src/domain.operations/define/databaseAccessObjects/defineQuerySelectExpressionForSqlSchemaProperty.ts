import { camelCase, snakeCase } from 'change-case';
import type { DomainObjectPropertyMetadata } from 'domain-objects-metadata';

import type { SqlSchemaPropertyMetadata } from '@src/domain.objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '@src/domain.objects/SqlSchemaReferenceMetadata';
import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';
import { asDbObjectKeyForDeclaredRef } from '@src/domain.operations/define/databaseAccessObjects/asDbObjectKeyForDeclaredRef';
import { getOneDbObjectKeyForProperty } from '@src/domain.operations/define/databaseAccessObjects/getOneDbObjectKeyForProperty';
import { isAUserDefinedDomainObjectProperty } from '@src/domain.operations/define/sqlSchemaRelationship/isAUserDefinedDomainObjectProperty';
import { UnexpectedCodePathDetectedError } from '@src/domain.operations/UnexpectedCodePathDetectedError';

/**
 * .what = the key a nested property is written under, inside `json_build_object`
 * .why  = the nested dobj's cast reads each key via `getOneDbObjectKeyForProperty`; the same
 *         function names the key here, so the json object and the cast agree by construction
 */
const asJsonKeyForNestedProperty = (
  input: Parameters<typeof getOneDbObjectKeyForProperty>[0],
): string => {
  const key = getOneDbObjectKeyForProperty(input);
  if (key === null)
    throw new UnexpectedCodePathDetectedError({
      reason:
        'could not derive a json key for a nested property, for query select expression',
      domainObjectPropertyName: input.domainObjectProperty?.name,
    });
  return key;
};

const indentByNestingDepth = ({
  depthOfNesting,
  selectExpression,
}: {
  depthOfNesting: number;
  selectExpression: string;
}) => {
  const prefix = Array(depthOfNesting + 2)
    .fill('  ')
    .join('');
  return selectExpression
    .split('\n')
    .map((str) => `${prefix}${str}`)
    .join('\n')
    .trim();
};

export const defineQuerySelectExpressionForSqlSchemaProperty = ({
  sqlSchemaName,
  sqlSchemaProperty,
  domainObjectProperty,
  allSqlSchemaRelationships,
  depthOfNesting = 0,
}: {
  sqlSchemaName: string;
  sqlSchemaProperty: SqlSchemaPropertyMetadata;
  domainObjectProperty: DomainObjectPropertyMetadata;
  allSqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
  depthOfNesting?: number;
}): string => {
  // simple case: property is represented in the db simply as a standard column
  if (!sqlSchemaProperty.reference)
    return `${sqlSchemaName}.${sqlSchemaProperty.name}`;

  // since we know its a reference, lookup the referenced sqlSchemaRelationship
  const referencedSqlSchemaRelationship = allSqlSchemaRelationships.find(
    (rel) => rel.name.domainObject === sqlSchemaProperty.reference!.of.name,
  );
  if (!referencedSqlSchemaRelationship)
    throw new UnexpectedCodePathDetectedError({
      reason:
        'could not find referenced sql schema relationship for defining query input expression',
      domainObjectName: snakeCase(sqlSchemaName),
      domainObjectPropertyName: domainObjectProperty.name,
    }); // fail fast, this should not occur
  const referencedSqlSchemaName =
    referencedSqlSchemaRelationship.name.sqlSchema;
  const referencedSqlSchemaHasCurrentView =
    referencedSqlSchemaRelationship.properties.some(
      ({ sqlSchema: thisSqlSchemaProperty }) =>
        thisSqlSchemaProperty.isUpdatable || thisSqlSchemaProperty.isArray,
    );
  const fromSqlSchemaExpression = referencedSqlSchemaHasCurrentView
    ? `view_${referencedSqlSchemaName}_current AS ${referencedSqlSchemaName}` // todo: make the `current` view take the default namespace, so that we dont have to do this check anymore; e.g., the static table should always have `_static` suffix and the view should always be the interface, for backwards compat and evolvability
    : referencedSqlSchemaName;
  const selectExpressionAlias =
    depthOfNesting === 0 ? ` AS ${snakeCase(domainObjectProperty.name)}` : ''; // alias only required on root level property, not nested ones, since those are named through json syntax already

  // reference by implicit uuid case
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.IMPLICIT_BY_UUID
  ) {
    // solo case
    if (!sqlSchemaProperty.isArray)
      return `
    (
      SELECT ${referencedSqlSchemaName}.uuid
      FROM ${fromSqlSchemaExpression} WHERE ${referencedSqlSchemaName}.id = ${sqlSchemaName}.${sqlSchemaProperty.name}
    )${selectExpressionAlias}
          `.trim();

    // array case
    return `
    (
      SELECT COALESCE(array_agg(${referencedSqlSchemaName}.uuid ORDER BY ${referencedSqlSchemaName}_ref.array_order_index), array[]::uuid[]) AS array_agg
      FROM ${fromSqlSchemaExpression}
      JOIN unnest(${sqlSchemaName}.${sqlSchemaProperty.name}) WITH ORDINALITY
        AS ${referencedSqlSchemaName}_ref (id, array_order_index)
        ON ${referencedSqlSchemaName}.id = ${referencedSqlSchemaName}_ref.id
    )${selectExpressionAlias}
      `.trim();
  }

  // directly declared reference
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION
  ) {
    // a declared ref is persisted as the referenced entity's uuid, so the alias names the column
    // the query reads from (`owner_uuid`), never how it was declared (`owner_ref`)
    // todo: return a json object of the ref, preferably in ref-by-unique shape
    const selectExpressionAliasForDeclaredRef =
      depthOfNesting === 0
        ? ` AS ${asDbObjectKeyForDeclaredRef({
            propertyName: domainObjectProperty.name,
            isArray: sqlSchemaProperty.isArray,
          })}`
        : '';

    // solo case;
    if (!sqlSchemaProperty.isArray)
      return `
    (
      SELECT ${referencedSqlSchemaName}.uuid
      FROM ${fromSqlSchemaExpression} WHERE ${referencedSqlSchemaName}.id = ${sqlSchemaName}.${
        sqlSchemaProperty.name
      }
    )${selectExpressionAliasForDeclaredRef}
          `.trim();

    // array case
    return `
    (
      SELECT COALESCE(array_agg(${referencedSqlSchemaName}.uuid ORDER BY ${referencedSqlSchemaName}_ref.array_order_index), array[]::uuid[]) AS array_agg
      FROM ${fromSqlSchemaExpression}
      JOIN unnest(${sqlSchemaName}.${sqlSchemaProperty.name}) WITH ORDINALITY
        AS ${referencedSqlSchemaName}_ref (id, array_order_index)
        ON ${referencedSqlSchemaName}.id = ${referencedSqlSchemaName}_ref.id
    )${selectExpressionAliasForDeclaredRef}
      `.trim();
  }

  // directly nested reference case
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.DIRECT_BY_NESTING
  ) {
    // solo case
    if (!sqlSchemaProperty.isArray) {
      return `
    (
      SELECT json_build_object(
        ${referencedSqlSchemaRelationship.properties
          .filter(isAUserDefinedDomainObjectProperty)
          .map(
            ({
              sqlSchema: referencedSqlSchemaProperty,
              domainObject: referencedDomainObjectProperty,
            }) => {
              const jsonKey = asJsonKeyForNestedProperty({
                sqlSchemaProperty: referencedSqlSchemaProperty,
                domainObjectProperty: referencedDomainObjectProperty,
              });
              const jsonValueSelectExpression = indentByNestingDepth({
                depthOfNesting,
                selectExpression:
                  defineQuerySelectExpressionForSqlSchemaProperty({
                    sqlSchemaName: referencedSqlSchemaName,
                    sqlSchemaProperty: referencedSqlSchemaProperty,
                    domainObjectProperty: referencedDomainObjectProperty,
                    allSqlSchemaRelationships,
                    depthOfNesting: depthOfNesting + 1,
                  }),
              });
              return `'${jsonKey}', ${jsonValueSelectExpression}`;
            },
          )
          .join(',\n        ')}
      ) AS json_build_object
      FROM ${fromSqlSchemaExpression} WHERE ${referencedSqlSchemaName}.id = ${sqlSchemaName}.${
        sqlSchemaProperty.name
      }
    )${selectExpressionAlias}
        `.trim();
    }

    // array case
    return `
    (
      SELECT COALESCE(
        json_agg(
          json_build_object(
            ${referencedSqlSchemaRelationship.properties
              .filter(isAUserDefinedDomainObjectProperty)
              .map(
                ({
                  sqlSchema: referencedSqlSchemaProperty,
                  domainObject: referencedDomainObjectProperty,
                }) => {
                  const jsonKey = asJsonKeyForNestedProperty({
                    sqlSchemaProperty: referencedSqlSchemaProperty,
                    domainObjectProperty: referencedDomainObjectProperty,
                  });
                  const jsonValueSelectExpression = indentByNestingDepth({
                    depthOfNesting: depthOfNesting + 2, // 2, because we wrap in COALESCE + json_agg + json_build_object + its own padding
                    selectExpression:
                      defineQuerySelectExpressionForSqlSchemaProperty({
                        sqlSchemaName: referencedSqlSchemaName,
                        sqlSchemaProperty: referencedSqlSchemaProperty,
                        domainObjectProperty: referencedDomainObjectProperty,
                        allSqlSchemaRelationships,
                        depthOfNesting: depthOfNesting + 1 + 2, // 2, because we wrap in COALESCE + json_agg + json_build_object + its own padding
                      }),
                  });
                  return `'${jsonKey}', ${jsonValueSelectExpression}`;
                },
              )
              .join(',\n            ')}
          )
          ORDER BY ${referencedSqlSchemaName}_ref.array_order_index
        ),
        '[]'::json
      ) AS json_agg
      FROM ${fromSqlSchemaExpression}
      JOIN unnest(${sqlSchemaName}.${sqlSchemaProperty.name}) WITH ORDINALITY
        AS ${referencedSqlSchemaName}_ref (id, array_order_index)
        ON ${referencedSqlSchemaName}.id = ${referencedSqlSchemaName}_ref.id
    )${selectExpressionAlias}
      `.trim();
  }

  // fail fast if we reach here, not expected
  throw new UnexpectedCodePathDetectedError({
    reason:
      'did not handle the request with any defined conditions, for query select expression',
    domainObjectName: camelCase(sqlSchemaName),
    domainObjectPropertyName: domainObjectProperty.name,
  }); // fail fast if our expectation is not met though
};
