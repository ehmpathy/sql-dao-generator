import chalk from 'chalk';
import shell from 'shelljs';
import { GeneratorConfig } from '../../domain';

export const runSqlCodeGenerator = async ({ config }: { config: GeneratorConfig }) => {
  // run the generator to actually generate the files
  shell.cd(config.rootDir);
  const result = await shell.exec(`npx sql-code-generator generate --config=${config.generates.code.config.path}`, {
    silent: true,
  });
  if (result.stderr) throw new Error(result.stderr);

  // log that we've successfully run
  const successMessage = `  ${chalk.green('✔')} ${chalk.green(chalk.bold('[RAN]'))} ${chalk.bold(
    'sql-code-generator 🏃',
  )}`;
  console.log(successMessage); // tslint:disable-line no-console

  // generate the sub messages
  const successMessage2 = `    ${chalk.green('✔')} ${chalk.green(chalk.bold('[GENERATED]'))} ${chalk.bold(
    config.generates.code.config.content.generates.types,
  )}`;
  console.log(successMessage2); // tslint:disable-line: no-console
  const successMessage3 = `    ${chalk.green('✔')} ${chalk.green(chalk.bold('[GENERATED]'))} ${chalk.bold(
    config.generates.code.config.content.generates.queryFunctions,
  )}`;
  console.log(successMessage3); // tslint:disable-line: no-console
};
