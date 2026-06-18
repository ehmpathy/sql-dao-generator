import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { AsyncTaskPredictStationCongestion } from '../../../domain';
import { sqlQueryFindAsyncTaskPredictStationCongestionByUuid } from '../.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_async_task_predict_station_congestion_by_uuid
  SELECT
    async_task_predict_station_congestion.id,
    async_task_predict_station_congestion.uuid,
    async_task_predict_station_congestion.created_at,
    async_task_predict_station_congestion.updated_at,
    async_task_predict_station_congestion.status,
    async_task_predict_station_congestion.station_uuid,
    async_task_predict_station_congestion.train_located_event_uuid
  FROM view_async_task_predict_station_congestion_hydrated AS async_task_predict_station_congestion
  WHERE async_task_predict_station_congestion.uuid = :uuid;
`;

export const findByUuid = async (
  {
    uuid,
  }: {
    uuid: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<AsyncTaskPredictStationCongestion> | null> => {
  const results = await sqlQueryFindAsyncTaskPredictStationCongestionByUuid({
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
