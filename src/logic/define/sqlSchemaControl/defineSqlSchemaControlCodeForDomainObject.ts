import { UnexpectedCodePathError } from '@ehmpathy/error-fns';
import { snakeCase } from 'change-case';

import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';

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

  // define any mapping tables referencing the base table
  sqlSchemaRelationship.properties.forEach((propertyRelationship) => {
    if (!propertyRelationship.sqlSchema.isArray) return;
    if (propertyRelationship.sqlSchema.isUpdatable) return; // only ones that join to static table
    if (!propertyRelationship.sqlSchema.reference) {
      const endsWithUuidSuffix = new RegExp(/_uuids$/).test(
        propertyRelationship.sqlSchema.name,
      );
      if (!endsWithUuidSuffix)
        throw new UnexpectedCodePathDetectedError({
          reason:
            'expected sql-schema-generator to only allow _uuid suffixed property names to be arrays',
          domainObjectPropertyName: propertyRelationship.domainObject?.name,
          domainObjectName: sqlSchemaRelationship.name.domainObject,
        });
      return resourceRelpaths.push(
        `./tables/${
          sqlSchemaRelationship.name.sqlSchema
        }_to_${propertyRelationship.sqlSchema.name.replace(
          /_uuids$/,
          '_uuid',
        )}.sql`,
      );
    }
    return resourceRelpaths.push(
      `./tables/${
        sqlSchemaRelationship.name.sqlSchema
      }_to_${getMostCommonPrefixRedactedTableNameToken({
        sqlSchemaRelationship,
        propertyRelationship,
      })}.sql`,
    );
  });

  // define the version table, if there are any updatable properties
  if (hasUpdatableProperties)
    resourceRelpaths.push(
      `./tables/${sqlSchemaRelationship.name.sqlSchema}_version.sql`,
    );

  // define any mapping tables referencing the version table, if there are any updatable properties
  if (hasUpdatableProperties)
    sqlSchemaRelationship.properties.forEach((propertyRelationship) => {
      if (!propertyRelationship.sqlSchema.isArray) return;
      if (!propertyRelationship.sqlSchema.isUpdatable) return; // only ones that join to static table
      if (!propertyRelationship.sqlSchema.reference) {
        const endsWithUuidSuffix = new RegExp(/_uuids$/).test(
          propertyRelationship.sqlSchema.name,
        );
        if (!endsWithUuidSuffix)
          throw new UnexpectedCodePathDetectedError({
            reason:
              'expected sql-schema-generator to only allow _uuid suffixed property names to be arrays',
            domainObjectPropertyName: propertyRelationship.domainObject?.name,
            domainObjectName: sqlSchemaRelationship.name.domainObject,
          });
        return resourceRelpaths.push(
          `./tables/${
            sqlSchemaRelationship.name.sqlSchema
          }_version_to_${propertyRelationship.sqlSchema.name.replace(
            /_uuids$/,
            '_uuid',
          )}.sql`,
        );
      }
      return resourceRelpaths.push(
        `./tables/${
          sqlSchemaRelationship.name.sqlSchema
        }_version_to_${getMostCommonPrefixRedactedTableNameToken({
          sqlSchemaRelationship,
          propertyRelationship,
        })}.sql`,
      );
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
