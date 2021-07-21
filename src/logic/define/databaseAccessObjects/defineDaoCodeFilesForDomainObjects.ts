import { DomainObjectMetadata } from 'domain-objects-metadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
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
        throw new Error('could not find sql-schema-relationship, this is a bug within sql-dao-generator'); // fail fast if this is met; this should never occur
      return defineDaoCodeFilesForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: sqlSchemaRelationships,
      });
    })
    .flat();
