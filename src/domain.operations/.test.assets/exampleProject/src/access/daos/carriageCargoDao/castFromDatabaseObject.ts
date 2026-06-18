import { HasMetadata } from 'type-fns';

import { CarriageCargo } from '../../../domain';
import { SqlQueryFindCarriageByIdOutput, SqlQueryFindCarriageCargoByIdOutput } from '../../../data/dao/.generated/types';
import { castFromDatabaseObject as castCarriageFromDatabaseObject } from '../carriageDao/castFromDatabaseObject';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindCarriageCargoByIdOutput,
): HasMetadata<CarriageCargo> =>
  new CarriageCargo({
    id: dbObject.id,
    uuid: dbObject.uuid,
    itineraryUuid: dbObject.itinerary_uuid,
    carriageRef: { uuid: dbObject.carriage_uuid },
    slot: dbObject.slot,
    cargoExid: dbObject.cargo_exid,
  }) as HasMetadata<CarriageCargo>;
