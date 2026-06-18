import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Carriage } from '../../../domain';
import { sqlQueryFindCarriageById } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_carriage_by_id
  SELECT
    carriage.id,
    carriage.uuid,
    carriage.cin,
    carriage.carries,
    carriage.capacity
  FROM view_carriage_hydrated AS carriage
  WHERE carriage.id = :id;
`;

export const findById = async (
  {
    id,
  }: {
    id: number;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Carriage> | null> => {
  const results = await sqlQueryFindCarriageById({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      id,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
