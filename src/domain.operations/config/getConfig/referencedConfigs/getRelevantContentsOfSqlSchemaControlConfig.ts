import type { GeneratorConfig } from '@src/domain';
import { UserInputError } from '@src/domain.operations/UserInputError';
import { readYmlFile } from '@src/utils/fileio/readYmlFile';

export const getRelevantContentsOfSqlSchemaControlConfig = async ({
  pathToConfig,
}: {
  pathToConfig: string;
}): Promise<GeneratorConfig['generates']['control']['config']['content']> => {
  // grab the contents
  const contents = await readYmlFile({ filePath: pathToConfig });

  // make sure relevant contents are defined
  if (!contents.definitions)
    throw new UserInputError({
      reason: `sql-schema-control config must have "definitions" defined. (see ${pathToConfig})`,
    });

  // return the relevant content
  return {
    definitions: contents.definitions,
  };
};
