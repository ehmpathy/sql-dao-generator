import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Geocode } from '../../../domain';
import { sqlQueryFindGeocodeByUnique } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_geocode_by_unique
  SELECT
    geocode.id,
    geocode.latitude,
    geocode.longitude
  FROM view_geocode_hydrated AS geocode
  WHERE 1=1
    AND geocode.latitude = :latitude
    AND geocode.longitude = :longitude;
`;

export const findByUnique = async (
  {
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Geocode> | null> => {
  const results = await sqlQueryFindGeocodeByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      latitude,
      longitude,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
