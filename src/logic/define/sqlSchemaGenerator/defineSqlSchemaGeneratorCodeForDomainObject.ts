import { camelCase, noCase } from 'change-case';
import { DomainObjectMetadata, DomainObjectVariant } from 'domain-objects-metadata';
import { isPresent } from 'simple-type-guards';

import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UserInputError } from '../../UserInputError';
import { isNotADatabaseGeneratedProperty } from '../sqlSchemaRelationship/isNotADatabaseGeneratedProperty';
import { defineSqlSchemaGeneratorCodeForProperty } from './defineSqlSchemaGeneratorCodeForProperty';

export const defineSqlSchemaGeneratorCodeForDomainObject = ({
  domainObject,
  sqlSchemaRelationship,
}: {
  domainObject: DomainObjectMetadata;
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
}) => {
  // define which sql-schema-generator class we'll be using for defining the schema for this domain object
  const schemaGeneratorClass = (() => {
    if (domainObject.extends === DomainObjectVariant.DOMAIN_ENTITY) return 'Entity';
    if (domainObject.extends === DomainObjectVariant.DOMAIN_VALUE_OBJECT) return 'ValueObject';
    if (domainObject.extends === DomainObjectVariant.DOMAIN_EVENT) return 'Event';
    throw new UserInputError({
      reason: `sql schema can only be created for a domain object which extends DomainEntity, DomainValueObject, or DomainEvent. Found extends '${domainObject.extends}'`,
      domainObjectName: domainObject.name,
    });
  })();

  // define the code for each property
  const schemaGeneratorProperties = sqlSchemaRelationship.properties
    .filter(isNotADatabaseGeneratedProperty) // filter out all db generated properties, since sql-schema-generator will complain if they're included
    .filter((propertyRelationship) => propertyRelationship.domainObject.name !== 'uuid') // we also can't use the "uuid" property, even if its not db generated, since sql-schema-generator will still complain even if entity is unique on it
    .map((propertyRelationship) =>
      defineSqlSchemaGeneratorCodeForProperty({
        domainObject,
        domainObjectProperty: propertyRelationship.domainObject,
        sqlSchemaProperty: propertyRelationship.sqlSchema,
      }),
    );

  // define the code for the unique properties
  const schemaGeneratorUnique =
    sqlSchemaRelationship.decorations.unique.sqlSchema &&
    domainObject.extends !== DomainObjectVariant.DOMAIN_VALUE_OBJECT
      ? `unique: [${sqlSchemaRelationship.decorations.unique.sqlSchema.map((s) => `'${s}'`).join(', ')}],`
      : null;

  // define the imported props from sql-schema-generator based on this
  const schemaGeneratorImports = [schemaGeneratorClass, 'prop']
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .join(', ');

  // figure out all of the referenced domain objects and define the imports for those
  const referenceImports = sqlSchemaRelationship.properties
    .map((propertyRelationship) => propertyRelationship.sqlSchema.reference)
    .filter(isPresent)
    .map((reference) => `import { ${camelCase(reference.of.name)} } from './${camelCase(reference.of.name)}';`);
  const distinctSortedReferenceImports = [...new Set(referenceImports.sort())];

  // define the code
  const content = `
import { ${schemaGeneratorImports} } from 'sql-schema-generator';
${distinctSortedReferenceImports.length ? ['', ...distinctSortedReferenceImports, ''].join('\n') : ''}
/**
 * sql-schema for the ${noCase(domainObject.extends)} '${domainObject.name}'
 */
export const ${camelCase(domainObject.name)} = new ${schemaGeneratorClass}({
  name: '${sqlSchemaRelationship.name.sqlSchema}',
  properties: {
    ${schemaGeneratorProperties.join('\n    ')}
  },
${schemaGeneratorUnique ? `  ${schemaGeneratorUnique}\n` : ''}});
  `.trim();

  return content;
};
