import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { TrainStation, Geocode } from '../../../domain';
import { sqlQueryUpsertTrainStation } from '../.generated/queryFunctions';
import { geocodeDao } from '../geocodeDao';

export const sql = `
  -- query_name = upsert_train_station
  SELECT
    dgv.id, dgv.uuid
  FROM upsert_train_station(
    :geocodeId,
    :name
  ) as dgv;
`;

export const upsert = async (
  {
    trainStation,
  }: {
    trainStation: TrainStation;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<TrainStation>> => {
  const results = await sqlQueryUpsertTrainStation({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      geocodeId: trainStation.geocode.id ? trainStation.geocode.id : (await geocodeDao.upsert({ geocode: trainStation.geocode }, context)).id,
      name: trainStation.name,
    },
  });
  const { id, uuid } = results[0]!; // grab the db generated values
  return new TrainStation({ ...trainStation, id, uuid }) as HasMetadata<TrainStation>;
};
