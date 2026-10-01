import { HasMetadata } from 'type-fns';

import { Train } from '../../../domain';
import { SqlQueryFindTrainByIdOutput as SqlQueryFindTrainByIdOutputStrict } from '../.generated/types';
import { asFromDatabase } from '../.generated/casts';
import { castFromDatabaseObject as castGeocodeFromDatabaseObject, SqlQueryFindGeocodeByIdOutputJsoned } from '../geocodeDao/castFromDatabaseObject';

export type { SqlQueryFindTrainByIdOutputStrict };

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindTrainByIdOutputStrict,
): HasMetadata<Train> =>
  new Train({
    id: asFromDatabase.number(dbObject.id),
    uuid: dbObject.uuid,
    homeStationGeocode: castGeocodeFromDatabaseObject(dbObject.home_station_geocode as SqlQueryFindGeocodeByIdOutputJsoned),
    combinationId: dbObject.combination_id,
    locomotiveUuids: dbObject.locomotive_uuids as string[],
    carriageUuids: dbObject.carriage_uuids as string[],
    engineerUuids: dbObject.engineer_uuids as string[],
    leadEngineerUuid: dbObject.lead_engineer_uuid,
    status: dbObject.status as Train['status'],
  }) as HasMetadata<Train>;
