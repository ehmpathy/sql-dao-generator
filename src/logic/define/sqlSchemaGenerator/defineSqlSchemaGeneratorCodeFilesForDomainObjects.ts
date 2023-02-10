import { camelCase } from 'change-case';
import { DomainObjectMetadata } from 'domain-objects-metadata';

import { GeneratedCodeFile } from '../../../domain/objects/GeneratedCodeFile';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '../../UnexpectedCodePathDetectedError';
import { defineSqlSchemaGeneratorCodeForDomainObject } from './defineSqlSchemaGeneratorCodeForDomainObject';

/**
 * returns GeneratedCode[] of definitions for sql-schema-control, per domain object
 */
export const defineSqlSchemaGeneratorCodeFilesForDomainObjects = ({
  domainObjects,
  sqlSchemaRelationships,
}: {
  domainObjects: DomainObjectMetadata[];
  sqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}): GeneratedCodeFile[] => {
  // for each metadata, define a "code" file
  const objectsCodeFiles = domainObjects.map((domainObject) => {
    const sqlSchemaRelationship = sqlSchemaRelationships.find(
      (relationship) => relationship.name.domainObject === domainObject.name,
    );
    if (!sqlSchemaRelationship)
      throw new UnexpectedCodePathDetectedError({
        reason:
          'could not find sql-schema-relationship, for defining sql-schema-generator code files',
        domainObjectName: domainObject.name,
      });
    const content = defineSqlSchemaGeneratorCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    });
    return new GeneratedCodeFile({
      content,
      relpath: `${camelCase(domainObject.name)}.ts`,
    });
  });

  // and define a root "index" file for the entities, to be used as an entry point
  const imports = domainObjects
    .map(
      (domainObject) =>
        `import { ${camelCase(domainObject.name)} } from './${camelCase(
          domainObject.name,
        )}';`,
    )
    .sort();
  const indexContent = `
${imports.join('\n')}

/**
 * all of the domain objects which we want to create sql-schema-resources for with sql-schema-generator
 */
export const generateSqlSchemasFor = [
  ${domainObjects.map(({ name }) => `${camelCase(name)}`).join(',\n  ')},
];
  `.trim();
  const indexCodeFile = new GeneratedCodeFile({
    content: indexContent,
    relpath: 'index.ts',
  });

  // return all of the files
  return [indexCodeFile, ...objectsCodeFiles];
};
