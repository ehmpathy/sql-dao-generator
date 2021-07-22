import { DomainObjectMetadata } from 'domain-objects-metadata';
import { isPresent } from 'simple-type-guards';
import { GeneratedCodeFile } from '../../../domain/objects/GeneratedCodeFile';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { castDomainObjectNameToDaoName } from './castDomainObjectNameToDaoName';
import { defineDaoFindByMethodCodeForDomainObject, FindByQueryType } from './defineDaoFindByMethodCodeForDomainObject';
import { defineDaoUpsertMethodCodeForDomainObject } from './defineDaoUpsertMethodCodeForDomainObject';
import { defineDaoUtilCastMethodCodeForDomainObject } from './defineDaoUtilCastMethodCodeForDomainObject';

/**
 * each domain object gets its own dao
 *
 * each dao has multiple files:
 * - index
 * - cast/fromDatabaseObject
 * - findById (if id is defined on domain object)
 * - findByUuid (if uuid is defined on domain object)
 * - findByUnique
 * - upsert
 */
export const defineDaoCodeFilesForDomainObject = ({
  domainObject,
  sqlSchemaRelationship,
  allSqlSchemaRelationships,
}: {
  domainObject: DomainObjectMetadata;
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
  allSqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}): GeneratedCodeFile[] => {
  // define some useful info
  const hasIdProperty = !!domainObject.properties.id;
  const hasUuidProperty = !!domainObject.properties.uuid;

  // check that domain object has id. we dont support not having an id
  if (!hasIdProperty)
    throw new Error(
      `domain objects must have an id property in order to have dao generated. ${domainObject.name} does not meet this condition.`,
    );

  // define the index file
  const daoMethodNames = [
    hasIdProperty ? 'findById' : null,
    'findByUnique',
    hasUuidProperty ? 'findByUuid' : null,
    'upsert',
  ].filter(isPresent);
  const indexImports = daoMethodNames.map((daoMethodName) => `import { ${daoMethodName} } from './${daoMethodName}';`);
  const indexFile = new GeneratedCodeFile({
    relpath: `${castDomainObjectNameToDaoName(domainObject.name)}/index.ts`,
    content: `
${indexImports.join('\n')}

export const ${castDomainObjectNameToDaoName(domainObject.name)} = {
  ${daoMethodNames.join(',\n  ')},
};
    `.trim(),
  });

  // define the casting method
  const castFromDatabaseObjectMethodFile = new GeneratedCodeFile({
    relpath: `${castDomainObjectNameToDaoName(domainObject.name)}/castFromDatabaseObject.ts`,
    content: defineDaoUtilCastMethodCodeForDomainObject({ domainObject, sqlSchemaRelationship }),
  });

  // define the find by methods
  const findByIdMethodFile = new GeneratedCodeFile({
    relpath: `${castDomainObjectNameToDaoName(domainObject.name)}/findById.ts`,
    content: defineDaoFindByMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships,
      findByQueryType: FindByQueryType.ID,
    }),
  });
  const findByUniqueMethodFile = new GeneratedCodeFile({
    relpath: `${castDomainObjectNameToDaoName(domainObject.name)}/findByUnique.ts`,
    content: defineDaoFindByMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships,
      findByQueryType: FindByQueryType.UNIQUE,
    }),
  });
  const findByUuidMethodFile = hasUuidProperty
    ? new GeneratedCodeFile({
        relpath: `${castDomainObjectNameToDaoName(domainObject.name)}/findByUuid.ts`,
        content: defineDaoFindByMethodCodeForDomainObject({
          domainObject,
          sqlSchemaRelationship,
          allSqlSchemaRelationships,
          findByQueryType: FindByQueryType.UUID,
        }),
      })
    : null;

  // define the upsert method
  const upsertMethodFile = new GeneratedCodeFile({
    relpath: `${castDomainObjectNameToDaoName(domainObject.name)}/upsert.ts`,
    content: defineDaoUpsertMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships,
    }),
  });

  // return all the files
  return [
    indexFile,
    castFromDatabaseObjectMethodFile,
    findByIdMethodFile,
    findByUniqueMethodFile,
    findByUuidMethodFile,
    upsertMethodFile,
  ].filter(isPresent);
};
