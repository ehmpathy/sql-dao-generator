import chalk from 'chalk';

import { readConfig } from '../config/getConfig/readConfig';
import { defineDaoCodeFilesForDomainObjects } from '../define/databaseAccessObjects/defineDaoCodeFilesForDomainObjects';
import { defineSqlSchemaControlCodeFilesForDomainObjects } from '../define/sqlSchemaControl/defineSqlSchemaControlCodeFilesForDomainObjects';
import { defineSqlSchemaGeneratorCodeFilesForDomainObjects } from '../define/sqlSchemaGenerator/defineSqlSchemaGeneratorCodeFilesForDomainObjects';
import { defineSqlSchemaRelationshipsForDomainObjects } from '../define/sqlSchemaRelationship/defineSqlSchemaRelationshipsForDomainObjects';
import { runSqlCodeGenerator } from '../run/runSqlCodeGenerator';
import { runSqlSchemaGenerator } from '../run/runSqlSchemaGenerator';
import { saveGeneratedDatabaseAccessObjectCodeFiles } from '../save/saveGeneratedDatabaseAccessObjectCodeFiles';
import { saveGeneratedSqlSchemaControlCodeFiles } from '../save/saveGeneratedSqlSchemaControlCodeFiles';
import { saveGeneratedSqlSchemaGeneratorCodeFiles } from '../save/saveGeneratedSqlSchemaGeneratorCodeFiles';

export const generate = async ({ configPath }: { configPath: string }) => {
  // read the declarations from config
  console.log(`${chalk.bold('\n🔎 Loading domain objects:')} using domain-objects-metadata...\n`); // tslint:disable-line no-console
  const config = await readConfig({ configPath });
  const domainObjects = config.for.objects;

  // derive sql schema relationships from the domain objects
  console.log(`${chalk.bold('\n🧠 Defining sql relationships:')} conventions, references, modifiers...\n`); // tslint:disable-line no-console
  const sqlSchemaRelationships = defineSqlSchemaRelationshipsForDomainObjects({ domainObjects });

  // output the sql-schema-generator entities
  console.log(`${chalk.bold('\n🏗️️  Generating the sql schema:')} using sql-schema-generator...\n`); // tslint:disable-line no-console
  const sqlSchemaGeneratorCodeFiles = defineSqlSchemaGeneratorCodeFilesForDomainObjects({
    domainObjects,
    sqlSchemaRelationships,
  });
  await saveGeneratedSqlSchemaGeneratorCodeFiles({ config, files: sqlSchemaGeneratorCodeFiles });
  await runSqlSchemaGenerator({ config });

  // output the sql-schema-control `domains.yml` file
  console.log(`${chalk.bold('\n🔧 Generating schema-control config:')} for use with sql-schema-control...\n`); // tslint:disable-line no-console
  const sqlSchemaControlCodeFile = defineSqlSchemaControlCodeFilesForDomainObjects({
    domainObjects,
    sqlSchemaRelationships,
  });
  await saveGeneratedSqlSchemaControlCodeFiles({ config, file: sqlSchemaControlCodeFile });

  // output the dao functions
  console.log(`${chalk.bold('️\n🔨 Generating data-access-objects:')} methods, casters, tests, and named exports...\n`); // tslint:disable-line no-console
  const daoCodeFiles = defineDaoCodeFilesForDomainObjects({
    domainObjects,
    sqlSchemaRelationships,
  });
  await saveGeneratedDatabaseAccessObjectCodeFiles({ config, files: daoCodeFiles });

  // output the sql types and query functions
  console.log(`${chalk.bold('\n🗜️  Generating typescript from sql:')} types and funcs using sql-code-generator...\n`); // tslint:disable-line no-console
  await runSqlCodeGenerator({ config });
};
