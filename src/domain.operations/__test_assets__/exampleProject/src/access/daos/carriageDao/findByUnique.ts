import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Carriage } from '../../../domain';
import { sqlQueryFindCarriageByUnique } from '../.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_carriage_by_unique
  SELECT
    carriage.id,
    carriage.uuid,
    carriage.cin,
    carriage.carries,
    carriage.capacity
  FROM view_carriage_hydrated AS carriage
  WHERE 1=1
    AND carriage.cin = :cin;
`;

export const findByUnique = async (
  {
    cin,
  }: {
    cin: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Carriage> | null> => {
  const results = await sqlQueryFindCarriageByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      cin,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
