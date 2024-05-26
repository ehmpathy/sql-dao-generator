import { UnexpectedCodePathError } from '@ehmpathy/error-fns';
import { camelCase } from 'change-case';
import {
  DomainObjectMetadata,
  DomainObjectPropertyMetadata,
  DomainObjectPropertyType,
  isDomainObjectArrayProperty,
} from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import { SqlSchemaPropertyMetadata } from '../../../domain/objects/SqlSchemaPropertyMetadata';
import { UserInputError } from '../../UserInputError';

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
    const isSelfReference =
      sqlSchemaProperty.reference?.of.name === domainObject.name;
    if (sqlSchemaProperty.reference && !sqlSchemaProperty.isArray) {
      return `prop.REFERENCES(${isSelfReference ? '() => ' : ''}${camelCase(
        sqlSchemaProperty.reference.of.name,
      )})`;
    }
    if (isDomainObjectArrayProperty(domainObjectProperty)) {
      // handle case where its an array reference to a domain object persisted within the database
      if (sqlSchemaProperty.reference)
        return `prop.ARRAY_OF(prop.REFERENCES(${
          isSelfReference ? '() => ' : ''
        }${camelCase(sqlSchemaProperty.reference.of.name)}))`;

      // handle case where its potentially an array reference to a domain object persisted in another database (referenced by uuid)
      const propertyNameLooksLikeUuidReferenceArray = new RegExp(
        /_uuids$/,
      ).test(sqlSchemaProperty.name); // i.e., does it end with _uuids?
      if (
        propertyNameLooksLikeUuidReferenceArray &&
        domainObjectProperty.of.type === DomainObjectPropertyType.STRING
      )
        return 'prop.ARRAY_OF(prop.UUID())';

      // otherwise, its not a handled case
      throw new UserInputError({
        reason:
          'According to relational database best practices, properties of persisted domain objects should only be arrays of other domain objects. Therefore, only arrays of directly nested references and implicit by uuid references can be properties of domain objects persisted in relational databases.',
        domainObjectName: domainObject.name,
        domainObjectPropertyName: domainObjectProperty.name,
        potentialSolution: `
If you'd like to store an array of data, try one of the following:
- make a literal out of the data and store an array of those literals instead
  - for example: \`User.favorite_fruits = ['Banana', 'Grapefruit']\` => \`User.favorite_fruits = [new Fruit({ name: 'Banana }), new Fruit({ name: 'Grapefruit' })]\`
- make an entity out of the data and store an array of uuids to the entity instead
  - if the entity is stored in the same database and managed by the dao-generator, the database will use foreign keys to store references to that entity
  - if the entity is stored in a different database or not managed by the dao-generator, the database will simply store an array of uuids
        `.trim(),
      });
    }

    // handle uuid properties, for added performance
    const endsWithUuidSuffix = new RegExp(/_uuid$/).test(
      sqlSchemaProperty.name,
    );
    if (
      endsWithUuidSuffix &&
      domainObjectProperty.type === DomainObjectPropertyType.STRING
    )
      return 'prop.UUID()';

    // handle primitives
    if (domainObjectProperty.type === DomainObjectPropertyType.STRING)
      return 'prop.VARCHAR()'; // note: varchar without precision is what postgres defines as best practice (precision does not affect size)
    if (domainObjectProperty.type === DomainObjectPropertyType.NUMBER)
      return 'prop.NUMERIC()'; // note: numeric without precision is a good choice for 90%+ of use cases, since precision of numeric does not affect size. if user needs more fine tuning, they can mod the generated entity directly; for long term: https://github.com/uladkasach/sql-dao-generator/issues/1
    if (domainObjectProperty.type === DomainObjectPropertyType.BOOLEAN)
      return 'prop.BOOLEAN()';
    if (domainObjectProperty.type === DomainObjectPropertyType.DATE)
      return 'prop.TIMESTAMPTZ()'; // note: timestamptz is what postgres recommends
    if (domainObjectProperty.type === DomainObjectPropertyType.ENUM)
      return `prop.ENUM([${(domainObjectProperty.of as string[])
        .map((option) => `'${option}'`)
        .join(', ')}])`;

    // handle unsupported primitive
    throw new UnexpectedCodePathError(
      'unsupported domain object property type',
      { domainObjectProperty },
    );
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
