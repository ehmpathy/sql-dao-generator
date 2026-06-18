import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Locomotive } from '../../../domain';
import { sqlQueryUpsertLocomotive } from '../.generated/queryFunctions';

export const sql = `
  -- query_name = upsert_locomotive
  SELECT
    dgv.id, dgv.uuid, dgv.created_at, dgv.effective_at, dgv.updated_at
  FROM upsert_locomotive(
    :ein,
    :fuel,
    :capacity,
    :milage
  ) as dgv;
`;

export const upsert = async (
  {
    locomotive,
  }: {
    locomotive: Locomotive;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Locomotive>> => {
  const results = await sqlQueryUpsertLocomotive({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      ein: locomotive.ein,
      fuel: locomotive.fuel,
      capacity: locomotive.capacity,
      milage: locomotive.milage,
    },
  });
  const { id, uuid, created_at: createdAt, effective_at: effectiveAt, updated_at: updatedAt } = results[0]!; // grab the db generated values
  return new Locomotive({ ...locomotive, id, uuid, createdAt, effectiveAt, updatedAt }) as HasMetadata<Locomotive>;
};
