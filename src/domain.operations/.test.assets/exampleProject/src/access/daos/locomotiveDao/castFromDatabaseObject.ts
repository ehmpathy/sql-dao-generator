import { HasMetadata } from 'type-fns';

import { Locomotive } from '../../../domain';
import { SqlQueryFindLocomotiveByIdOutput } from '../../../data/dao/.generated/types';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindLocomotiveByIdOutput,
): HasMetadata<Locomotive> =>
  new Locomotive({
    id: dbObject.id,
    uuid: dbObject.uuid,
    createdAt: dbObject.created_at,
    effectiveAt: dbObject.effective_at,
    updatedAt: dbObject.updated_at,
    ein: dbObject.ein,
    fuel: dbObject.fuel as Locomotive['fuel'],
    capacity: dbObject.capacity,
    milage: dbObject.milage,
  }) as HasMetadata<Locomotive>;
