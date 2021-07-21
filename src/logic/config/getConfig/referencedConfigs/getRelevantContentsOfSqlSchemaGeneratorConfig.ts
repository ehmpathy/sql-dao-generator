import { GeneratorConfig } from '../../../../domain';
import { readYmlFile } from '../../../../utils/fileio/readYmlFile';

export const getRelevantContentsOfSqlSchemaGeneratorConfig = async ({
  pathToConfig,
}: {
  pathToConfig: string;
}): Promise<GeneratorConfig['generates']['schema']['config']['content']> => {
  // grab the contents
  const contents = await readYmlFile({ filePath: pathToConfig });

  // make sure relevant contents are defined
  if (!contents.declarations)
    throw new Error(`sql-schema-generator config must have "declarations" defined. (see ${pathToConfig})`);
  if (!contents.generates?.sql?.to)
    throw new Error(`sql-schema-generator config must have "generates.sql.to" defined. (see ${pathToConfig})`);

  // return the relevant content
  return {
    declarations: contents.declarations,
    generates: { sql: { to: contents.generates.sql.to } },
  };
};
