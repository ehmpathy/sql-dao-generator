import { camelCase, snakeCase } from 'change-case';
import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';

import { SqlSchemaPropertyMetadata } from '../../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { UserInputError } from '../../UserInputError';

export const defineQuerySelectExpressionForSqlSchemaProperty = ({
  sqlSchemaName,
  sqlSchemaProperty,
  domainObjectProperty,
  allSqlSchemaRelationships,
}: {
  sqlSchemaName: string;
  sqlSchemaProperty: SqlSchemaPropertyMetadata;
  domainObjectProperty: DomainObjectPropertyMetadata;
  allSqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}): string => {
  // simple case: property is represented in the db simply as a column
  if (!sqlSchemaProperty.isArray && !sqlSchemaProperty.reference) return `${sqlSchemaName}.${sqlSchemaProperty.name}`;

  // since sql-schema-generator does not support arrays of non-references, we can guarantee that its either a reference or an array of references now
  if (!sqlSchemaProperty.reference)
    throw new UnexpectedCodePathDetectedError({
      reason: 'did not find a reference on sqlSchemaProperty but expected one, for query select expression',
      domainObjectName: camelCase(sqlSchemaName),
      domainObjectPropertyName: domainObjectProperty.name,
    }); // fail fast if our expectation is not met though

  // since we know its a reference, lookup the referenced sqlSchemaRelationship
  const referencedSqlSchemaRelationship = allSqlSchemaRelationships.find(
    (rel) => rel.name.domainObject === sqlSchemaProperty.reference!.of.name,
  );
  if (!referencedSqlSchemaRelationship)
    throw new UnexpectedCodePathDetectedError({
      reason: 'could not find referenced sql schema relationship for defining query input expression',
      domainObjectName: snakeCase(sqlSchemaName),
      domainObjectPropertyName: domainObjectProperty.name,
    }); // fail fast, this should not occur
  const referencedSqlSchemaName = referencedSqlSchemaRelationship.name.sqlSchema;

  // check that its not a DIRECT_BY_NESTING reference to a domain object (one we know will be a domain-value-object) which has its own references (references in references) - we dont support that yet
  if (
    sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING &&
    referencedSqlSchemaRelationship.properties.some(({ sqlSchema: sqlSchemaProperty }) => sqlSchemaProperty.reference)
  ) {
    throw new UserInputError({
      reason:
        'generating a dao is not supported for domain-value-objects that reference other domain-value-objects yet. if this is a valid use case, please submit a ticket.',
      domainObjectName: camelCase(sqlSchemaName),
      domainObjectPropertyName: domainObjectProperty.name,
    }); //  nesting domain-value-objects within domain-value-objects is probably edge case enough to not worry about for mvp
  }

  // single reference case: grab the uuid or properties by id
  if (!sqlSchemaProperty.isArray) {
    // if it references by implicit uuid, then we just need to grab the uuid and say its "as" the column
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.IMPLICIT_BY_UUID) {
      return `
    (
      SELECT ${referencedSqlSchemaName}.uuid
      FROM ${referencedSqlSchemaName} WHERE ${referencedSqlSchemaName}.id = ${sqlSchemaName}.${sqlSchemaProperty.name}
    ) AS ${snakeCase(domainObjectProperty.name)}
        `.trim();
    }

    // if it references it by direct nesting, then we need to get all the props of that object so it can by hydrated on instantiation
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING) {
      return `
    (
      SELECT json_build_object(
        ${referencedSqlSchemaRelationship.properties
          .filter(({ domainObject: referencedDomainObjectProperty }) => !!referencedDomainObjectProperty)
          .map(
            ({ sqlSchema: referencedSqlSchemaProperty }) =>
              `'${referencedSqlSchemaProperty.name}', ${referencedSqlSchemaName}.${referencedSqlSchemaProperty.name}`,
          )
          .join(',\n        ')}
      ) AS json_build_object
      FROM ${referencedSqlSchemaName} WHERE ${referencedSqlSchemaName}.id = ${sqlSchemaName}.${sqlSchemaProperty.name}
    ) AS ${snakeCase(domainObjectProperty.name)}
        `.trim();
    }
  }

  // array reference case: return a json array of uuids or objects
  if (sqlSchemaProperty.isArray) {
    // if it references by implicit uuid, then we just need to grab the uuids and say its "as" the column
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.IMPLICIT_BY_UUID) {
      return `
    (
      SELECT COALESCE(array_agg(${referencedSqlSchemaName}.uuid ORDER BY ${referencedSqlSchemaName}_ref.array_order_index), array[]::uuid[]) AS array_agg
      FROM ${referencedSqlSchemaName}
      JOIN unnest(${sqlSchemaName}.${sqlSchemaProperty.name}) WITH ORDINALITY
        AS ${referencedSqlSchemaName}_ref (id, array_order_index)
        ON ${referencedSqlSchemaName}.id = ${referencedSqlSchemaName}_ref.id
    ) AS ${snakeCase(domainObjectProperty.name)}
      `.trim();
    }

    // if it references by direct nesting, then we need to get an array of the full objects
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING) {
      return `
    (
      SELECT COALESCE(
        json_agg(
          json_build_object(
            ${referencedSqlSchemaRelationship.properties
              .filter(({ domainObject: referencedDomainObjectProperty }) => !!referencedDomainObjectProperty)
              .map(
                ({ sqlSchema: referencedSqlSchemaProperty }) =>
                  `'${referencedSqlSchemaProperty.name}', ${referencedSqlSchemaName}.${referencedSqlSchemaProperty.name}`,
              )
              .join(',\n            ')}
          )
          ORDER BY ${referencedSqlSchemaName}_ref.array_order_index
        ),
        array[]::json[]
      ) AS json_agg
      FROM ${referencedSqlSchemaName}
      JOIN unnest(${sqlSchemaName}.${sqlSchemaProperty.name}) WITH ORDINALITY
        AS ${referencedSqlSchemaName}_ref (id, array_order_index)
        ON ${referencedSqlSchemaName}.id = ${referencedSqlSchemaName}_ref.id
    ) AS ${snakeCase(domainObjectProperty.name)}
      `.trim();
    }
  }

  // fail fast if we reach here, not expected
  throw new UnexpectedCodePathDetectedError({
    reason: 'did not handle the request with any defined conditions, for query select expression',
    domainObjectName: camelCase(sqlSchemaName),
    domainObjectPropertyName: domainObjectProperty.name,
  }); // fail fast if our expectation is not met though
};
