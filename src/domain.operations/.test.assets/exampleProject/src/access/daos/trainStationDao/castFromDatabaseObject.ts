import { HasMetadata } from 'type-fns';

import { TrainStation } from '../../../domain';
import { SqlQueryFindGeocodeByIdOutput, SqlQueryFindTrainStationByIdOutput } from '../.generated/types';
import { castFromDatabaseObject as castGeocodeFromDatabaseObject } from '../geocodeDao/castFromDatabaseObject';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindTrainStationByIdOutput,
): HasMetadata<TrainStation> =>
  new TrainStation({
    id: dbObject.id,
    uuid: dbObject.uuid,
    geocode: castGeocodeFromDatabaseObject(dbObject.geocode as SqlQueryFindGeocodeByIdOutput),
    name: dbObject.name,
  }) as HasMetadata<TrainStation>;
