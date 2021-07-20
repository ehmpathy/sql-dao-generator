import { camelCase } from 'change-case';
import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';
import { SqlSchemaPropertyMetadata } from '../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../domain/objects/SqlSchemaToDomainObjectRelationship';

export const defineQueryInputExpressionForSqlSchemaProperty = ({
  sqlSchemaProperty,
  domainObjectProperty,
  allSqlSchemaRelationships,
}: {
  sqlSchemaName: string;
  sqlSchemaProperty: SqlSchemaPropertyMetadata;
  domainObjectProperty: DomainObjectPropertyMetadata;
  allSqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}): string => {
  // simple case: non references
  if (!sqlSchemaProperty.isArray && !sqlSchemaProperty.reference) return `:${domainObjectProperty.name}`; // yesql notation

  // since sql-schema-generator does not support arrays of non-references, we can guarantee that its either a reference or an array of references now
  if (!sqlSchemaProperty.reference) throw new Error('unexpected code path, not supported. this is probably a bug'); // fail fast if our expectation is not met though

  // since we know its a reference, lookup the referenced sqlSchemaRelationship
  const referencedSqlSchemaRelationship = allSqlSchemaRelationships.find(
    (rel) => rel.name.domainObject === sqlSchemaProperty.reference!.of.name,
  );
  if (!referencedSqlSchemaRelationship)
    throw new Error('could not find referenced sql schema relationship. this is a bug within sql-dao-generator'); // fail fast, this should not occur
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
      JOIN unnest(:${domainObjectProperty.name}) WITH ORDINALITY
        AS ${referencedSqlSchemaName}_ref (uuid, array_order_index)
        ON ${referencedSqlSchemaName}.uuid = ${referencedSqlSchemaName}_ref.uuid
    )
      `.trim();

    // if its a nested reference, then it will be an array of ids arlready
    if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING)
      return `:${camelCase(sqlSchemaProperty.name)}`;
  }

  // fail fast if we reach here, not expected
  throw new Error('unexpected code path. this a bug');
};
