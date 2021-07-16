import { snakeCase } from 'change-case';
import {
  DomainObjectMetadata,
  DomainObjectMetadataReference,
  DomainObjectProperty,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';
import { isPresent } from 'simple-type-guards';
import {
  DomainObjectReferenceMethod,
  getDomainObjectReferenceFromProperty,
} from './getDomainObjectReferenceFromProperty';

export class DirectlyNestedDomainEntityReferenceForbiddenError extends Error {
  constructor({
    metadata,
    propertyName,
    referencedDomainObject,
  }: {
    metadata: DomainObjectMetadata;
    propertyName: string;
    referencedDomainObject: DomainObjectMetadataReference;
  }) {
    super(
      `
DomainEntity found directly nested inside of another domain object. '${metadata.name}.${propertyName}' is of type '${referencedDomainObject.name}'

This is not allowed, as this is bad practice when persisting domain-objects. It will lead to maintainability problems in your backend code, since the referenced domain entity has its own lifecycle.

Instead, reference the entity by 'uuid' in the backend. For example:

\`\`\`ts
-- say you're referencing this domain-entity
export class User extends DomainEntity<User> implements User {};

-- instead of this
interface Profile {
  user: User; -- forbidden: referencing domain entity by nesting
  ...
}

-- do this
interface Profile {
  userUuid: string; -- suggested: reference it by uuid
  ...
}
\`\`\`

Note: the generated sql-schema will be the same as if it was a nested reference, but the domain-object referencing by uuid will make your backend code easier to maintain.
  `.trim(),
    );
  }
}

export const defineSqlSchemaGeneratorPropertyForDomainObjectProperty = ({
  propertyName,
  propertyDefinition,
  metadata,
  allMetadatas,
}: {
  propertyName: string;
  propertyDefinition: DomainObjectProperty;
  metadata: DomainObjectMetadata;
  allMetadatas: DomainObjectMetadata[];
}) => {
  // define data about this property
  const isUpdatable = metadata.decorations.updatable?.includes(propertyName) ?? false;
  const isNullable = !!propertyDefinition.nullable;

  // determine if this is a reference of another domain object
  const reference = getDomainObjectReferenceFromProperty({ propertyDefinition, propertyName, allMetadatas });

  // check that no references to domain entities are made using nesting (since that leads to maintainability problems)
  if (
    reference &&
    reference.method === DomainObjectReferenceMethod.DIRECTLY_NESTED &&
    reference.of.extends === DomainObjectVariant.DOMAIN_ENTITY
  )
    throw new DirectlyNestedDomainEntityReferenceForbiddenError({
      metadata,
      propertyName,
      referencedDomainObject: reference.of,
    });

  // define the schema property name
  const schemaPropertyName = (() => {
    const baseSchemaPropertyName = snakeCase(propertyName);
    if (reference) {
      if (reference.isArray) {
        if (reference.method === DomainObjectReferenceMethod.DIRECTLY_NESTED)
          return `${baseSchemaPropertyName.replace(/s$/, '')}_ids`; // suffix w/ ids, since its an array of fks
        if (reference.method === DomainObjectReferenceMethod.INFERRED_BY_UUID)
          return `${baseSchemaPropertyName.replace(/_uuids$/, '')}_ids`; // suffix w/ ids, since its an array of fks
      }
      if (reference.method === DomainObjectReferenceMethod.DIRECTLY_NESTED) return `${baseSchemaPropertyName}_id`; // suffix w/ id, since its a fk
      if (reference.method === DomainObjectReferenceMethod.INFERRED_BY_UUID)
        return `${baseSchemaPropertyName.replace(/_uuid$/, '')}_id`; // suffix w/ id, since its a fk
    }
    return baseSchemaPropertyName; // otherwise, its just the regular name, no modifications
  })();

  // define the base schema property
  const baseSchemaProperty = (() => {
    // handle references (do them first, since some "uuid" based references have type string)
    if (reference && !reference.isArray) {
      return `prop.REFERENCES(${snakeCase(reference.of!.name)})`;
    }
    if (propertyDefinition.type === DomainObjectPropertyType.ARRAY) {
      if (!reference)
        throw new Error('currently, only arrays of referenced domain objects are supported by sql-schema-generator');
      return `prop.ARRAY_OF(prop.REFERENCES(${snakeCase(reference.of.name)}))`;
    }

    // handle primitives
    if (propertyDefinition.type === DomainObjectPropertyType.STRING) return 'prop.VARCHAR()'; // note: varchar without precision is what postgres defines as best practice (precision does not affect size)
    if (propertyDefinition.type === DomainObjectPropertyType.NUMBER) return 'prop.NUMERIC()'; // note: numeric without precision is a good choice for 90%+ of use cases, since precision of numeric does not affect size. if user needs more fine tuning, they can mod the generated entity directly; for long term: https://github.com/uladkasach/sql-dao-generator/issues/1
    if (propertyDefinition.type === DomainObjectPropertyType.BOOLEAN) return 'prop.BOOLEAN()';
    if (propertyDefinition.type === DomainObjectPropertyType.DATE) return 'prop.TIMESTAMPTZ()'; // note: timestamptz is what postgres recommends
    if (propertyDefinition.type === DomainObjectPropertyType.ENUM)
      return `prop.ENUM([${(propertyDefinition.of as string[]).map((option) => `'${option}'`).join(', ')}])`;
  })();

  // if its not updatable or nullable, then the base schema property = the full property
  if (!isUpdatable && !isNullable) return `${schemaPropertyName}: ${baseSchemaProperty},`;

  // otherwise, return the property with its modifiers
  const modifiers = [
    isUpdatable ? 'updatable: true' : null, // updatable first, because typically things are updatable + nullable (rather than just nullable)
    isNullable ? 'nullable: true' : null,
  ]
    .filter(isPresent)
    .join(', ');
  return `${schemaPropertyName}: { ...${baseSchemaProperty}, ${modifiers} },`;
};
