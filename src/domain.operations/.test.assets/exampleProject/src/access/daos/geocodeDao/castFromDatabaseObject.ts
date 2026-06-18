import { HasMetadata } from 'type-fns';

import { Geocode } from '../../../domain';
import { SqlQueryFindGeocodeByIdOutput } from '../../../data/dao/.generated/types';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindGeocodeByIdOutput,
): HasMetadata<Geocode> =>
  new Geocode({
    id: dbObject.id,
    latitude: dbObject.latitude,
    longitude: dbObject.longitude,
  }) as HasMetadata<Geocode>;
