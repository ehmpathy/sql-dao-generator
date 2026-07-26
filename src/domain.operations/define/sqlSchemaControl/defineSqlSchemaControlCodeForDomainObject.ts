import { snakeCase } from 'change-case';
import { UnexpectedCodePathError } from 'helpful-errors';

import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '@src/domain.operations/UnexpectedCodePathDetectedError';

import { isUuidReferenceArrayProperty } from '../isUuidReferenceArrayProperty';
import { isNativeArrayColumnProperty } from './isNativeArrayColumnProperty';

const getMostCommonPrefixRedactedTableNameToken = (input: {
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
  propertyRelationship: SqlSchemaToDomainObjectRelationship['properties'][number];
}) => {
  if (!input.propertyRelationship.sqlSchema.reference)
    throw new UnexpectedCodePathError(
      'can not getMostCommonPrefixRedactedTableNameToken of non reference property',
      { input },
    );

  // define the names of the tables
  const tableNameSource = input.sqlSchemaRelationship.name.sqlSchema;
  const tableNameReferenced = snakeCase(
    input.propertyRelationship.sqlSchema.reference.of.name,
  );

  // determine the most common prefix between the two, if any
  const wordsInEntityReferenceTableName = tableNameSource.split('_');
  const mostCommonPrefixWords = (() => {
    const commonPrefixWords: string[] = [];
    for (const commonPrefixCandidate of wordsInEntityReferenceTableName) {
      const doesCandidateContributeToCommonPrefix =
        tableNameReferenced.startsWith(
          [...commonPrefixWords, commonPrefixCandidate].join('_'),
        );
      if (!doesCandidateContributeToCommonPrefix) break;
      commonPrefixWords.push(commonPrefixCandidate);
    }
    return commonPrefixWords;
  })();
  const mostCommonPrefix = mostCommonPrefixWords.join('_');

  // establish the join table name with the prefix removed
  const referencedTableNameWithPrefixDeduped = tableNameReferenced.replace(
    new RegExp(`^${mostCommonPrefix}_`), // todo: sync this logic to the sql-schema-generator
    '',
  );

  // return it
  return referencedTableNameWithPrefixDeduped;
};

// define the join-table relpath an array property joins to, or null when the array needs NO join table (a native primitive/enum array lives as a single column on the table itself). `tableName` is the table the join maps back to — the base table, or the version table. shared by the base-table and version-table passes so the classification can not drift between them
const defineArrayJoinTableRelpath = ({
  sqlSchemaRelationship,
  propertyRelationship,
  tableName,
}: {
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
  propertyRelationship: SqlSchemaToDomainObjectRelationship['properties'][number];
  tableName: string;
}): string | null => {
  // a reference array joins to the referenced table (with the common table-name prefix deduped)
  if (propertyRelationship.sqlSchema.reference)
    return `./tables/${tableName}_to_${getMostCommonPrefixRedactedTableNameToken(
      {
        sqlSchemaRelationship,
        propertyRelationship,
      },
    )}.sql`;

  // a _uuids-suffixed string array is an implicit by-uuid reference, so it joins to a uuid table
  // (check this before the native-array check, since such an array is also a primitive string array).
  // the shared predicate also gates on a string element, in agreement with the schema-generator, so a
  // non-string _uuids array (e.g. score_uuids: number[]) falls through to the native branch in both
  // layers instead of a join table the generator never builds
  if (
    isUuidReferenceArrayProperty({
      name: propertyRelationship.sqlSchema.name,
      domainObjectProperty: propertyRelationship.domainObject,
    })
  )
    return `./tables/${tableName}_to_${propertyRelationship.sqlSchema.name.replace(
      /_uuids$/,
      '_uuid',
    )}.sql`;

  // a native primitive/enum array lives as a single column on the table, so it adds no join table
  if (isNativeArrayColumnProperty(propertyRelationship.domainObject))
    return null;

  // otherwise a genuinely unsupported array shape (e.g. a nested array)
  throw new UnexpectedCodePathDetectedError({
    reason:
      'expected sql-schema-generator to only allow _uuid suffixed, primitive, or enum property names to be arrays',
    domainObjectPropertyName: propertyRelationship.domainObject?.name,
    domainObjectName: sqlSchemaRelationship.name.domainObject,
  });
};

export const defineSqlSchemaControlCodeForDomainObject = ({
  sqlSchemaRelationship,
}: {
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
}) => {
  // derive some metadata
  const hasArrayProperties = sqlSchemaRelationship.properties.some(
    (propertyRelationship) => propertyRelationship.sqlSchema.isArray,
  );
  const hasUpdatableProperties = sqlSchemaRelationship.properties.some(
    (propertyRelationship) => propertyRelationship.sqlSchema.isUpdatable,
  );

  // track all of the relpaths for resources
  const resourceRelpaths: string[] = [];

  // define the base table
  resourceRelpaths.push(`./tables/${sqlSchemaRelationship.name.sqlSchema}.sql`);

  // define any join tables the base table's static (non-updatable) arrays map to
  sqlSchemaRelationship.properties.forEach((propertyRelationship) => {
    if (!propertyRelationship.sqlSchema.isArray) return;
    if (propertyRelationship.sqlSchema.isUpdatable) return; // only static arrays join the base table
    const relpath = defineArrayJoinTableRelpath({
      sqlSchemaRelationship,
      propertyRelationship,
      tableName: sqlSchemaRelationship.name.sqlSchema,
    });
    if (relpath) resourceRelpaths.push(relpath); // a native array column returns null — no join table
  });

  // define the version table, if there are any updatable properties
  if (hasUpdatableProperties)
    resourceRelpaths.push(
      `./tables/${sqlSchemaRelationship.name.sqlSchema}_version.sql`,
    );

  // define any join tables the version table's updatable arrays map to, if there are any updatable properties
  if (hasUpdatableProperties)
    sqlSchemaRelationship.properties.forEach((propertyRelationship) => {
      if (!propertyRelationship.sqlSchema.isArray) return;
      if (!propertyRelationship.sqlSchema.isUpdatable) return; // only updatable arrays join the version table
      const relpath = defineArrayJoinTableRelpath({
        sqlSchemaRelationship,
        propertyRelationship,
        tableName: `${sqlSchemaRelationship.name.sqlSchema}_version`,
      });
      if (relpath) resourceRelpaths.push(relpath); // a native array column returns null — no join table
    });

  // define the current version pointer table, if there are any updatable properties
  if (hasUpdatableProperties)
    resourceRelpaths.push(
      `./tables/${sqlSchemaRelationship.name.sqlSchema}_cvp.sql`,
    );

  // define the "current" view, if there are any updatable properties or array properties
  if (hasUpdatableProperties || hasArrayProperties)
    resourceRelpaths.push(
      `./views/view_${sqlSchemaRelationship.name.sqlSchema}_current.sql`,
    );

  // define the "hydrated" view, always
  resourceRelpaths.push(
    `./views/view_${sqlSchemaRelationship.name.sqlSchema}_hydrated.sql`,
  );

  // define the upsert function
  resourceRelpaths.push(
    `./functions/upsert_${sqlSchemaRelationship.name.sqlSchema}.sql`,
  );

  // define the full code for this domain entity, now that we have all of the paths to the resources defined, in order
  const code = [
    `# ${sqlSchemaRelationship.name.sqlSchema}`,
    ...resourceRelpaths.map((relpath) =>
      ['- type: resource', `  path: ${relpath}`].join('\n'),
    ),
  ].join('\n');

  // return the code
  return code;
};
