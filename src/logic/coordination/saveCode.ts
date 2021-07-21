import chalk from 'chalk';
import { makeDirectoryAsync } from '../../utils/fileio/makeDirAsync';
import { writeFileAsync } from '../../utils/fileio/writeFileAsync';

export const saveCode = async ({
  rootDir,
  relativeFilePath,
  code,
}: {
  rootDir: string;
  relativeFilePath: string;
  code: string;
}) => {
  // absolute file path
  const absoluteFilePath = `${rootDir}/${relativeFilePath}`;
  const targetDirPath = absoluteFilePath
    .split('/')
    .slice(0, -1)
    .join('/');

  // ensure directory is defined
  await makeDirectoryAsync({ directoryPath: targetDirPath }).catch((error) => {
    if (error.code === 'EEXIST') return; // don't error if due to the dir already exists
    throw error; // if its a different reason for error, then pass it up
  });

  // write the resource sql to that dir
  await writeFileAsync({ path: absoluteFilePath, content: code });

  // log that we have successfully written
  const successMessage = `  ${chalk.green('✔')} ${chalk.green(chalk.bold('[GENERATED]'))} ${chalk.bold(
    relativeFilePath,
  )}`;
  console.log(successMessage); // tslint:disable-line no-console
};
