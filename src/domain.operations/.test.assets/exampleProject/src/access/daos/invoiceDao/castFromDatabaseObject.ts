import { HasMetadata } from 'type-fns';

import { Invoice } from '../../../domain';
import { SqlQueryFindInvoiceByIdOutput, SqlQueryFindInvoiceLineItemByIdOutput, SqlQueryFindPriceByIdOutput } from '../../../data/dao/.generated/types';
import { castFromDatabaseObject as castInvoiceLineItemFromDatabaseObject } from '../invoiceLineItemDao/castFromDatabaseObject';
import { castFromDatabaseObject as castPriceFromDatabaseObject } from '../priceDao/castFromDatabaseObject';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindInvoiceByIdOutput,
): HasMetadata<Invoice> =>
  new Invoice({
    id: dbObject.id,
    uuid: dbObject.uuid,
    externalId: dbObject.external_id,
    items: (dbObject.items as SqlQueryFindInvoiceLineItemByIdOutput[]).map(castInvoiceLineItemFromDatabaseObject),
    totalPrice: castPriceFromDatabaseObject(dbObject.total_price as SqlQueryFindPriceByIdOutput),
    status: dbObject.status as Invoice['status'],
  }) as HasMetadata<Invoice>;
