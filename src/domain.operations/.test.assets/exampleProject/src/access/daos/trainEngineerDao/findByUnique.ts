import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { TrainEngineer } from '../../../domain';
import { sqlQueryFindTrainEngineerByUnique } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_train_engineer_by_unique
  SELECT
    train_engineer.id,
    train_engineer.uuid,
    train_engineer.social_security_number_hash,
    train_engineer.certificates,
    train_engineer.license_uuids,
    train_engineer.name
  FROM view_train_engineer_hydrated AS train_engineer
  WHERE 1=1
    AND train_engineer.social_security_number_hash = :socialSecurityNumberHash;
`;

export const findByUnique = async (
  {
    socialSecurityNumberHash,
  }: {
    socialSecurityNumberHash: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<TrainEngineer> | null> => {
  const results = await sqlQueryFindTrainEngineerByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      socialSecurityNumberHash,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
