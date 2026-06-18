import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Train } from '../../../domain';
import { sqlQueryUpsertTrain } from '../../../data/dao/.generated/queryFunctions';
import { geocodeDao } from '../geocodeDao';

export const sql = `
  -- query_name = upsert_train
  SELECT
    dgv.id, dgv.uuid
  FROM upsert_train(
    :homeStationGeocodeId,
    :combinationId,
    (
      SELECT COALESCE(array_agg(locomotive.id ORDER BY locomotive_ref.array_order_index), array[]::bigint[]) AS array_agg
      FROM locomotive
      JOIN unnest(:locomotiveUuids::uuid[]) WITH ORDINALITY
        AS locomotive_ref (uuid, array_order_index)
        ON locomotive.uuid = locomotive_ref.uuid
    ),
    (
      SELECT COALESCE(array_agg(carriage.id ORDER BY carriage_ref.array_order_index), array[]::bigint[]) AS array_agg
      FROM carriage
      JOIN unnest(:carriageUuids::uuid[]) WITH ORDINALITY
        AS carriage_ref (uuid, array_order_index)
        ON carriage.uuid = carriage_ref.uuid
    ),
    (
      SELECT COALESCE(array_agg(train_engineer.id ORDER BY train_engineer_ref.array_order_index), array[]::bigint[]) AS array_agg
      FROM train_engineer
      JOIN unnest(:engineerUuids::uuid[]) WITH ORDINALITY
        AS train_engineer_ref (uuid, array_order_index)
        ON train_engineer.uuid = train_engineer_ref.uuid
    ),
    (SELECT id FROM train_engineer WHERE train_engineer.uuid = :leadEngineerUuid),
    :status
  ) as dgv;
`;

export const upsert = async (
  {
    train,
  }: {
    train: Train;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Train>> => {
  const results = await sqlQueryUpsertTrain({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      homeStationGeocodeId: train.homeStationGeocode.id ? train.homeStationGeocode.id : (await geocodeDao.upsert({ geocode: train.homeStationGeocode }, context)).id,
      combinationId: train.combinationId,
      locomotiveUuids: train.locomotiveUuids,
      carriageUuids: train.carriageUuids,
      engineerUuids: train.engineerUuids,
      leadEngineerUuid: train.leadEngineerUuid,
      status: train.status,
    },
  });
  const { id, uuid } = results[0]!; // grab the db generated values
  return new Train({ ...train, id, uuid }) as HasMetadata<Train>;
};
