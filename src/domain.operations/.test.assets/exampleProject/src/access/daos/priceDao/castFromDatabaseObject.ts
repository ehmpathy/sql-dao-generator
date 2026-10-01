import { HasMetadata } from 'type-fns';

import { Price } from '../../../domain';
import { SqlQueryFindPriceByIdOutput as SqlQueryFindPriceByIdOutputStrict } from '../.generated/types';
import type { AsJsonFromDbObject } from '../.generated/casts';
import { asFromDatabase } from '../.generated/casts';

export type { SqlQueryFindPriceByIdOutputStrict };

export type SqlQueryFindPriceByIdOutputJsoned =
  AsJsonFromDbObject<SqlQueryFindPriceByIdOutputStrict>;

export type SqlQueryFindPriceByIdOutput =
  | SqlQueryFindPriceByIdOutputStrict
  | SqlQueryFindPriceByIdOutputJsoned;

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindPriceByIdOutput,
): HasMetadata<Price> =>
  new Price({
    id: asFromDatabase.number(dbObject.id),
    amount: asFromDatabase.number(dbObject.amount),
    currency: dbObject.currency as Price['currency'],
  }) as HasMetadata<Price>;
