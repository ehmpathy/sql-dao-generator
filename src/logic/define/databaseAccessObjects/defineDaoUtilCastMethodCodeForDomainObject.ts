import { camelCase, snakeCase } from 'change-case';
import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  isDomainObjectArrayProperty,
  isDomainObjectReferenceProperty,
} from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { defineOutputTypeOfFoundDomainObject } from './defineOutputTypeOfFoundDomainObject';

export const defineDaoUtilCastMethodCodeForDomainObject = ({
  domainObject,
  sqlSchemaRelationship,
}: {
  domainObject: DomainObjectMetadata;
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
}) => {
  // define the referenced domain objects to hydrate
  const nestedDomainObjectNames = [
    ...new Set(
      Object.values(domainObject.properties)
        .map((property) => {
          if (isDomainObjectReferenceProperty(property))
            return property.of.name;
          if (
            isDomainObjectArrayProperty(property) &&
            isDomainObjectReferenceProperty(property.of)
          )
            return property.of.of.name;
          return null;
        })
        .filter(isPresent)
        .sort(),
    ),
  ];

  // define the imports
  const imports = [
    ...new Set([
      // always present imports
      "import { HasMetadata } from 'type-fns';",
      '', // split module from relative imports
      `import { ${domainObject.name} } from '$PATH_TO_DOMAIN_OBJECT';`, // import this domain object; note: higher level function will swap out the import path
      `import { ${[domainObject.name, ...nestedDomainObjectNames]
        .map((domainObjectName) => `SqlQueryFind${domainObjectName}ByIdOutput`)
        .sort()
        .join(', ')} } from '$PATH_TO_GENERATED_SQL_TYPES';`,
      ...nestedDomainObjectNames
        .map(
          (domainObjectName) =>
            `import { castFromDatabaseObject as cast${domainObjectName}FromDatabaseObject } from '../${camelCase(
              domainObjectName,
            )}Dao/castFromDatabaseObject';`,
        )
        .sort(),
    ]),
  ];

  // define the output type
  const outputType = defineOutputTypeOfFoundDomainObject(domainObject);

  // define the properties
  const propertiesToInstantiate = [
    ...sqlSchemaRelationship.properties.map(
      ({
        sqlSchema: sqlSchemaProperty,
        domainObject: domainObjectProperty,
      }) => {
        // if domain object property is not defined, then no need to define how to cast from it
        if (!domainObjectProperty) return null;

        // enum case
        if (domainObjectProperty.type === DomainObjectPropertyType.ENUM)
          return `${domainObjectProperty.name}: dbObject.${sqlSchemaProperty.name} as ${domainObject.name}['${domainObjectProperty.name}']`;

        // array of non-reference uuids case
        if (
          isDomainObjectArrayProperty(domainObjectProperty) &&
          domainObjectProperty.of.type === DomainObjectPropertyType.STRING &&
          !sqlSchemaProperty.reference // only for cases where its not an fk based implicit-uuid-reference
        )
          return `${domainObjectProperty.name}: dbObject.${sqlSchemaProperty.name} as string[]`; // assure typescript that we _know_ its a string array (not null, or number[])

        // non-reference case
        if (!sqlSchemaProperty.reference) {
          return `${domainObjectProperty.name}: dbObject.${sqlSchemaProperty.name}`;
        }

        // referenced by uuid case
        if (
          sqlSchemaProperty.reference.method ===
          SqlSchemaReferenceMethod.IMPLICIT_BY_UUID
        ) {
          // solo reference case
          if (!sqlSchemaProperty.isArray)
            return `${domainObjectProperty.name}: dbObject.${snakeCase(
              domainObjectProperty.name,
            )}`;

          // array reference case
          return `${domainObjectProperty.name}: dbObject.${snakeCase(
            domainObjectProperty.name,
          )} as string[]`; // as string array since we have an array of uuids - but the type defs generated from sql will complain that it could be string[] or number[] or null (not smart enough to look all the way through fn defs yet)
        }

        // directly nested case
        if (
          sqlSchemaProperty.reference.method ===
          SqlSchemaReferenceMethod.DIRECT_BY_NESTING
        ) {
          const nullabilityPrefix = sqlSchemaProperty.isNullable
            ? `dbObject.${snakeCase(
                domainObjectProperty.name,
              )} === null ? null : `
            : '';

          // solo reference case
          if (!sqlSchemaProperty.isArray)
            return `${domainObjectProperty.name}: ${nullabilityPrefix}cast${
              sqlSchemaProperty.reference.of.name
            }FromDatabaseObject(dbObject.${snakeCase(
              domainObjectProperty.name,
            )} as SqlQueryFind${
              sqlSchemaProperty.reference.of.name
            }ByIdOutput)`;

          // array reference case
          return `${domainObjectProperty.name}: (dbObject.${snakeCase(
            domainObjectProperty.name,
          )} as SqlQueryFind${
            sqlSchemaProperty.reference.of.name
          }ByIdOutput[]).map(cast${
            sqlSchemaProperty.reference.of.name
          }FromDatabaseObject)`;
        }

        // directly declared case
        if (
          sqlSchemaProperty.reference.method ===
          SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION
        ) {
          const nullabilityPrefix = sqlSchemaProperty.isNullable
            ? `dbObject.${snakeCase(
                domainObjectProperty.name,
              )} === null ? null : `
            : '';

          // solo reference case
          if (!sqlSchemaProperty.isArray)
            return `${
              domainObjectProperty.name
            }: ${nullabilityPrefix}{ uuid: dbObject.${
              snakeCase(domainObjectProperty.name).replace(/_ref$/, '_uuid') // todo: get a ref-by-unique json object back, instead of just the uuid
            } }`;

          // array reference case
          return `${domainObjectProperty.name}: (dbObject.${
            snakeCase(domainObjectProperty.name).replace(/_refs$/, '_uuids') // todo: get a ref-by-unique json object back, instead of just the uuid
          } as string[]).map(uuid => ({ uuid }))`; // as string array since we have an array of uuids - but the type defs generated from sql will complain that it could be string[] or number[] or null (not smart enough to look all the way through fn defs yet)
        }

        // handle unexpected case (each case should have been handled above)
        throw new UnexpectedCodePathDetectedError({
          reason:
            'unexpected property type to instantiate in dao castFromDatabaseObject to generate',
          domainObjectName: domainObject.name,
          domainObjectPropertyName: domainObjectProperty.name,
        }); // fail fast if reached here
      },
    ),
  ].filter(isPresent);

  // define the content
  const code = `
${imports.join('\n')}

export const castFromDatabaseObject = (
  dbObject: SqlQueryFind${domainObject.name}ByIdOutput,
): ${outputType} =>
  new ${domainObject.name}({
    ${propertiesToInstantiate.join(',\n    ')},
  }) as ${outputType};
`.trim();

  // return the code
  return code;
};
