import type { GeneratorConfig } from '@src/domain';
import { UserInputError } from '@src/domain.operations/UserInputError';
import { readYmlFile } from '@src/utils/fileio/readYmlFile';

export const getRelevantContentsOfSqlCodeGeneratorConfig = async ({
  pathToConfig,
}: {
  pathToConfig: string;
}): Promise<GeneratorConfig['generates']['code']['config']['content']> => {
  // grab the contents
  const contents = await readYmlFile({ filePath: pathToConfig });

  // make sure relevant contents are defined
  if (!contents.resources)
    throw new UserInputError({
      reason: `sql-code-generator config must have "resources" defined. (see ${pathToConfig})`,
    });
  if (!contents.queries)
    throw new UserInputError({
      reason: `sql-code-generator config must have "queries" defined. (see ${pathToConfig})`,
    });
  if (!contents.generates?.types)
    throw new UserInputError({
      reason: `sql-code-generator config must have "generates.types" defined. (see ${pathToConfig})`,
    });
  if (!contents.generates?.queryFunctions)
    throw new UserInputError({
      reason: `sql-code-generator config must have "generates.queryFunctions" defined. (see ${pathToConfig})`,
    });

  // return the relevant content
  return {
    resources: contents.resources,
    queries: contents.queries,
    generates: {
      types: contents.generates.types,
      queryFunctions: contents.generates.queryFunctions,
    },
  };
};
