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
  dobjInputVarName,
  sqlSchemaProperty,
  domainObjectProperty,
  allSqlSchemaRelationships,
  context,
}: {
  domainObjectName: string;
  dobjInputVarName: string;
  sqlSchemaProperty: SqlSchemaPropertyMetadata;
  domainObjectProperty: DomainObjectPropertyMetadata;
  allSqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
  context: GetTypescriptCodeForPropertyContext;
}): string => {
  // if its a non-reference, then just return the property directly
  if (!sqlSchemaProperty.reference) {
    if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
      return `${domainObjectProperty.name}: ${dobjInputVarName}.${domainObjectProperty.name}`;
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
  const referencedDomainObjectAttributeName = camelCase(
    referencedSqlSchemaName,
  );
  const referencedDomainObjectUpsertInputVariableName =
    referencedSqlSchemaRelationship.decorations.alias.domainObject
      ? camelCase(
          referencedSqlSchemaRelationship.decorations.alias.domainObject,
        )
      : referencedDomainObjectAttributeName;

  // if its an implicit uuid reference, then all the legwork is done in the sql. simple case here
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.IMPLICIT_BY_UUID
  ) {
    if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
      return `${domainObjectProperty.name}: ${dobjInputVarName}.${domainObjectProperty.name}`;
    return `${domainObjectProperty.name}`;
  }

  // for direct nested references, we need to map to the "id"
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.DIRECT_BY_NESTING
  ) {
    // handle solo reference
    if (!sqlSchemaProperty.isArray) {
      const domainObjectPropertyVariableName =
        context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY
          ? `${dobjInputVarName}.${domainObjectProperty.name}`
          : domainObjectProperty.name;

      const nullabilityPrefix = sqlSchemaProperty.isNullable
        ? `${domainObjectPropertyVariableName} === null ? null : `
        : '';

      if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
        // e.g.,: `geocodeId: location.geocode.id ? location.geocode.id : (await geocodeDao.upsert({ geocode: location.geocode }, context)).id`
        return `${camelCase(
          sqlSchemaProperty.name,
        )}: ${nullabilityPrefix}${domainObjectPropertyVariableName}.id ? ${domainObjectPropertyVariableName}.id : (await ${castDomainObjectNameToDaoName(
          referencedDomainObjectName,
        )}.upsert({ ${referencedDomainObjectUpsertInputVariableName}: ${domainObjectPropertyVariableName} }, context)).id`;

      // e.g., `geocodeId: geocode.id`
      return `${camelCase(sqlSchemaProperty.name)}: ${nullabilityPrefix}${
        domainObjectProperty.name
      }.id ? ${domainObjectPropertyVariableName}.id : ((await ${castDomainObjectNameToDaoName(
        referencedDomainObjectName,
      )}.findByUnique(${domainObjectPropertyVariableName}, context))?.id ?? -1)`;
    }

    // handle array of references
    if (sqlSchemaProperty.isArray) {
      if (context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY)
        // e.g.,: `geocodeIds: await Promise.all(location.geocodes.map(async (geocode) => geocode.id ? geocode.id : (await geocodeDao.upsert({ geocode: location.geocode }, context)).id)`
        return `${camelCase(
          sqlSchemaProperty.name,
        )}: await Promise.all(${dobjInputVarName}.${
          domainObjectProperty.name
        }.map(async (${referencedDomainObjectUpsertInputVariableName}) => ${referencedDomainObjectUpsertInputVariableName}.id ? ${referencedDomainObjectUpsertInputVariableName}.id : (await ${castDomainObjectNameToDaoName(
          referencedDomainObjectName,
        )}.upsert({ ${referencedDomainObjectUpsertInputVariableName} }, context)).id))`;

      // e.g., `geocodeIds: geocodes.map(geocode => geocode.id)`
      return `${camelCase(sqlSchemaProperty.name)}: await Promise.all(${
        domainObjectProperty.name
      }.map(async (${referencedDomainObjectAttributeName}) => ${referencedDomainObjectAttributeName}.id ? ${referencedDomainObjectAttributeName}.id : ((await ${castDomainObjectNameToDaoName(
        referencedDomainObjectName,
      )}.findByUnique(${referencedDomainObjectAttributeName}, context))?.id ?? -1) ))`;
    }
  }

  // for direct declaration references, we need to map to the "uuid"
  /**
   * invoiceUuid: isPrimaryKeyRef({ of: ProviderAdsInvoice })(item.invoiceRef)
        ? item.invoiceRef.uuid
        : (
            await daoProviderAdsInvoice
              .findByRef({ ref: item.invoiceRef }, context)
              .expect('isPresent')
          ).uuid,
   */
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION
  ) {
    // handle solo reference
    if (!sqlSchemaProperty.isArray) {
      const domainObjectPropertyVariableName =
        context === GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY
          ? `${dobjInputVarName}.${domainObjectProperty.name}`
          : domainObjectProperty.name;

      const nullabilityPrefix = sqlSchemaProperty.isNullable
        ? `${domainObjectPropertyVariableName} === null ? null : `
        : '';

      return `${camelCase(
        domainObjectProperty.name.replace(/Ref$/, 'Uuid'),
      )}: ${nullabilityPrefix}isPrimaryKeyRef({ of: ${referencedDomainObjectName} })(${domainObjectPropertyVariableName}) ? ${domainObjectPropertyVariableName}.uuid : (await ${castDomainObjectNameToDaoName(
        referencedDomainObjectName,
      )}.findByRef({ ref: ${domainObjectPropertyVariableName} }, context).expect('isPresent')).uuid`;
    }

    // handle array of references
    if (sqlSchemaProperty.isArray) throw new Error('todo'); // todo: ran out of time allocated for this upgrade; lets fix when we have the usecase
  }

  // fail fast if we reach here, not expected
  throw new UnexpectedCodePathDetectedError({
    reason:
      'did not handle the request with any defined conditions, for query function input expression',
    domainObjectName,
    domainObjectPropertyName: domainObjectProperty.name,
  }); // fail fast if our expectation is not met though
};
