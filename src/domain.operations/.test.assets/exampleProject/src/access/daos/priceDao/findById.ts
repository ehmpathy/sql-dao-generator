import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Price } from '../../../domain';
import { sqlQueryFindPriceById } from '../.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_price_by_id
  SELECT
    price.id,
    price.amount,
    price.currency
  FROM view_price_hydrated AS price
  WHERE price.id = :id;
`;

export const findById = async (
  {
    id,
  }: {
    id: number;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Price> | null> => {
  const results = await sqlQueryFindPriceById({
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
