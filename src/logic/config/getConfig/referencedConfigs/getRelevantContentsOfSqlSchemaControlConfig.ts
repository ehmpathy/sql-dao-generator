import { GeneratorConfig } from '../../../../domain';
import { readYmlFile } from '../../../../utils/fileio/readYmlFile';
import { UserInputError } from '../../../UserInputError';

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
