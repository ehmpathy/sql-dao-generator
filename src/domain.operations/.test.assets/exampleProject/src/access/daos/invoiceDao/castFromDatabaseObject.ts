import { HasMetadata } from 'type-fns';

import { Invoice } from '../../../domain';
import { SqlQueryFindInvoiceByIdOutput as SqlQueryFindInvoiceByIdOutputStrict } from '../.generated/types';
import { asFromDatabase } from '../.generated/casts';
import { castFromDatabaseObject as castInvoiceLineItemFromDatabaseObject, SqlQueryFindInvoiceLineItemByIdOutputJsoned } from '../invoiceLineItemDao/castFromDatabaseObject';
import { castFromDatabaseObject as castPriceFromDatabaseObject, SqlQueryFindPriceByIdOutputJsoned } from '../priceDao/castFromDatabaseObject';

export type { SqlQueryFindInvoiceByIdOutputStrict };

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindInvoiceByIdOutputStrict,
): HasMetadata<Invoice> =>
  new Invoice({
    id: asFromDatabase.number(dbObject.id),
    uuid: dbObject.uuid,
    externalId: dbObject.external_id,
    items: (dbObject.items as SqlQueryFindInvoiceLineItemByIdOutputJsoned[]).map(castInvoiceLineItemFromDatabaseObject),
    totalPrice: castPriceFromDatabaseObject(dbObject.total_price as SqlQueryFindPriceByIdOutputJsoned),
    status: dbObject.status as Invoice['status'],
  }) as HasMetadata<Invoice>;
