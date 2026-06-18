import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Invoice } from '../../../domain';
import { sqlQueryUpsertInvoice } from '../.generated/queryFunctions';
import { invoiceLineItemDao } from '../invoiceLineItemDao';
import { priceDao } from '../priceDao';

export const sql = `
  -- query_name = upsert_invoice
  SELECT
    dgv.id, dgv.uuid
  FROM upsert_invoice(
    :externalId,
    :itemIds,
    :totalPriceId,
    :status
  ) as dgv;
`;

export const upsert = async (
  {
    invoice,
  }: {
    invoice: Invoice;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Invoice>> => {
  const results = await sqlQueryUpsertInvoice({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      externalId: invoice.externalId,
      itemIds: await Promise.all(invoice.items.map(async (invoiceLineItem) => invoiceLineItem.id ? invoiceLineItem.id : (await invoiceLineItemDao.upsert({ invoiceLineItem }, context)).id)),
      totalPriceId: invoice.totalPrice.id ? invoice.totalPrice.id : (await priceDao.upsert({ price: invoice.totalPrice }, context)).id,
      status: invoice.status,
    },
  });
  const { id, uuid } = results[0]!; // grab the db generated values
  return new Invoice({ ...invoice, id, uuid }) as HasMetadata<Invoice>;
};
