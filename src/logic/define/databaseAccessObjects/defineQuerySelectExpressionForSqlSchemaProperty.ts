import { camelCase, snakeCase } from 'change-case';
import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';

import { SqlSchemaPropertyMetadata } from '../../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { isADirectlyNestedDomainObjectProperty } from '../sqlSchemaRelationship/isADirectlyNestedDomainObjectProperty';
import { isAUserDefinedDomainObjectProperty } from '../sqlSchemaRelationship/isAUserDefinedDomainObjectProperty';

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
      FROM ${referencedSqlSchemaName} WHERE ${referencedSqlSchemaName}.id = ${sqlSchemaName}.${sqlSchemaProperty.name}
    )${selectExpressionAlias}
          `.trim();

    // array case
    return `
    (
      SELECT COALESCE(array_agg(${referencedSqlSchemaName}.uuid ORDER BY ${referencedSqlSchemaName}_ref.array_order_index), array[]::uuid[]) AS array_agg
      FROM ${referencedSqlSchemaName}
      JOIN unnest(${sqlSchemaName}.${sqlSchemaProperty.name}) WITH ORDINALITY
        AS ${referencedSqlSchemaName}_ref (id, array_order_index)
        ON ${referencedSqlSchemaName}.id = ${referencedSqlSchemaName}_ref.id
    )${selectExpressionAlias}
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
              const jsonKey = isADirectlyNestedDomainObjectProperty({
                sqlSchema: referencedSqlSchemaProperty,
                domainObject: referencedDomainObjectProperty,
              })
                ? snakeCase(referencedDomainObjectProperty.name) // if its a directly nested domain object reference, then refer to it by domain object name
                : referencedSqlSchemaProperty.name; // otherwise, by the sql property name
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
      FROM ${referencedSqlSchemaName} WHERE ${referencedSqlSchemaName}.id = ${sqlSchemaName}.${
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
                  const jsonKey = isADirectlyNestedDomainObjectProperty({
                    sqlSchema: referencedSqlSchemaProperty,
                    domainObject: referencedDomainObjectProperty,
                  })
                    ? snakeCase(referencedDomainObjectProperty.name) // if its a directly nested domain object reference, then refer to it by domain object name
                    : referencedSqlSchemaProperty.name; // otherwise, by the sql property name
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
      FROM ${referencedSqlSchemaName}
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
