import { HasMetadata } from 'type-fns';

import { InvoiceLineItem } from '../../../domain';
import { SqlQueryFindInvoiceLineItemByIdOutput as SqlQueryFindInvoiceLineItemByIdOutputStrict } from '../.generated/types';
import type { AsJsonFromDbObject } from '../.generated/casts';
import { asFromDatabase } from '../.generated/casts';
import { castFromDatabaseObject as castPriceFromDatabaseObject, SqlQueryFindPriceByIdOutputJsoned } from '../priceDao/castFromDatabaseObject';

export type { SqlQueryFindInvoiceLineItemByIdOutputStrict };

export type SqlQueryFindInvoiceLineItemByIdOutputJsoned =
  AsJsonFromDbObject<SqlQueryFindInvoiceLineItemByIdOutputStrict>;

export type SqlQueryFindInvoiceLineItemByIdOutput =
  | SqlQueryFindInvoiceLineItemByIdOutputStrict
  | SqlQueryFindInvoiceLineItemByIdOutputJsoned;

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindInvoiceLineItemByIdOutput,
): HasMetadata<InvoiceLineItem> =>
  new InvoiceLineItem({
    id: asFromDatabase.number(dbObject.id),
    price: castPriceFromDatabaseObject(dbObject.price as SqlQueryFindPriceByIdOutputJsoned),
    title: dbObject.title,
    explanation: dbObject.explanation,
  }) as HasMetadata<InvoiceLineItem>;
