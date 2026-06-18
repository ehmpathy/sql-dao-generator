import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { AsyncTaskPredictStationCongestion } from '../../../domain';
import { sqlQueryUpsertAsyncTaskPredictStationCongestion } from '../../../data/dao/.generated/queryFunctions';

export const sql = `
  -- query_name = upsert_async_task_predict_station_congestion
  SELECT
    dgv.id, dgv.uuid, dgv.created_at, dgv.updated_at
  FROM upsert_async_task_predict_station_congestion(
    :status,
    (SELECT id FROM train_station WHERE train_station.uuid = :stationUuid),
    (SELECT id FROM train WHERE train.uuid = :trainLocatedEventUuid)
  ) as dgv;
`;

export const upsert = async (
  {
    asyncTaskPredictStationCongestion,
  }: {
    asyncTaskPredictStationCongestion: AsyncTaskPredictStationCongestion;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<AsyncTaskPredictStationCongestion>> => {
  const results = await sqlQueryUpsertAsyncTaskPredictStationCongestion({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      status: asyncTaskPredictStationCongestion.status,
      stationUuid: asyncTaskPredictStationCongestion.stationUuid,
      trainLocatedEventUuid: asyncTaskPredictStationCongestion.trainLocatedEventUuid,
    },
  });
  const { id, uuid, created_at: createdAt, updated_at: updatedAt } = results[0]!; // grab the db generated values
  return new AsyncTaskPredictStationCongestion({ ...asyncTaskPredictStationCongestion, id, uuid, createdAt, updatedAt }) as HasMetadata<AsyncTaskPredictStationCongestion>;
};
