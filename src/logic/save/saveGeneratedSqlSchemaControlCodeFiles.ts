import { GeneratorConfig } from '../../domain';
import { GeneratedCodeFile } from '../../domain/objects/GeneratedCodeFile';
import { getDirOfPath } from '../../utils/filepaths/getDirOfPath';
import { saveCode } from './saveCode';

export const saveGeneratedSqlSchemaControlCodeFiles = async ({
  config,
  file,
}: {
  config: GeneratorConfig;
  file: GeneratedCodeFile;
}) => {
  const projectRootDir = config.rootDir;

  // domain.yml object destination = right at the root of where sql schema generator generates its files
  const domainControlPath = `${getDirOfPath(
    config.generates.schema.config.path,
  )}/${config.generates.schema.config.content.generates.sql.to}/domain.yml`;

  // save the file
  await saveCode({
    rootDir: projectRootDir,
    relativeFilePath: domainControlPath,
    code: file.content,
  });
};
