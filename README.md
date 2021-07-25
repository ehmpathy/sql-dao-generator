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
- generating typescript type definitions for each sql resource and query with [`sql-code-generator`](https://github.com/uladkasach/sql-code-generator)

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

# Examples

### a simple value object dao

**Input:** Say you have the following domain object

```ts
export interface Geocode {
  id?: number;
  latitude: number;
  longitude: number;
}
export class Geocode extends DomainValueObject<Geocode> implements Geocode {}
```

**Output:** Running this sql-dao-generator on this domain object will:

1. generate the `sql-schema-generator` sql-schema-definition-object
    ```ts
    import { prop, ValueObject } from 'sql-schema-generator';

    export const geocode = new ValueObject({
      name: 'geocode',
      properties: {
        latitude: prop.NUMERIC(),
        longitude: prop.NUMERIC(),
      }
    })
    ```

2. run `sql-schema-generator` on the generated sql-schema-definition-object to generate the sql-schema-resources

3. generate the `sql-schema-control` control file, `domain-objects.ts`, to control the generated sql-schema-resources
    ```yml
    # geocode
    - type: resource
      path: ./tables/geocode.sql
    - type: resource
      path: ./functions/upsert_geocode.sql
    ```

4. generate the dao files
    1. `geocodeDao/index.ts`
        ```ts
        import { findById } from './findById';
        import { findByUnique } from './findByUnique'
        import { upsert } from './upsert';

        export const geocodeDao = {
          findById,
          findByUnique,
          upsert,
        }
        ```
    2. `geocodeDao/findById.query.ts`
        ```ts
        export const sql = `
        -- query_name = find_geocode_by_id
        select
          g.id,
          g.latitude,
          g.longitude
        from geocode g
        where g.id = :id
        `.trim();

        export const findById = async ({
          dbConnection,
          id,
        }: {
          dbConnection: DatabaseConnection;
          id: number;
        }) => {
          const results = await sqlQueryFindGeocodeById({
            dbExecute: dbConnection.query,
            logDebug: log.debug,
            input: { id },
          });
          if (results.length > 1) throw new Error('should only be one');
          if (!results.length) return null;
          return fromDatabaseObject({ dbObject: results[0] });
        };
        ```
    3. `geocodeDao/findByUnique.query.ts`
       ```ts
        export const sql = `
        -- query_name = find_geocode_by_unique
        select
          g.id,
          g.latitude,
          g.longitude
        from geocode g
        where 1=1
          and g.latitude = :latitude
          and g.longitude = :longitude
        `.trim();

        export const findByUnique = async ({
          dbConnection,
          latitude,
          longitude,
        }: {
          dbConnection: DatabaseConnection;
          latitude: string;
          longitude: string;
        }) => {
          const results = await sqlQueryFindGeocodeByUnique({
            dbExecute: dbConnection.query,
            logDebug: log.debug,
            input: { latitude, longitude },
          });
          if (results.length > 1) throw new Error('should only be one');
          if (!results.length) return null;
          return fromDatabaseObject({ dbObject: results[0] });
        };
       ```
    4. `geocodeDao/upsert.query.ts`
       ```ts
       export const upsert = async ({
         dbConnection,
         geocode,
        }: {
          dbConnection: DatabaseConnection;
          geocode: Geocode;
        }) => {
          const result = await sqlQueryUpsertGeocode({
            dbExecute: dbConnection.query,
            logDebug: log.debug,
            input: {
              latitude: geocode.latitude,
              longitude: geocode.longitude,
            },
          });
          const id = result[0].id;
          return new Geocode({ ...geocode, id }) as HasId<Geocode>;
        };
       ```
    5. `geocodeDao/utils/fromDatabaseObject.ts`
       ```ts
       export const fromDatabaseObject = async ({
          dbConnection,
          dbObject,
        }: {
          dbConnection: DatabaseConnection;
          dbObject: SqlQueryFindGeocodeByIdOutput;
        }) => {
          return new Geocode({
            id: dbObject.id,
            latitude: dbObject.latitude,
            longitude: dbObject.longitude,
          });
        };
       ```

5. run `sql-code-generator` on the generated sql-schema-resources and dao query-files to output the typescript sql-type-definitions and sql-query-functions


# Features

### Guard Rails

The sql-dao-generator has many guardrails in place to make sure that you're following best practices and avoiding potential maintainability problems.

Specifically:
- unique + updatable properties need to be specified or not depending on the domain-object variant
  - `domain-value-objects` may not explicitly specify unique or updatable properties, since these are defined implicitly by the definition of a value object
    - i.e., nothing is updatable
    - i.e., unique on all natural properties
  - `domain-entities` must specify at least one key on which they are unique and must explicitly specify the list of updatable properties (even if the list is empty)
  - `domain-events` must specify at least one key on which they are unique
- properties which reference domain-objects must be named after the domain-object they reference
  - this makes sure that properties are easy to understand when reading code -> increasing maintainability
    - makes it easier to understand relationships for new folks looking at your project
    - makes it easier to understand relationships for yourself when you come back to your project after a while and don't remember everything
  - for example:
    - allowed:
      - `address: Address`
      - `homeAddress: Address`
    - not allowed:
      - `home: Address`
- `domain-entities` should not be nested in other domain objects; they should use implicit uuid references instead
  - experience has shown that nesting domain-entities inside of other domain-objects results in maintainability issues and complexity
    - this is because, in the backend
      - we typically do not have the state of the nested domain-entity in memory already when dealing with the domain-object that references it
      - the domain-entity being referenced has its own lifecycle and it's state typically needs to be explicitly managed with its own logic
    - _note, in the frontend, the opposite is typically true_. nesting domain-entities inside of other domain-objects is a common way to simplify your code in the frontend. (just not in the backend)
  - instead, this library allows you to achieve the same `database foreign key constraints` without explicitly nesting domain-entities inside of other domain-objects, by using `implicit uuid references`
    - e.g., instead of `user: User` use `userUuid: string`
    - this library takes care of creating the foreign key in the db and mapping `uuid <-> id` to and from the database in the data-access-object

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
  -c, --config=config  (required) [default: codegen.sql.dao.yml] path to config yml
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
