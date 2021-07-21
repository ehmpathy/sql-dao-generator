import { snakeCase } from 'change-case';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';

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
    if (!propertyRelationship.sqlSchema.reference) return;
    if (!propertyRelationship.sqlSchema.isArray) return;
    if (propertyRelationship.sqlSchema.isUpdatable) return; // only ones that join to static table
    resourceRelpaths.push(
      `./tables/${sqlSchemaRelationship.name.sqlSchema}_to_${snakeCase(
        propertyRelationship.sqlSchema.reference.of.name,
      )}.sql`,
    );
  });

  // define the version table, if there are any updatable properties
  if (hasUpdatableProperties) resourceRelpaths.push(`./tables/${sqlSchemaRelationship.name.sqlSchema}_version.sql`);

  // define any mapping tables referencing the version table, if there are any updatable properties
  if (hasUpdatableProperties)
    sqlSchemaRelationship.properties.forEach((propertyRelationship) => {
      if (!propertyRelationship.sqlSchema.reference) return;
      if (!propertyRelationship.sqlSchema.isArray) return;
      if (!propertyRelationship.sqlSchema.isUpdatable) return; // only ones that join to static table
      resourceRelpaths.push(
        `./tables/${sqlSchemaRelationship.name.sqlSchema}_version_to_${snakeCase(
          propertyRelationship.sqlSchema.reference.of.name,
        )}.sql`,
      );
    });

  // define the current version pointer table, if there are any updatable properties
  if (hasUpdatableProperties) resourceRelpaths.push(`./tables/${sqlSchemaRelationship.name.sqlSchema}_cvp.sql`);

  // define the "current" view, if there are any updatable properties or array properties
  if (hasUpdatableProperties || hasArrayProperties)
    resourceRelpaths.push(`./views/view_${sqlSchemaRelationship.name.sqlSchema}_current.sql`);

  // define the upsert function
  resourceRelpaths.push(`./functions/upsert_${sqlSchemaRelationship.name.sqlSchema}.sql`);

  // define the full code for this domain entity, now that we have all of the paths to the resources defined, in order
  const code = [
    `# ${sqlSchemaRelationship.name.sqlSchema}`,
    ...resourceRelpaths.map((relpath) => ['- type: resource', `  path: ${relpath}`].join('\n')),
  ].join('\n');

  // return the code
  return code;
};
