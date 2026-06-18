import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Price } from '../../../domain';
import { sqlQueryFindPriceByUnique } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_price_by_unique
  SELECT
    price.id,
    price.amount,
    price.currency
  FROM view_price_hydrated AS price
  WHERE 1=1
    AND price.amount = :amount
    AND price.currency = :currency;
`;

export const findByUnique = async (
  {
    amount,
    currency,
  }: {
    amount: number;
    currency: Price['currency'];
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Price> | null> => {
  const results = await sqlQueryFindPriceByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      amount,
      currency,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
