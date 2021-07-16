import { camelCase } from 'change-case';
import { DomainObjectMetadata } from 'domain-objects-metadata';

import { defineSqlSchemaGeneratorCodeForDomainObject } from './defineSqlSchemaGeneratorCodeForDomainObject';

interface GeneratedCodeFile {
  content: string;
  format: 'ts' | 'yml';
  relpath: string; // the relative path of this file, from whatever the root is decided to be
}

/**
 * returns GeneratedCode[] of definitions for sql-schema-control, per domain object
 */
export const defineSqlSchemaGeneratorCodeForDomainObjects = ({ metadatas }: { metadatas: DomainObjectMetadata[] }) => {
  // for each metadata, define a "code" file
  return metadatas.map((metadata) => {
    const content = defineSqlSchemaGeneratorCodeForDomainObject({ metadata, allMetadatas: metadatas });
    return {
      content,
      format: 'ts',
      relpath: `${camelCase(metadata.name)}.ts`,
    };
  });
};
