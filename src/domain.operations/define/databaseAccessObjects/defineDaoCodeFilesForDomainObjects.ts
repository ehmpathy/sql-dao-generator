import type { DomainObjectMetadata } from 'domain-objects-metadata';

import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '@src/domain.operations/UnexpectedCodePathDetectedError';

import { defineDaoCastsCodeFile } from './defineDaoCastsCodeFile';
import { defineDaoCodeFilesForDomainObject } from './defineDaoCodeFilesForDomainObject';

/**
 * .what = defines every dao code file a consumer receives — the shared casts module once, then one
 *         set of files per domain object
 * .why  = it alone sees every domain object, so a shared file is defined here once, never per object
 */
export const defineDaoCodeFilesForDomainObjects = ({
  domainObjects,
  sqlSchemaRelationships,
}: {
  domainObjects: DomainObjectMetadata[];
  sqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}) => [
  // the shared casts module, defined once and imported by every dao that needs a cast
  defineDaoCastsCodeFile(),

  // then one set of files per domain object
  ...domainObjects.flatMap((domainObject) => {
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
  }),
];
