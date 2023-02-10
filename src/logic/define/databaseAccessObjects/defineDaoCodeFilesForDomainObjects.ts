import { DomainObjectMetadata } from 'domain-objects-metadata';

import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { defineDaoCodeFilesForDomainObject } from './defineDaoCodeFilesForDomainObject';

export const defineDaoCodeFilesForDomainObjects = ({
  domainObjects,
  sqlSchemaRelationships,
}: {
  domainObjects: DomainObjectMetadata[];
  sqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}) =>
  domainObjects
    .map((domainObject) => {
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
    })
    .flat();
