import type { DomainObjectMetadata } from 'domain-objects-metadata';

import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '@src/domain.operations/UnexpectedCodePathDetectedError';

import { defineDaoCodeFilesForDomainObject } from './defineDaoCodeFilesForDomainObject';

export const defineDaoCodeFilesForDomainObjects = ({
  domainObjects,
  sqlSchemaRelationships,
}: {
  domainObjects: DomainObjectMetadata[];
  sqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}) =>
  domainObjects.flatMap((domainObject) => {
    const sqlSchemaRelationship = sqlSchemaRelationships.find(
      (relationship) => relationship.name.domainObject === domainObject.name,
    );
    if (!sqlSchemaRelationship)
      // fail fast if this is met; this should never occur
      throw new UnexpectedCodePathDetectedError({
        reason: 'could not find sql-schema-relationship',
        domainObjectName: domainObject.name,
      });
    return defineDaoCodeFilesForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: sqlSchemaRelationships,
    });
  });
