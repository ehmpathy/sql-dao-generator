import { GeneratorConfig } from '../../domain';
import { GeneratedCodeFile } from '../../domain/objects/GeneratedCodeFile';
import { getDirOfPath } from '../../utils/filepaths/getDirOfPath';
import { saveCode } from './saveCode';

export const saveGeneratedSqlSchemaGeneratorCodeFiles = async ({
  config,
  files,
}: {
  config: GeneratorConfig;
  files: GeneratedCodeFile[];
}) => {
  const projectRootDir = config.rootDir;

  // define the root that the files are relative to
  const relativeRootDirOfGeneratorInputFiles = getDirOfPath(
    `${getDirOfPath(config.generates.schema.config.path)}/${config.generates.schema.config.content.declarations}`,
  );

  // save the generated files
  await Promise.all(
    files.map(async (file) =>
      saveCode({
        rootDir: projectRootDir,
        relativeFilePath: `${relativeRootDirOfGeneratorInputFiles}/${file.relpath}`,
        code: file.content,
      }),
    ),
  );
};
