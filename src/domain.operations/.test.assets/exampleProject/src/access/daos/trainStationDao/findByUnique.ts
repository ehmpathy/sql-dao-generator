import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Geocode, TrainStation } from '../../../domain';
import { sqlQueryFindTrainStationByUnique } from '../.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';
import { geocodeDao } from '../geocodeDao';

export const sql = `
  -- query_name = find_train_station_by_unique
  SELECT
    train_station.id,
    train_station.uuid,
    train_station.geocode,
    train_station.name
  FROM view_train_station_hydrated AS train_station
  JOIN view_train_station_current ON train_station.id = view_train_station_current.id
  WHERE 1=1
    AND view_train_station_current.geocode_id = :geocodeId;
`;

export const findByUnique = async (
  {
    geocode,
  }: {
    geocode: Geocode;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<TrainStation> | null> => {
  const results = await sqlQueryFindTrainStationByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      geocodeId: geocode.id ? geocode.id : ((await geocodeDao.findByUnique(geocode, context))?.id ?? -1),
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
