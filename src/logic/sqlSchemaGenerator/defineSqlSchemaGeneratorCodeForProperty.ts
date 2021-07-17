// tslint:disable: max-classes-per-file

import { snakeCase } from 'change-case';
import { DomainObjectMetadata, DomainObjectPropertyMetadata, DomainObjectPropertyType } from 'domain-objects-metadata';
import { isPresent } from 'simple-type-guards';
import { SqlSchemaPropertyMetadata } from '../../domain/objects/SqlSchemaPropertyMetadata';

export const defineSqlSchemaGeneratorCodeForProperty = ({
  domainObject,
  domainObjectProperty,
  sqlSchemaProperty,
}: {
  domainObject: DomainObjectMetadata;
  domainObjectProperty: DomainObjectPropertyMetadata;
  sqlSchemaProperty: SqlSchemaPropertyMetadata;
}) => {
  // define the base schema property
  const baseSchemaProperty = (() => {
    // handle references (do them first, since some "uuid" based references have type string)
    if (sqlSchemaProperty.reference && !sqlSchemaProperty.isArray) {
      return `prop.REFERENCES(${snakeCase(sqlSchemaProperty.reference.of!.name)})`;
    }
    if (domainObjectProperty.type === DomainObjectPropertyType.ARRAY) {
      if (!sqlSchemaProperty.reference)
        throw new Error(
          `currently, only arrays of referenced domain objects are supported by sql-schema-generator. '${domainObject.name}.${domainObjectProperty.name}' does not meet this criteria.`,
        );
      return `prop.ARRAY_OF(prop.REFERENCES(${snakeCase(sqlSchemaProperty.reference.of.name)}))`;
    }

    // handle primitives
    if (domainObjectProperty.type === DomainObjectPropertyType.STRING) return 'prop.VARCHAR()'; // note: varchar without precision is what postgres defines as best practice (precision does not affect size)
    if (domainObjectProperty.type === DomainObjectPropertyType.NUMBER) return 'prop.NUMERIC()'; // note: numeric without precision is a good choice for 90%+ of use cases, since precision of numeric does not affect size. if user needs more fine tuning, they can mod the generated entity directly; for long term: https://github.com/uladkasach/sql-dao-generator/issues/1
    if (domainObjectProperty.type === DomainObjectPropertyType.BOOLEAN) return 'prop.BOOLEAN()';
    if (domainObjectProperty.type === DomainObjectPropertyType.DATE) return 'prop.TIMESTAMPTZ()'; // note: timestamptz is what postgres recommends
    if (domainObjectProperty.type === DomainObjectPropertyType.ENUM)
      return `prop.ENUM([${(domainObjectProperty.of as string[]).map((option) => `'${option}'`).join(', ')}])`;
  })();

  // if its not updatable or nullable, then the base schema property = the full property
  if (!sqlSchemaProperty.isUpdatable && !sqlSchemaProperty.isNullable)
    return `${sqlSchemaProperty.name}: ${baseSchemaProperty},`;

  // otherwise, return the property with its modifiers
  const modifiers = [
    sqlSchemaProperty.isUpdatable ? 'updatable: true' : null, // updatable first, because typically things are updatable + nullable (rather than just nullable)
    sqlSchemaProperty.isNullable ? 'nullable: true' : null,
  ]
    .filter(isPresent)
    .join(', ');
  return `${sqlSchemaProperty.name}: { ...${baseSchemaProperty}, ${modifiers} },`;
};
