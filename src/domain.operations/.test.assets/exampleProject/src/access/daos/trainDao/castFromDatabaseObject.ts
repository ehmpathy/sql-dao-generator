import { HasMetadata } from 'type-fns';

import { Train } from '../../../domain';
import { SqlQueryFindGeocodeByIdOutput, SqlQueryFindTrainByIdOutput } from '../../../data/dao/.generated/types';
import { castFromDatabaseObject as castGeocodeFromDatabaseObject } from '../geocodeDao/castFromDatabaseObject';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindTrainByIdOutput,
): HasMetadata<Train> =>
  new Train({
    id: dbObject.id,
    uuid: dbObject.uuid,
    homeStationGeocode: castGeocodeFromDatabaseObject(dbObject.home_station_geocode as SqlQueryFindGeocodeByIdOutput),
    combinationId: dbObject.combination_id,
    locomotiveUuids: dbObject.locomotive_uuids as string[],
    carriageUuids: dbObject.carriage_uuids as string[],
    engineerUuids: dbObject.engineer_uuids as string[],
    leadEngineerUuid: dbObject.lead_engineer_uuid,
    status: dbObject.status as Train['status'],
  }) as HasMetadata<Train>;
