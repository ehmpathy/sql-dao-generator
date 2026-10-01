import { HasMetadata } from 'type-fns';

import { CarriageCargo } from '../../../domain';
import { SqlQueryFindCarriageCargoByIdOutput as SqlQueryFindCarriageCargoByIdOutputStrict } from '../.generated/types';
import { asFromDatabase } from '../.generated/casts';

export type { SqlQueryFindCarriageCargoByIdOutputStrict };

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindCarriageCargoByIdOutputStrict,
): HasMetadata<CarriageCargo> =>
  new CarriageCargo({
    id: asFromDatabase.number(dbObject.id),
    uuid: dbObject.uuid,
    itineraryUuid: dbObject.itinerary_uuid,
    carriageRef: { uuid: dbObject.carriage_uuid },
    slot: asFromDatabase.number(dbObject.slot),
    cargoExid: dbObject.cargo_exid,
  }) as HasMetadata<CarriageCargo>;
