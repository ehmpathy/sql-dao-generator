import { camelCase } from 'change-case';
import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';

import { SqlSchemaPropertyMetadata } from '../../../domain/objects/SqlSchemaPropertyMetadata';
import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
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
  if (!sqlSchemaProperty.reference) {
    if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
      return `${domainObjectProperty.name}: ${domainObjectUpsertVarName}.${domainObjectProperty.name}`;
    return domainObjectProperty.name;
  }

  // since we know its a reference, lookup the referenced sqlSchemaRelationship
  const referencedSqlSchemaRelationship = allSqlSchemaRelationships.find(
    (rel) => rel.name.domainObject === sqlSchemaProperty.reference!.of.name,
  );
  if (!referencedSqlSchemaRelationship)
    throw new UnexpectedCodePathDetectedError({
      reason:
        'could not find referenced sql schema relationship for defining query fn input expression',
      domainObjectName,
      domainObjectPropertyName: domainObjectProperty.name,
    });
  const referencedSqlSchemaName =
    referencedSqlSchemaRelationship.name.sqlSchema;
  const referencedDomainObjectName =
    referencedSqlSchemaRelationship.name.domainObject;

  // if its an implicit uuid reference, then all the legwork is done in the sql. simple case here
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.IMPLICIT_BY_UUID
  ) {
    if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
      return `${domainObjectProperty.name}: ${domainObjectUpsertVarName}.${domainObjectProperty.name}`;
    return `${domainObjectProperty.name}`;
  }

  // for direct references, we need to map to the "id"
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.DIRECT_BY_NESTING
  ) {
    // handle solo reference
    if (!sqlSchemaProperty.isArray) {
      const domainObjectPropertyVariableName =
        context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY
          ? `${domainObjectUpsertVarName}.${domainObjectProperty.name}`
          : domainObjectProperty.name;

      const nullabilityPrefix = sqlSchemaProperty.isNullable
        ? `${domainObjectPropertyVariableName} === null ? null : `
        : '';

      if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
        // e.g.,: `geocodeId: location.geocode.id ? location.geocode.id : (await geocodeDao.upsert({ dbConnection, geocode: location.geocode })).id`
        return `${camelCase(
          sqlSchemaProperty.name,
        )}: ${nullabilityPrefix}${domainObjectPropertyVariableName}.id ? ${domainObjectPropertyVariableName}.id : (await ${castDomainObjectNameToDaoName(
          referencedDomainObjectName,
        )}.upsert({ dbConnection, ${camelCase(
          referencedSqlSchemaName,
        )}: ${domainObjectPropertyVariableName} })).id`;

      // e.g., `geocodeId: geocode.id`
      return `${camelCase(sqlSchemaProperty.name)}: ${nullabilityPrefix}${
        domainObjectProperty.name
      }.id`;
    }

    // handle array of references
    if (sqlSchemaProperty.isArray) {
      if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
        // e.g.,: `geocodeIds: await Promise.all(location.geocodes.map(async (geocode) => geocode.id ? geocode.id : (await geocodeDao.upsert({ dbConnection, geocode: location.geocode })).id)`
        return `${camelCase(
          sqlSchemaProperty.name,
        )}: await Promise.all(${domainObjectUpsertVarName}.${
          domainObjectProperty.name
        }.map(async (${camelCase(referencedSqlSchemaName)}) => ${camelCase(
          referencedSqlSchemaName,
        )}.id ? ${camelCase(
          referencedSqlSchemaName,
        )}.id : (await ${castDomainObjectNameToDaoName(
          referencedDomainObjectName,
        )}.upsert({ dbConnection, ${camelCase(
          referencedSqlSchemaName,
        )} })).id))`;

      // e.g., `geocodeIds: geocodes.map(geocode => geocode.id)`
      return `${camelCase(sqlSchemaProperty.name)}: ${
        domainObjectProperty.name
      }.map((${camelCase(referencedSqlSchemaName)}) => ${camelCase(
        referencedSqlSchemaName,
      )}.id)`;
    }
  }

  // fail fast if we reach here, not expected
  throw new UnexpectedCodePathDetectedError({
    reason:
      'did not handle the request with any defined conditions, for query function input expression',
    domainObjectName,
    domainObjectPropertyName: domainObjectProperty.name,
  }); // fail fast if our expectation is not met though
};
