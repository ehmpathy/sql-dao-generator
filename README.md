sql-dao-generator
==============

Generate data-access-objects from your domain-objects.

Generates sql-schema, sql-control, type definitions, query functions, tests, and bundles it all up into daos with a single command!

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/sql-dao-generator.svg)](https://npmjs.org/package/sql-dao-generator)
[![Codecov](https://codecov.io/gh/uladkasach/sql-dao-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/uladkasach/sql-dao-generator)
[![Downloads/week](https://img.shields.io/npm/dw/sql-dao-generator.svg)](https://npmjs.org/package/sql-dao-generator)
[![License](https://img.shields.io/npm/l/sql-dao-generator.svg)](https://github.com/uladkasach/sql-dao-generator/blob/master/package.json)

# Table of Contents
<!-- toc -->
- [Goals](#goals)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
  - [`sql-dao-generator generate`](#sql-dao-generator-generate)
  - [`sql-dao-generator help [COMMAND]`](#sql-dao-generator-help-command)
- [Contribution](#contribution)
<!-- tocstop -->

# Goals

The goal of `sql-dao-generator` is to use the `domain-objects` you've already defined in order to speed up development and eliminate errors. This is done by composing several libraries that already do the individual steps and bundling them up into a fully functional `data-access-object`.

This includes:
- generating sql schema resources with [`sql-schema-generator`](https://github.com/uladkasach/sql-schema-generator)
- generating sql control config for use with [`sql-schema-control`](https://github.com/uladkasach/sql-schema-control)
- generating standard queries for each domain object (e.g., `upsert`, `findById`, `findByUnique`) and leaving an easily extensible pattern
- generating typescript type definitions for each sql resource and query with [`sql-schema-control`](https://github.com/uladkasach/sql-schema-control)

Powered by:
- extracting the domain information you've already encoded in your [domain-objects](https://github.com/uladkasach/domain-objects) using [domain-objects-metadata](https://github.com/uladkasach/domain-objects-metadata).

This enables:
- creating a fully functional data-access-object, using best practices, simply by defining your [`domain-objects`](https://github.com/uladkasach/domain-objects)
- easily extending your generated data-access-objects, because you control the code completely
- instantly leveraging the best practices and safety features implemented in the libraries that this library composes

Like an ORM, but without any magic or limitations - the code is in your hands and ready to mod as needed.

# Installation

## 1. Save the package as a dev dependency
  ```sh
  npm install --save-dev sql-dao-generator
  ```

## 2. Define a config yml

This file will define which `domain-objects` you want to generate `data-access-objects` for - as well as where we can find the config for the libraries this one composes.

For example:
```yml
# codegen.sql.dao.yml

language: postgres
dialect: 10.7
for:
  objects:
    search:
      - 'src/domain/objects/*.ts'
    exclude:
      - 'TrainLocatedEvent' # we track this one in dynamodb, so no sql dao needed
generates:
  daos:
    to: src/data/dao
    using:
      log: src/util/log#log
      DatabaseConnection: src/util/database/getDbConnection#DatabaseConnection
  schema:
    config: codegen.sql.schema.yml
  control:
    config: provision/schema/control.yml
  code:
    config: codegen.sql.types.yml

```

## 3. Test it out!
```
  $ npx sql-dao-generator version
  $ npx sql-dao-generator generate
```


# Usage

1. Define your domain objects
```ts
export interface Geocode {
  id?: number;
  latitude: number;
  longitude: number;
}
export class Geocode extends DomainValueObject<Geocode> implements Geocode {}
```

2. Define your config

3. Apply the sql schema to your database with `[sql-schema-control](https://github.com/uladkasach/sql-schema-control)`

4. Use the generated daos in your code 🎉

# Commands
<!-- commands -->
* [`sql-dao-generator generate`](#sql-dao-generator-generate)
* [`sql-dao-generator help [COMMAND]`](#sql-dao-generator-help-command)

## `sql-dao-generator generate`

generate data-access-objects by parsing domain-objects

```
USAGE
  $ sql-dao-generator generate

OPTIONS
  -c, --config=config  (required) [default: codegen.sql.yml] path to config yml
  -h, --help           show CLI help
```

_See code: [dist/contract/commands/generate.ts](https://github.com/uladkasach/sql-dao-generator/blob/v0.0.0/dist/contract/commands/generate.ts)_

## `sql-dao-generator help [COMMAND]`

display help for sql-dao-generator

```
USAGE
  $ sql-dao-generator help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_
<!-- commandsstop -->


# Contribution

Team work makes the dream work! Please create a ticket for any features you think are missing and, if willing and able, draft a PR for the feature :)
