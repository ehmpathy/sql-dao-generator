import { HasMetadata } from 'type-fns';

import { Price } from '../../../domain';
import { SqlQueryFindPriceByIdOutput } from '../.generated/types';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindPriceByIdOutput,
): HasMetadata<Price> =>
  new Price({
    id: dbObject.id,
    amount: dbObject.amount,
    currency: dbObject.currency as Price['currency'],
  }) as HasMetadata<Price>;
