import chalk from 'chalk';
import { readConfig } from '../../config/getConfig/readConfig';
import { defineDaoCodeFilesForDomainObjects } from '../../databaseAccessObjects/defineDaoCodeFilesForDomainObjects';
import { defineSqlSchemaControlCodeFilesForDomainObjects } from '../../sqlSchemaControl/defineSqlSchemaControlCodeFilesForDomainObjects';
import { defineSqlSchemaGeneratorCodeFilesForDomainObjects } from '../../sqlSchemaGenerator/defineSqlSchemaGeneratorCodeFilesForDomainObjects';
import { defineSqlSchemaRelationshipsForDomainObjects } from '../../sqlSchemaRelationship/defineSqlSchemaRelationshipsForDomainObjects';

export const generate = async ({ configPath }: { configPath: string }) => {
  // read the declarations from config
  console.log(`${chalk.bold('🔎 Loading domain objects:')} using domain-objects-metadata...\n`); // tslint:disable-line no-console
  const config = await readConfig({ configPath });
  const domainObjects = config.for.objects;

  // derive sql schema relationships from the domain objects
  console.log(`${chalk.bold('🧠 Defining sql relationships:')} conventions, references, modifiers...\n`); // tslint:disable-line no-console
  const sqlSchemaRelationships = defineSqlSchemaRelationshipsForDomainObjects({ domainObjects });

  // output the sql-schema-generator entities
  console.log(`${chalk.bold('🏗️️  Generating the sql schema:')} using sql-schema-generator...\n`); // tslint:disable-line no-console
  const sqlSchemaGeneratorCodeFiles = defineSqlSchemaGeneratorCodeFilesForDomainObjects({
    domainObjects,
    sqlSchemaRelationships,
  });
  // TODO: output each {code, destination} pair
  // TODO: run sql-schema-generator on the entities

  // output the sql-schema-control `domains.yml` file
  console.log(`${chalk.bold('🔧 Generating schema-control config:')} for use with sql-schema-control...\n`); // tslint:disable-line no-console
  const sqlSchemaControlCodeFiles = defineSqlSchemaControlCodeFilesForDomainObjects({
    domainObjects,
    sqlSchemaRelationships,
  });
  // TODO: output each

  // output the dao functions
  console.log(`${chalk.bold('️🔨 Generating data-access-objects:')} methods, casters, tests, and named exports...\n`); // tslint:disable-line no-console
  const daoCodeFiles = defineDaoCodeFilesForDomainObjects({
    domainObjects,
    sqlSchemaRelationships,
  });
  // TODO: output each

  // output the sql types and query functions
  console.log(`${chalk.bold('🗜️  Generating typescript from sql:')} types and funcs using sql-code-generator...\n`); // tslint:disable-line no-console
  // TODO: run the command
};
