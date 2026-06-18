import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Carriage } from '../../../domain';
import { sqlQueryUpsertCarriage } from '../../../data/dao/.generated/queryFunctions';

export const sql = `
  -- query_name = upsert_carriage
  SELECT
    dgv.id, dgv.uuid
  FROM upsert_carriage(
    :cin,
    :carries,
    :capacity
  ) as dgv;
`;

export const upsert = async (
  {
    carriage,
  }: {
    carriage: Carriage;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Carriage>> => {
  const results = await sqlQueryUpsertCarriage({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      cin: carriage.cin,
      carries: carriage.carries,
      capacity: carriage.capacity,
    },
  });
  const { id, uuid } = results[0]!; // grab the db generated values
  return new Carriage({ ...carriage, id, uuid }) as HasMetadata<Carriage>;
};
