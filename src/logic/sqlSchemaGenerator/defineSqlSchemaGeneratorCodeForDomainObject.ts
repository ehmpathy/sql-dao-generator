import { camelCase, noCase, snakeCase } from 'change-case';
import { DomainObjectMetadata, DomainObjectVariant } from 'domain-objects-metadata';

import { defineSqlSchemaGeneratorPropertyForDomainObjectProperty } from './defineSqlSchemaGeneratorPropertyForDomainObjectProperty';

export const defineSqlSchemaGeneratorCodeForDomainObject = ({
  metadata,
  allMetadatas,
}: {
  metadata: DomainObjectMetadata;
  allMetadatas: DomainObjectMetadata[];
}) => {
  // define which sql-schema-generator class we'll be using for defining the schema for this domain object
  const schemaGeneratorClass = (() => {
    if (metadata.extends === DomainObjectVariant.DOMAIN_ENTITY) return 'Entity';
    if (metadata.extends === DomainObjectVariant.DOMAIN_VALUE_OBJECT) return 'ValueObject';
    if (metadata.extends === DomainObjectVariant.DOMAIN_EVENT) return 'Event';
    throw new Error(
      `sql schema can only be created for a domain object which extends DomainEntity, DomainValueObject, or DomainEvent. '${metadata.name}' does not meet this criteria, as it extends '${metadata.extends}'`,
    );
  })();

  // make sure that entities have "unique" and "updatable" defined
  if (metadata.extends === DomainObjectVariant.DOMAIN_ENTITY) {
    if (!metadata.decorations.unique?.length)
      throw new Error(
        `domain entities must have at least one 'unique' property defined in order for a schema to be generated. '${metadata.name}' does not satisfy this requirement.

        (note: if its not unique on any natural keys, please specify the 'uuid' as it's only unique property. e.g., \`['uuid']\`) `,
      );
    if (!Array.isArray(metadata.decorations.updatable))
      throw new Error(`domain entities must have their 'updatable' properties defined in order for a schema to be generated. '${metadata.name}' does not satisfy this requirement.

      (note: if it has no updatable properties, please specify this with an empty array. e.g., \`[]\`)`);
  }

  // make sure that value objects do not have unique or updatable defined
  if (metadata.extends === DomainObjectVariant.DOMAIN_VALUE_OBJECT) {
    if (metadata.decorations.unique)
      throw new Error(
        `domain value objects must _not_ have their 'unique' properties specified. value objects are unique on all of their properties by definition. '${metadata.name}' does not satisfy this requirement.`,
      );
    if (metadata.decorations.updatable)
      throw new Error(
        `domain value objects must _not_ have any 'updatable' properties specified. value objects do not have any updatable properties by definition. '${metadata.name}' does not satisfy this requirement.`,
      );
  }

  // make sure that events have "unique" defined
  if (metadata.extends === DomainObjectVariant.DOMAIN_EVENT) {
    if (!metadata.decorations.unique?.length)
      throw new Error(
        `domain events must have at least one 'unique' property defined in order for a schema to be generated. '${metadata.name}' does not satisfy this requirement.`,
      );
  }

  // define the properties of the domain object
  const schemaGeneratorProperties = Object.entries(metadata.properties)
    .filter((entry) => !['id', 'uuid'].includes(entry[0]))
    .map((entry) => {
      const propertyName = entry[0];
      const propertyDefinition = entry[1];
      return defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
        propertyName,
        propertyDefinition,
        metadata,
        allMetadatas,
      });
    });

  // define the unique properties of the schema entity, if any
  const schemaGeneratorUnique =
    metadata.extends === DomainObjectVariant.DOMAIN_VALUE_OBJECT
      ? null
      : `unique: [${metadata.decorations.unique!.map((s) => `'${snakeCase(s)}'`).join(', ')}],`;

  // define the imports based on this
  const schemaGeneratorImports = [schemaGeneratorClass, 'prop']
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .join(', ');
  const content = `
import { ${schemaGeneratorImports} } from 'sql-schema-generator';

/**
 * sql-schema for the ${noCase(metadata.extends)} '${metadata.name}'
 */
export const ${camelCase(metadata.name)} = new ${schemaGeneratorClass}({
  name: '${snakeCase(metadata.name)}',
  properties: {
    ${schemaGeneratorProperties.join('\n    ')}
  },
${schemaGeneratorUnique ? `  ${schemaGeneratorUnique}\n` : ''}});
  `.trim();

  return content;
};
