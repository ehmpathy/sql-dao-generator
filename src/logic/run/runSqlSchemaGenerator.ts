import chalk from 'chalk';
import shell from 'shelljs';

import { GeneratorConfig } from '../../domain';

export const runSqlSchemaGenerator = async ({
  config,
}: {
  config: GeneratorConfig;
}) => {
  // run the generator to actually generate the files
  shell.cd(config.rootDir);
  const result = await shell.exec(
    `npx sql-schema-generator generate --config=${config.generates.schema.config.path}`,
    { silent: true },
  );
  if (result.stderr) throw new Error(result.stderr);

  // log that we've successfully run
  const successMessage = `  ${chalk.green('✔')} ${chalk.green(
    chalk.bold('[RAN]'),
  )} ${chalk.bold('sql-schema-generator 🏃')}`;
  console.log(successMessage); // tslint:disable-line no-console

  // log the result of running it
  const generatedForNames = result.stdout
    .split('\n')
    .filter((line) => line.includes('[completed]'))
    .map((line) => line.split(']')[1]!.split('[')[0]!.trim());
  generatedForNames.forEach((name) => {
    const successMessageForName = `    ${chalk.green('✔')} ${chalk.green(
      chalk.bold('[GENERATED]'),
    )} ${chalk.bold(`tables, views, and functions for '${name}'`)}`;
    // tslint:disable-next-line: no-console
    console.log(successMessageForName);
  });
};
