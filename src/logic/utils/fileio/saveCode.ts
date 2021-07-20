import chalk from 'chalk';
import { mkdir, writeFile } from '../../commands/utils/fileIO';

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
  await mkdir(targetDirPath).catch((error) => {
    if (error.code !== 'EEXIST') throw error;
  }); // mkdir and ignore if dir already exists

  // write the resource sql to that dir
  await writeFile(absoluteFilePath, code);

  // log that we have successfully written
  const successMessage = `  ${chalk.green('✔')} ${chalk.green(chalk.bold('[GENERATED]'))} ${chalk.bold(
    relativeFilePath,
  )}`;
  console.log(successMessage); // tslint:disable-line no-console
};
