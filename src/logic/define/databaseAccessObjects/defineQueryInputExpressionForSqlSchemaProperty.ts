import { camelCase, snakeCase } from 'change-case';
import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';
import { SqlSchemaPropertyMetadata } from '../../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';

export const defineQueryInputExpressionForSqlSchemaProperty = ({
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
  if (!domainObjectProperty)
    throw new UnexpectedCodePathDetectedError({
      reason: 'no domain object property for sql schema property ',
      domainObjectName: camelCase(sqlSchemaName),
      domainObjectPropertyName: camelCase(sqlSchemaName),
    }); // fail fast if our expectation is not met though

  // simple case: non references
  if (!sqlSchemaProperty.reference) return `:${domainObjectProperty.name}`; // yesql notation

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

  // handle solo reference
  if (!sqlSchemaProperty.isArray) {
    // if its a solo implicit uuid reference, then lookup the id by uuid as the input expression
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.IMPLICIT_BY_UUID)
      return `(SELECT id FROM ${referencedSqlSchemaName} WHERE ${referencedSqlSchemaName}.uuid = :${domainObjectProperty.name})`;

    // if its a nested reference, then it will have the id on it already
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING)
      return `:${camelCase(sqlSchemaProperty.name)}`;
  }

  // handle array of references
  if (sqlSchemaProperty.isArray) {
    // if its a solo implicit uuid reference, then lookup the ids by uuids as the input expression
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.IMPLICIT_BY_UUID)
      return `
    (
      SELECT COALESCE(array_agg(${referencedSqlSchemaName}.id ORDER BY ${referencedSqlSchemaName}_ref.array_order_index), array[]::bigint[]) AS array_agg
      FROM ${referencedSqlSchemaName}
      JOIN unnest(:${domainObjectProperty.name}::uuid[]) WITH ORDINALITY
        AS ${referencedSqlSchemaName}_ref (uuid, array_order_index)
        ON ${referencedSqlSchemaName}.uuid = ${referencedSqlSchemaName}_ref.uuid
    )
      `.trim();

    // if its a nested reference, then it will be an array of ids arlready
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING)
      return `:${camelCase(sqlSchemaProperty.name)}`;
  }

  // fail fast if we reach here, not expected
  throw new UnexpectedCodePathDetectedError({
    reason: 'did not handle the request with any defined conditions, for query input expression',
    domainObjectName: camelCase(sqlSchemaName),
    domainObjectPropertyName: domainObjectProperty.name,
  }); // fail fast if our expectation is not met though
};
