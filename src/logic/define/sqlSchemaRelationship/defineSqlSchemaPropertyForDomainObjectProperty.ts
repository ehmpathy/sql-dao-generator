import { camelCase, snakeCase } from 'change-case';
import { DomainObjectMetadata, DomainObjectPropertyMetadata, DomainObjectPropertyType } from 'domain-objects-metadata';

import { SqlSchemaPropertyMetadata } from '../../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { UserInputError } from '../../UserInputError';
import { defineDatabaseGeneratedSqlSchemaPropertiesForDomainObject } from './defineDatabaseGeneratedPropertiesForDomainObject';
import { defineSqlSchemaReferenceForDomainObjectProperty } from './defineSqlSchemaReferenceForDomainObjectProperty';

export const defineSqlSchemaPropertyForDomainObjectProperty = ({
  property,
  domainObject,
  allDomainObjects,
}: {
  property: DomainObjectPropertyMetadata;
  domainObject: DomainObjectMetadata;
  allDomainObjects: DomainObjectMetadata[];
}): SqlSchemaPropertyMetadata => {
  // sanity check that property name is in camel case
  if (camelCase(property.name) !== property.name)
    throw new UserInputError({
      reason: 'property names must be camel case',
      domainObjectName: domainObject.name,
      domainObjectPropertyName: property.name,
    });

  // sanity check that this is not called for a database generated property (since that should be handled elsewhere)
  const databaseGeneratedProperties = defineDatabaseGeneratedSqlSchemaPropertiesForDomainObject({ domainObject });
  if (databaseGeneratedProperties.map(({ name }) => name).includes(snakeCase(property.name)))
    throw new UnexpectedCodePathDetectedError({
      reason: '`defineSqlSchemaPropertyForDomainObjectProperty was called for an db-generated property',
      domainObjectName: domainObject.name,
      domainObjectPropertyName: property.name,
    });

  // define data about this property
  const isUpdatable = domainObject.decorations.updatable?.includes(property.name) ?? false;
  const isNullable = !!property.nullable;
  const isArray = property.type === DomainObjectPropertyType.ARRAY;

  // determine if this is a reference of another domain object
  const reference = defineSqlSchemaReferenceForDomainObjectProperty({
    property,
    domainObject,
    allDomainObjects,
  });

  // define the schema property name
  const schemaPropertyName = (() => {
    const baseSchemaPropertyName = snakeCase(property.name);
    if (reference) {
      if (isArray) {
        if (reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING)
          return `${baseSchemaPropertyName.replace(/s$/, '')}_ids`; // suffix w/ ids, since its an array of fks
        if (reference.method === SqlSchemaReferenceMethod.IMPLICIT_BY_UUID)
          return `${baseSchemaPropertyName.replace(/_uuids$/, '')}_ids`; // suffix w/ ids, since its an array of fks
      }
      if (reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING) return `${baseSchemaPropertyName}_id`; // suffix w/ id, since its a fk
      if (reference.method === SqlSchemaReferenceMethod.IMPLICIT_BY_UUID)
        return `${baseSchemaPropertyName.replace(/_uuid$/, '')}_id`; // suffix w/ id, since its a fk
    }
    return baseSchemaPropertyName; // otherwise, its just the regular name, no modifications
  })();

  return new SqlSchemaPropertyMetadata({
    name: schemaPropertyName,
    isUpdatable,
    isNullable,
    isArray,
    isDatabaseGenerated: false, // this method is only called for properties that are not database generated (as checked above)
    reference,
  });
};
