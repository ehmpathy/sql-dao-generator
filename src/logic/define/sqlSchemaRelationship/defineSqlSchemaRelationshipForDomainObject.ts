import { snakeCase } from 'change-case';
import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { UserInputError } from '../../UserInputError';
import { assertDomainObjectIsSafeToHaveSqlSchema } from './assertDomainObjectIsSafeToHaveSqlSchema';
import { defineDatabaseGeneratedSqlSchemaPropertiesForDomainObject } from './defineDatabaseGeneratedPropertiesForDomainObject';
import { defineSqlSchemaPropertyForDomainObjectProperty } from './defineSqlSchemaPropertyForDomainObjectProperty';
import { isNotADatabaseGeneratedProperty } from './isNotADatabaseGeneratedProperty';

export const defineSqlSchemaRelationshipForDomainObject = ({
  domainObject,
  allDomainObjects,
}: {
  domainObject: DomainObjectMetadata;
  allDomainObjects: DomainObjectMetadata[];
}) => {
  // figure out some relevant info
  const sqlSchemaName = snakeCase(domainObject.name); // names are in snake case

  // define the properties
  const databaseGeneratedSqlSchemaProperties =
    defineDatabaseGeneratedSqlSchemaPropertiesForDomainObject({
      domainObject,
    });
  const propertiesRelationship = [
    /// autogenerated values
    ...databaseGeneratedSqlSchemaProperties.map((sqlSchemaProperty) => {
      // see if this property was defined on the domain object (i.e., they want the value for it)
      const domainObjectProperty =
        Object.values(domainObject.properties).find(
          (property) => snakeCase(property.name) === sqlSchemaProperty.name,
        ) ?? null;

      // if so, validate that it has the correct type
      if (domainObjectProperty) {
        const expectedType = (() => {
          if (sqlSchemaProperty.name === 'id')
            return DomainObjectPropertyType.NUMBER;
          if (sqlSchemaProperty.name === 'uuid')
            return DomainObjectPropertyType.STRING;
          if (sqlSchemaProperty.name === 'created_at')
            return DomainObjectPropertyType.DATE;
          if (sqlSchemaProperty.name === 'effective_at')
            return DomainObjectPropertyType.DATE;
          if (sqlSchemaProperty.name === 'updated_at')
            return DomainObjectPropertyType.DATE;
          throw new UnexpectedCodePathDetectedError({
            reason:
              'unexpected database generated property name. this is a bug within sql-schema-generator.', // fail fast if expectations not met
            domainObjectName: domainObject.name,
            domainObjectPropertyName: sqlSchemaProperty.name,
          });
        })();
        if (domainObjectProperty.type !== expectedType)
          throw new UserInputError({
            reason: `reserved database-generated property does not match expected type. expected ${expectedType} but received ${domainObjectProperty.type}`,
            domainObjectName: domainObject.name,
            domainObjectPropertyName: domainObjectProperty.name,
          });
      }

      // return the relationship
      return {
        sqlSchema: sqlSchemaProperty,
        domainObject: domainObjectProperty,
      };
    }),

    // non autogenerated values
    ...Object.values(domainObject.properties)
      .filter(
        (domainObjectProperty) =>
          !databaseGeneratedSqlSchemaProperties
            .map(({ name }) => name)
            .includes(snakeCase(domainObjectProperty.name)), // filter out the db generated values, because we already got them above
      )
      .map((domainObjectProperty) => {
        return {
          sqlSchema: defineSqlSchemaPropertyForDomainObjectProperty({
            property: domainObjectProperty,
            domainObject,
            allDomainObjects,
          }),
          domainObject: domainObjectProperty,
        };
      }),
  ];

  // define the unique keys
  const sqlSchemaUniqueKeys = (() => {
    // define what the unique prop names are, based on what kind of object it is
    const domainObjectPropertyNamesInUniqueKey =
      domainObject.extends === DomainObjectVariant.DOMAIN_LITERAL
        ? propertiesRelationship // if its a literal, the schema is unique on all properties of the object (excluding autogenerated ones like id and uuid)
            .filter(isNotADatabaseGeneratedProperty)
            .map(
              ({ domainObject: domainObjectProperty }) =>
                domainObjectProperty.name,
            )
        : domainObject.decorations.unique; // otherwise, its unique on what was specified

    // convert the domain object prop names into sql schema prop names
    return (
      domainObjectPropertyNamesInUniqueKey?.map((domainObjectPropertyName) => {
        const sqlSchemaPropertyName = propertiesRelationship.find(
          (propertyRelationship) =>
            propertyRelationship.domainObject?.name ===
            domainObjectPropertyName,
        )?.sqlSchema.name;
        if (!sqlSchemaPropertyName)
          throw new UserInputError({
            reason: 'Unique keys must be properties of the domain object.',
            domainObjectName: domainObject.name,
            potentialSolution: ` Was there a typo defining '${
              domainObject.name
            }.unique' with key name '${domainObjectPropertyName}'? (Is it one of ${JSON.stringify(
              Object.keys(domainObject.properties),
            )}?)`,
          });
        return sqlSchemaPropertyName;
      }) ?? null
    );
  })();

  // make sure that this domain object is safe to have a schema defined for it
  assertDomainObjectIsSafeToHaveSqlSchema({ domainObject });

  // return the relationship
  return new SqlSchemaToDomainObjectRelationship({
    name: {
      sqlSchema: sqlSchemaName,
      domainObject: domainObject.name,
    },
    properties: propertiesRelationship,
    decorations: {
      alias: {
        domainObject: domainObject.decorations.alias,
      },
      unique: {
        sqlSchema: sqlSchemaUniqueKeys,
        domainObject: domainObject.decorations.unique,
      },
    },
  });
};
