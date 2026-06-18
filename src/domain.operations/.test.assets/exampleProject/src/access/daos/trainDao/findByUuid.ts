import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Train } from '../../../domain';
import { sqlQueryFindTrainByUuid } from '../.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_train_by_uuid
  SELECT
    train.id,
    train.uuid,
    train.home_station_geocode,
    train.combination_id,
    train.locomotive_uuids,
    train.carriage_uuids,
    train.engineer_uuids,
    train.lead_engineer_uuid,
    train.status
  FROM view_train_hydrated AS train
  WHERE train.uuid = :uuid;
`;

export const findByUuid = async (
  {
    uuid,
  }: {
    uuid: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Train> | null> => {
  const results = await sqlQueryFindTrainByUuid({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      uuid,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
