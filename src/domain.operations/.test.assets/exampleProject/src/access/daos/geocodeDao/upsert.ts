import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Geocode } from '../../../domain';
import { sqlQueryUpsertGeocode } from '../.generated/queryFunctions';

export const sql = `
  -- query_name = upsert_geocode
  SELECT
    dgv.id
  FROM upsert_geocode(
    :latitude,
    :longitude
  ) as dgv;
`;

export const upsert = async (
  {
    geocode,
  }: {
    geocode: Geocode;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Geocode>> => {
  const results = await sqlQueryUpsertGeocode({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      latitude: geocode.latitude,
      longitude: geocode.longitude,
    },
  });
  const { id } = results[0]!; // grab the db generated values
  return new Geocode({ ...geocode, id }) as HasMetadata<Geocode>;
};
