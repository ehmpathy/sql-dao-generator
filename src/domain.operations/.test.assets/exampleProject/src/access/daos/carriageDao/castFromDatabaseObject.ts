import { HasMetadata } from 'type-fns';

import { Carriage } from '../../../domain';
import { SqlQueryFindCarriageByIdOutput as SqlQueryFindCarriageByIdOutputStrict } from '../.generated/types';
import { asFromDatabase } from '../.generated/casts';

export type { SqlQueryFindCarriageByIdOutputStrict };

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindCarriageByIdOutputStrict,
): HasMetadata<Carriage> =>
  new Carriage({
    id: asFromDatabase.number(dbObject.id),
    uuid: dbObject.uuid,
    cin: dbObject.cin,
    carries: dbObject.carries as Carriage['carries'],
    capacity: asFromDatabase.number(dbObject.capacity),
  }) as HasMetadata<Carriage>;
