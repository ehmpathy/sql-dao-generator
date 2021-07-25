import { GeneratorConfig } from '../../domain';
import { GeneratedCodeFile } from '../../domain/objects/GeneratedCodeFile';
import { getNormalizedPath } from '../../utils/filepaths/getNormalizedPath';
import { getRelativePath } from '../../utils/filepaths/getRelativePath';
import { saveCode } from './saveCode';

export const saveGeneratedDatabaseAccessObjectCodeFiles = async ({
  config,
  files,
}: {
  config: GeneratorConfig;
  files: GeneratedCodeFile[];
}) => {
  const projectRootDir = config.rootDir;

  // define the root that the files are relative to
  const relativeRootDirOfDaoFiles = config.generates.daos.to;

  // define how to get absolute path of this file
  const getAbsolutePathOfDaoFile = (file: GeneratedCodeFile) =>
    getNormalizedPath(`${projectRootDir}/${relativeRootDirOfDaoFiles}/${file.relpath}`);

  // replace the placeholder import paths in each of the files
  const filesWithHydratedImportPaths = files.map(
    (file) =>
      new GeneratedCodeFile({
        ...file,
        content: file.content
          .replace(
            '$PATH_TO_DATABASE_CONNECTION',
            getRelativePath({
              from: getAbsolutePathOfDaoFile(file),
              to: getNormalizedPath(
                `${projectRootDir}/${config.generates.daos.using.DatabaseConnection.split('#')[0]}`,
              ).replace(/\.ts$/, ''),
            }),
          )
          .replace(
            '$PATH_TO_LOG_OBJECT',
            getRelativePath({
              from: getAbsolutePathOfDaoFile(file),
              to: getNormalizedPath(`${projectRootDir}/${config.generates.daos.using.log.split('#')[0]}`),
            }).replace(/\.ts$/, ''),
          )
          .replace(
            '$PATH_TO_DOMAIN_OBJECT',
            getRelativePath({
              from: getAbsolutePathOfDaoFile(file),
              to: getNormalizedPath(`${projectRootDir}/src/domain`), // TODO: get this from domain objects metadata, per domain object
            }).replace(/\.ts$/, ''),
          )
          .replace(
            '$PATH_TO_GENERATED_SQL_TYPES',
            getRelativePath({
              from: getAbsolutePathOfDaoFile(file),
              to: getNormalizedPath(
                `${projectRootDir}/${config.generates.code.config.content.generates.types}`,
              ).replace(/\.ts$/, ''),
            }),
          )
          .replace(
            '$PATH_TO_GENERATED_SQL_QUERY_FUNCTIONS',
            getRelativePath({
              from: getAbsolutePathOfDaoFile(file),
              to: getNormalizedPath(
                `${projectRootDir}/${config.generates.code.config.content.generates.queryFunctions}`,
              ).replace(/\.ts$/, ''),
            }),
          ),
      }),
  );

  // save the generated files (using a for loop to preserve order of when each file is saved -> output message display order)
  for (const file of filesWithHydratedImportPaths) {
    await saveCode({
      rootDir: projectRootDir,
      relativeFilePath: getNormalizedPath(`${relativeRootDirOfDaoFiles}/${file.relpath}`),
      code: file.content,
    });
  }
};
