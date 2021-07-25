import pg, { Client, QueryResult } from 'pg';

// https://github.com/brianc/node-postgres/pull/353#issuecomment-283709264
pg.types.setTypeParser(20, (value) => parseInt(value, 10)); // cast bigint to number; by default, pg returns bigints as strings, since max val of bigint is bigger than max safe value in js
pg.types.setTypeParser(1016, (values) => values.slice(1, -1).split(',').map((value) => parseInt(value, 10))); // cast bigint[] to numbers; by default, pg returns bigints as strings, since max val of bigint is bigger than max safe value in js
pg.types.setTypeParser(1700, (value) => parseFloat(value)); // cast numeric to number; by default, pg returns numerics as strings to preserve precision

export interface DatabaseConnection {
  query: (args: { sql: string; values?: any[] }) => Promise<QueryResult<any>>;
  end: () => Promise<void>;
}

export const getDatabaseConnection = async (): Promise<DatabaseConnection> => {
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
    query: ({ sql, values }: { sql: string; values?: (string | number)[] }) => client.query(sql, values),
    end: () => client.end(),
  };
  return dbConnection;
};
