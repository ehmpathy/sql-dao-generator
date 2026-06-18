import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { AsyncTaskPredictStationCongestion } from '../../../domain';
import { sqlQueryFindAsyncTaskPredictStationCongestionByUnique } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_async_task_predict_station_congestion_by_unique
  SELECT
    async_task_predict_station_congestion.id,
    async_task_predict_station_congestion.uuid,
    async_task_predict_station_congestion.created_at,
    async_task_predict_station_congestion.updated_at,
    async_task_predict_station_congestion.status,
    async_task_predict_station_congestion.station_uuid,
    async_task_predict_station_congestion.train_located_event_uuid
  FROM view_async_task_predict_station_congestion_hydrated AS async_task_predict_station_congestion
  JOIN view_async_task_predict_station_congestion_current ON async_task_predict_station_congestion.id = view_async_task_predict_station_congestion_current.id
  WHERE 1=1
    AND view_async_task_predict_station_congestion_current.station_id = (SELECT id FROM train_station WHERE train_station.uuid = :stationUuid)
    AND view_async_task_predict_station_congestion_current.train_located_event_id = (SELECT id FROM train WHERE train.uuid = :trainLocatedEventUuid);
`;

export const findByUnique = async (
  {
    stationUuid,
    trainLocatedEventUuid,
  }: {
    stationUuid: string;
    trainLocatedEventUuid: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<AsyncTaskPredictStationCongestion> | null> => {
  const results = await sqlQueryFindAsyncTaskPredictStationCongestionByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      stationUuid,
      trainLocatedEventUuid,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
