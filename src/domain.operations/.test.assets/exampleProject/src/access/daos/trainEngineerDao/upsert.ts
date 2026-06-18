import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { TrainEngineer } from '../../../domain';
import { sqlQueryUpsertTrainEngineer } from '../../../data/dao/.generated/queryFunctions';
import { certificateDao } from '../certificateDao';

export const sql = `
  -- query_name = upsert_train_engineer
  SELECT
    dgv.id, dgv.uuid
  FROM upsert_train_engineer(
    :socialSecurityNumberHash,
    :certificateIds,
    :licenseUuids,
    :name
  ) as dgv;
`;

export const upsert = async (
  {
    trainEngineer,
  }: {
    trainEngineer: TrainEngineer;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<TrainEngineer>> => {
  const results = await sqlQueryUpsertTrainEngineer({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      socialSecurityNumberHash: trainEngineer.socialSecurityNumberHash,
      certificateIds: await Promise.all(trainEngineer.certificates.map(async (certificate) => certificate.id ? certificate.id : (await certificateDao.upsert({ certificate }, context)).id)),
      licenseUuids: trainEngineer.licenseUuids,
      name: trainEngineer.name,
    },
  });
  const { id, uuid } = results[0]!; // grab the db generated values
  return new TrainEngineer({ ...trainEngineer, id, uuid }) as HasMetadata<TrainEngineer>;
};
