import { pascalCase } from 'change-case';
import {
  DomainObjectMetadata,
  DomainObjectVariant,
} from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import { GeneratedCodeFile } from '../../../domain/objects/GeneratedCodeFile';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { castDomainObjectNameToDaoName } from './castDomainObjectNameToDaoName';
import {
  defineDaoFindByMethodCodeForDomainObject,
  FindByQueryType,
} from './defineDaoFindByMethodCodeForDomainObject';
import { defineDaoFindByRefMethodCodeForDomainObject } from './defineDaoFindByRefMethodCodeForDomainObject';
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
  const hasRefCapacity =
    (domainObject.extends === DomainObjectVariant.DOMAIN_ENTITY ||
      domainObject.extends === DomainObjectVariant.DOMAIN_EVENT) &&
    domainObject.decorations.unique?.[0] !== 'uuid'; // if unique on .uuid, then dont give it a ref

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
    hasRefCapacity ? 'findByRef' : null,
    'upsert',
  ].filter(isPresent);
  const indexImports = [
    `import { withExpectOutput } from 'procedure-fns';`,
    '',
    ...daoMethodNames.map(
      (daoMethodName) =>
        `import { ${daoMethodName} } from './${daoMethodName}';`,
    ),
  ];
  const daoMethodNamesWithExpectOutput = [
    'findByUnique',
    'findByUuid',
    'findById',
    'findByRef',
  ];
  const indexFile = new GeneratedCodeFile({
    relpath: `${castDomainObjectNameToDaoName(domainObject.name)}/index.ts`,
    content: `
${indexImports.join('\n')}

export const ${castDomainObjectNameToDaoName(domainObject.name)} = {
  ${daoMethodNames
    .map((daoMethodName) => {
      const shouldExpectOutput =
        daoMethodNamesWithExpectOutput.includes(daoMethodName);
      if (!shouldExpectOutput) return daoMethodName;
      return `${daoMethodName}: withExpectOutput(${daoMethodName})`;
    })
    .join(',\n  ')},
};

// include an alias, for improved ease of access via autocomplete
export const dao${pascalCase(
      domainObject.name,
    )} = ${castDomainObjectNameToDaoName(domainObject.name)};
    `.trim(),
  });

  // define the casting method
  const castFromDatabaseObjectMethodFile = new GeneratedCodeFile({
    relpath: `${castDomainObjectNameToDaoName(
      domainObject.name,
    )}/castFromDatabaseObject.ts`,
    content: defineDaoUtilCastMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    }),
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
    relpath: `${castDomainObjectNameToDaoName(
      domainObject.name,
    )}/findByUnique.ts`,
    content: defineDaoFindByMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships,
      findByQueryType: FindByQueryType.UNIQUE,
    }),
  });
  const findByUuidMethodFile = hasUuidProperty
    ? new GeneratedCodeFile({
        relpath: `${castDomainObjectNameToDaoName(
          domainObject.name,
        )}/findByUuid.ts`,
        content: defineDaoFindByMethodCodeForDomainObject({
          domainObject,
          sqlSchemaRelationship,
          allSqlSchemaRelationships,
          findByQueryType: FindByQueryType.UUID,
        }),
      })
    : null;
  const findByRefMethodFile = hasRefCapacity
    ? new GeneratedCodeFile({
        relpath: `${castDomainObjectNameToDaoName(
          domainObject.name,
        )}/findByRef.ts`,
        content: defineDaoFindByRefMethodCodeForDomainObject({
          domainObject,
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
    findByRefMethodFile,
    upsertMethodFile,
  ].filter(isPresent);
};
