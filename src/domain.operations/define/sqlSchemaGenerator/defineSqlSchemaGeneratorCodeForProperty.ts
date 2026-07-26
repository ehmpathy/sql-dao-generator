import { camelCase } from 'change-case';
import {
  type DomainObjectMetadata,
  type DomainObjectPropertyMetadata,
  DomainObjectPropertyType,
  isEnumArrayProperty,
  isPrimitiveArrayProperty,
} from 'domain-objects-metadata';
import { UnexpectedCodePathError } from 'helpful-errors';
import { isPresent } from 'type-fns';

import type { SqlSchemaPropertyMetadata } from '@src/domain.objects/SqlSchemaPropertyMetadata';
import { UserInputError } from '@src/domain.operations/UserInputError';

import { isUuidReferenceArrayProperty } from '../isUuidReferenceArrayProperty';

// define the prop.* expression for a scalar primitive type; shared by the solo-property and array-element branches so the two can not drift apart. returns null for non-primitive types (e.g. ENUM), so the caller can continue its branch ladder
const definePropExpressionForPrimitiveType = (
  primitiveType: DomainObjectPropertyType,
): string | null => {
  if (primitiveType === DomainObjectPropertyType.STRING)
    return 'prop.VARCHAR()'; // note: varchar without precision is what postgres defines as best practice (precision does not affect size)
  if (primitiveType === DomainObjectPropertyType.NUMBER)
    return 'prop.NUMERIC()'; // note: numeric without precision is a good choice for 90%+ of use cases, since precision of numeric does not affect size. if user needs more fine tuning, they can mod the generated entity directly; for long term: https://github.com/uladkasach/sql-dao-generator/issues/1
  if (primitiveType === DomainObjectPropertyType.BOOLEAN)
    return 'prop.BOOLEAN()';
  if (primitiveType === DomainObjectPropertyType.DATE)
    return 'prop.TIMESTAMPTZ()'; // note: timestamptz is the canonical timestamp, same as the system created_at/updated_at columns
  return null;
};

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
    if (domainObjectProperty.type === DomainObjectPropertyType.ARRAY) {
      // handle case where its an array reference to a domain object persisted within the database
      if (sqlSchemaProperty.reference)
        return `prop.ARRAY_OF(prop.REFERENCES(${
          isSelfReference ? '() => ' : ''
        }${camelCase(sqlSchemaProperty.reference.of.name)}))`;

      // handle case where its an implicit by-uuid reference array (a _uuids-suffixed string[]); the
      // shared predicate is consumed here AND by schema-control's join-table decision, so the column
      // and the manifest resource can not disagree on which arrays are uuid references
      if (
        isUuidReferenceArrayProperty({
          name: sqlSchemaProperty.name,
          domainObjectProperty,
        })
      )
        return 'prop.ARRAY_OF(prop.UUID())';

      // handle enum arrays as a native enum[] column
      if (isEnumArrayProperty(domainObjectProperty))
        return `prop.ARRAY_OF(prop.ENUM([${(
          domainObjectProperty.of.of as string[]
        )
          .map((option) => `'${option}'`)
          .join(', ')}]))`;

      // handle primitive arrays as a native <primitive>[] column
      if (isPrimitiveArrayProperty(domainObjectProperty)) {
        const elementProp = definePropExpressionForPrimitiveType(
          domainObjectProperty.of.type,
        );
        if (!elementProp)
          throw new UnexpectedCodePathError(
            'unsupported primitive array element type',
            { domainObjectProperty },
          );
        return `prop.ARRAY_OF(${elementProp})`;
      }

      // otherwise, its an unsupported array shape (e.g. a nested array)
      throw new UserInputError({
        reason:
          'Unsupported array shape. Arrays of domain-object references (stored as relations), primitives (stored as a native array column), and enums (stored as a native enum[] column) are supported. Nested arrays and other shapes are not.',
        domainObjectName: domainObject.name,
        domainObjectPropertyName: domainObjectProperty.name,
        potentialSolution: `
If you'd like to store this array, try one of these options:
- if it is a nested array, flatten it or model the inner array as a domain literal
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
    const soloPrimitiveProp = definePropExpressionForPrimitiveType(
      domainObjectProperty.type,
    );
    if (soloPrimitiveProp) return soloPrimitiveProp;
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
