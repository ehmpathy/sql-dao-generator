import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { TrainStation } from '../../../domain';
import { sqlQueryFindTrainStationById } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_train_station_by_id
  SELECT
    train_station.id,
    train_station.uuid,
    train_station.geocode,
    train_station.name
  FROM view_train_station_hydrated AS train_station
  WHERE train_station.id = :id;
`;

export const findById = async (
  {
    id,
  }: {
    id: number;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<TrainStation> | null> => {
  const results = await sqlQueryFindTrainStationById({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      id,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
