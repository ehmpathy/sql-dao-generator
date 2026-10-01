import { HasMetadata } from 'type-fns';

import { Geocode } from '../../../domain';
import { SqlQueryFindGeocodeByIdOutput as SqlQueryFindGeocodeByIdOutputStrict } from '../.generated/types';
import type { AsJsonFromDbObject } from '../.generated/casts';
import { asFromDatabase } from '../.generated/casts';

export type { SqlQueryFindGeocodeByIdOutputStrict };

export type SqlQueryFindGeocodeByIdOutputJsoned =
  AsJsonFromDbObject<SqlQueryFindGeocodeByIdOutputStrict>;

export type SqlQueryFindGeocodeByIdOutput =
  | SqlQueryFindGeocodeByIdOutputStrict
  | SqlQueryFindGeocodeByIdOutputJsoned;

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindGeocodeByIdOutput,
): HasMetadata<Geocode> =>
  new Geocode({
    id: asFromDatabase.number(dbObject.id),
    createdAt: asFromDatabase.date(dbObject.created_at),
    latitude: asFromDatabase.number(dbObject.latitude),
    longitude: asFromDatabase.number(dbObject.longitude),
  }) as HasMetadata<Geocode>;
