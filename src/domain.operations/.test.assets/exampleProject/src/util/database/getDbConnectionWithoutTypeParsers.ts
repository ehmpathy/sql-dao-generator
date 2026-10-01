import { Client } from 'pg';

import type { DatabaseConnection } from './getDbConnection';

/**
 * .what = a database connection that installs NO pg type parsers of its own
 * .why  = names, at the call site, a consumer whose connection sets no `setTypeParser` for oid
 *         20/1016/1700. a dao read through it must still return the declared domain shape
 * .note = the name is all it supplies: `pg.types` is process-global, so the caller restores the
 *         pg defaults itself and asserts the raw wire yields strings before it trusts the dao
 */
export const getDatabaseConnectionWithoutTypeParsers =
  async (): Promise<DatabaseConnection> => {
    const client = new Client({
      host: 'localhost',
      user: 'postgres',
      password: 'a-secure-password',
      database: 'superimportantdb',
      port: 7821,
    });
    await client.connect();
    await client.query('SET search_path TO public;'); // https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-
    const dbConnection = {
      query: ({ sql, values }: { sql: string; values?: (string | number)[] }) =>
        client.query(sql, values),
      end: () => client.end(),
    };
    return dbConnection;
  };
