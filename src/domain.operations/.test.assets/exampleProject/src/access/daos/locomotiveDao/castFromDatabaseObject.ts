import { HasMetadata } from 'type-fns';

import { Locomotive } from '../../../domain';
import { SqlQueryFindLocomotiveByIdOutput as SqlQueryFindLocomotiveByIdOutputStrict } from '../.generated/types';
import { asFromDatabase } from '../.generated/casts';

export type { SqlQueryFindLocomotiveByIdOutputStrict };

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindLocomotiveByIdOutputStrict,
): HasMetadata<Locomotive> =>
  new Locomotive({
    id: asFromDatabase.number(dbObject.id),
    uuid: dbObject.uuid,
    createdAt: asFromDatabase.date(dbObject.created_at),
    effectiveAt: asFromDatabase.date(dbObject.effective_at),
    updatedAt: asFromDatabase.date(dbObject.updated_at),
    ein: dbObject.ein,
    fuel: dbObject.fuel as Locomotive['fuel'],
    capacity: asFromDatabase.number(dbObject.capacity),
    milage: asFromDatabase.number(dbObject.milage),
  }) as HasMetadata<Locomotive>;
