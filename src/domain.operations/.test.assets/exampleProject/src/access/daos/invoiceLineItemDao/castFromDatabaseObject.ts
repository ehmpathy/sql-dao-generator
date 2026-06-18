import { HasMetadata } from 'type-fns';

import { InvoiceLineItem } from '../../../domain';
import { SqlQueryFindInvoiceLineItemByIdOutput, SqlQueryFindPriceByIdOutput } from '../../../data/dao/.generated/types';
import { castFromDatabaseObject as castPriceFromDatabaseObject } from '../priceDao/castFromDatabaseObject';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindInvoiceLineItemByIdOutput,
): HasMetadata<InvoiceLineItem> =>
  new InvoiceLineItem({
    id: dbObject.id,
    price: castPriceFromDatabaseObject(dbObject.price as SqlQueryFindPriceByIdOutput),
    title: dbObject.title,
    explanation: dbObject.explanation,
  }) as HasMetadata<InvoiceLineItem>;
