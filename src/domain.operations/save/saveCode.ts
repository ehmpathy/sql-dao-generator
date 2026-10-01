import chalk from 'chalk';

import { makeDirectoryAsync } from '@src/utils/fileio/makeDirAsync';
import { writeFileAsync } from '@src/utils/fileio/writeFileAsync';
import { getDirOfPath } from '@src/utils/filepaths/getDirOfPath';
import { getNormalizedPath } from '@src/utils/filepaths/getNormalizedPath';

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
  const targetDirPath = getDirOfPath(absoluteFilePath);

  // ensure directory is defined
  await makeDirectoryAsync({ directoryPath: targetDirPath }).catch((error) => {
    if (error.code === 'EEXIST') return; // don't error if due to the dir already exists
    throw error; // if its a different reason for error, then pass it up
  });

  // ensure content of file has terminal newline
  const contentWithTerminalNewline =
    code.slice(-1)[0] === '\n' ? code : `${code}\n`;

  // write the resource sql to that dir
  await writeFileAsync({
    path: absoluteFilePath,
    content: contentWithTerminalNewline,
  });

  // log that we have successfully written
  const successMessage = `  ${chalk.green('✔')} ${chalk.green(
    chalk.bold('[GENERATED]'),
  )} ${chalk.bold(
    // .what = the path the file ACTUALLY landed at, relative to rootDir
    // .why  = the caller's join can carry `..` segments, which fs collapses on write; the log must
    //         name where the file landed, not `declarations/../sql/views/x.sql`
    // .note = the log alone reads this value, so the collapse lands here and no file moves
    getNormalizedPath(relativeFilePath).replace(/^\//, ''),
  )}`;
  console.log(successMessage); // tslint:disable-line no-console
};
