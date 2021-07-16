import chalk from 'chalk';
import { readConfig } from '../../config/getConfig/readConfig';
import { saveCode } from '../../fileio/saveCode';

export const generate = async ({ configPath }: { configPath: string }) => {
  // read the declarations from config
  console.log(`${chalk.bold('🔎 Loading domain objects:')} using domain-objects-metadata...\n`); // tslint:disable-line no-console
  const config = await readConfig({ configPath });

  // output the sql-schema-generator entities
  console.log(`${chalk.bold('🏗️️  Generating the sql schema:')} using sql-schema-generator...\n`); // tslint:disable-line no-console
  // const sqlSchemaGeneratorCode = defineSqlSchemaGeneratorCode({
  //   domainObjectMetadatas: config.for.objects,
  //   schemaConfig: config.generates,
  // });
  // TODO: output each {code, destination} pair
  // TODO: run sql-schema-generator on the entities

  // output the sql-schema-control `domains.yml` file
  console.log(`${chalk.bold('🔧 Generating schema-control config:')} for use with sql-schema-control...\n`); // tslint:disable-line no-console
  // TODO

  // output the dao functions
  console.log(`${chalk.bold('️🔨 Generating data-access-objects:')} methods, casters, tests, and named exports...\n`); // tslint:disable-line no-console
  // TODO

  // output the sql types and query functions
  console.log(
    `${chalk.bold('🗜️  Generating typescript from sql:')} type defs and query funcs using sql-code-generator...\n`,
  ); // tslint:disable-line no-console
  // TODO
};
