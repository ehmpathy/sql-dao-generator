import { HasMetadata } from 'type-fns';

import { TrainStation } from '../../../domain';
import { SqlQueryFindTrainStationByIdOutput as SqlQueryFindTrainStationByIdOutputStrict } from '../.generated/types';
import { asFromDatabase } from '../.generated/casts';
import { castFromDatabaseObject as castGeocodeFromDatabaseObject, SqlQueryFindGeocodeByIdOutputJsoned } from '../geocodeDao/castFromDatabaseObject';

export type { SqlQueryFindTrainStationByIdOutputStrict };

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindTrainStationByIdOutputStrict,
): HasMetadata<TrainStation> =>
  new TrainStation({
    id: asFromDatabase.number(dbObject.id),
    uuid: dbObject.uuid,
    geocode: castGeocodeFromDatabaseObject(dbObject.geocode as SqlQueryFindGeocodeByIdOutputJsoned),
    name: dbObject.name,
  }) as HasMetadata<TrainStation>;
