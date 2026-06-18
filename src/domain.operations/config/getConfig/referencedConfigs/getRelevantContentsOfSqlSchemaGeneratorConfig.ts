import type { GeneratorConfig } from '@src/domain';
import { UserInputError } from '@src/domain.operations/UserInputError';
import { readYmlFile } from '@src/utils/fileio/readYmlFile';

export const getRelevantContentsOfSqlSchemaGeneratorConfig = async ({
  pathToConfig,
}: {
  pathToConfig: string;
}): Promise<GeneratorConfig['generates']['schema']['config']['content']> => {
  // grab the contents
  const contents = await readYmlFile({ filePath: pathToConfig });

  // make sure relevant contents are defined
  if (!contents.declarations)
    throw new UserInputError({
      reason: `sql-schema-generator config must have "declarations" defined. (see ${pathToConfig})`,
    });
  if (!contents.generates?.sql?.to)
    throw new UserInputError({
      reason: `sql-schema-generator config must have "generates.sql.to" defined. (see ${pathToConfig})`,
    });

  // return the relevant content
  return {
    declarations: contents.declarations,
    generates: { sql: { to: contents.generates.sql.to } },
  };
};
