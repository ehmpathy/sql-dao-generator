import { HasMetadata } from 'type-fns';

import { Carriage } from '../../../domain';
import { SqlQueryFindCarriageByIdOutput } from '../../../data/dao/.generated/types';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindCarriageByIdOutput,
): HasMetadata<Carriage> =>
  new Carriage({
    id: dbObject.id,
    uuid: dbObject.uuid,
    cin: dbObject.cin,
    carries: dbObject.carries as Carriage['carries'],
    capacity: dbObject.capacity,
  }) as HasMetadata<Carriage>;
