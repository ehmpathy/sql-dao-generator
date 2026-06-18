import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Price } from '../../../domain';
import { sqlQueryUpsertPrice } from '../.generated/queryFunctions';

export const sql = `
  -- query_name = upsert_price
  SELECT
    dgv.id
  FROM upsert_price(
    :amount,
    :currency
  ) as dgv;
`;

export const upsert = async (
  {
    price,
  }: {
    price: Price;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Price>> => {
  const results = await sqlQueryUpsertPrice({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      amount: price.amount,
      currency: price.currency,
    },
  });
  const { id } = results[0]!; // grab the db generated values
  return new Price({ ...price, id }) as HasMetadata<Price>;
};
