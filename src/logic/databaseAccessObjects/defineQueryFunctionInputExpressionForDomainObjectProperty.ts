import { camelCase } from 'change-case';
import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';
import { SqlSchemaPropertyMetadata } from '../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { castDomainObjectNameToDaoName } from './castDomainObjectNameToDaoName';

export enum GetTypescriptCodeForPropertyContext {
  FOR_FIND_BY_QUERY = 'FOR_FIND_BY_QUERY',
  FOR_UPSERT_QUERY = 'FOR_UPSERT_QUERY',
}

export const defineQueryFunctionInputExpressionForDomainObjectProperty = ({
  domainObjectName,
  sqlSchemaProperty,
  domainObjectProperty,
  allSqlSchemaRelationships,
  context,
}: {
  domainObjectName: string;
  sqlSchemaProperty: SqlSchemaPropertyMetadata;
  domainObjectProperty: DomainObjectPropertyMetadata;
  allSqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
  context: GetTypescriptCodeForPropertyContext;
}): string => {
  // define constant used for upsert context
  const domainObjectUpsertVarName = camelCase(domainObjectName);

  // if its a non-reference, then just return the property directly
  if (!sqlSchemaProperty.isArray && !sqlSchemaProperty.reference) {
    if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
      return `${domainObjectProperty.name}: ${domainObjectUpsertVarName}.${domainObjectProperty.name}`;
    return domainObjectProperty.name;
  }

  // since sql-schema-generator does not support arrays of non-references, we can guarantee that its either a reference or an array of references now
  if (!sqlSchemaProperty.reference) throw new Error('unexpected code path, not supported. this is probably a bug'); // fail fast if our expectation is not met though

  // since we know its a reference, lookup the referenced sqlSchemaRelationship
  const referencedSqlSchemaRelationship = allSqlSchemaRelationships.find(
    (rel) => rel.name.domainObject === sqlSchemaProperty.reference!.of.name,
  );
  if (!referencedSqlSchemaRelationship)
    throw new Error('could not find referenced sql schema relationship. this is a bug within sql-dao-generator'); // fail fast, this should not occur
  const referencedSqlSchemaName = referencedSqlSchemaRelationship.name.sqlSchema;
  const referencedDomainObjectName = referencedSqlSchemaRelationship.name.domainObject;

  // if its an implicit uuid reference, then all the legwork is done in the sql. simple case here
  if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.IMPLICIT_BY_UUID) {
    if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
      return `${domainObjectProperty.name}: ${domainObjectUpsertVarName}.${domainObjectProperty.name}`;
    return `${domainObjectProperty.name}`;
  }

  // for direct references, we need to map to the "id"
  if (sqlSchemaProperty.reference.method === SqlSchemaReferenceMethod.DIRECT_BY_NESTING) {
    // handle solo reference
    if (!sqlSchemaProperty.isArray) {
      if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
        // e.g.,: `geocodeId: location.geocode.id ? location.geocode.id : (await geocodeDao.upsert({ dbConnection, geocode: location.geocode })).id`
        return `${camelCase(sqlSchemaProperty.name)}: ${domainObjectUpsertVarName}.${
          domainObjectProperty.name
        }.id ? ${domainObjectUpsertVarName}.${domainObjectProperty.name}.id : (await ${castDomainObjectNameToDaoName(
          referencedDomainObjectName,
        )}.upsert({ dbConnection, ${camelCase(referencedSqlSchemaName)}: ${domainObjectUpsertVarName}.${
          domainObjectProperty.name
        } })).id`;

      // e.g., `geocodeId: geocode.id`
      return `${camelCase(sqlSchemaProperty.name)}: ${domainObjectProperty.name}.id`;
    }

    // handle array of references
    if (sqlSchemaProperty.isArray) {
      if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
        // e.g.,: `geocodeIds: await Promise.all(location.geocodes.map(async (geocode) => geocode.id ? geocode.id : (await geocodeDao.upsert({ dbConnection, geocode: location.geocode })).id)`
        return `${camelCase(sqlSchemaProperty.name)}: await Promise.all(${domainObjectUpsertVarName}.${
          domainObjectProperty.name
        }.map(async (${camelCase(referencedSqlSchemaName)}) => ${camelCase(referencedSqlSchemaName)}.id ? ${camelCase(
          referencedSqlSchemaName,
        )}.id : (await ${castDomainObjectNameToDaoName(referencedDomainObjectName)}.upsert({ dbConnection, ${camelCase(
          referencedSqlSchemaName,
        )} })).id))`;

      // e.g., `geocodeIds: geocodes.map(geocode => geocode.id)`
      return `${camelCase(sqlSchemaProperty.name)}: ${domainObjectProperty.name}.map((${camelCase(
        referencedSqlSchemaName,
      )}) => ${camelCase(referencedSqlSchemaName)}.id)`;
    }
  }

  // fail fast if we reach here, not expected
  throw new Error('unexpected code path. this a bug');
};
