import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { InvoiceLineItem, Price } from '../../../domain';
import { sqlQueryUpsertInvoiceLineItem } from '../../../data/dao/.generated/queryFunctions';
import { priceDao } from '../priceDao';

export const sql = `
  -- query_name = upsert_invoice_line_item
  SELECT
    dgv.id
  FROM upsert_invoice_line_item(
    :priceId,
    :title,
    :explanation
  ) as dgv;
`;

export const upsert = async (
  {
    invoiceLineItem,
  }: {
    invoiceLineItem: InvoiceLineItem;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<InvoiceLineItem>> => {
  const results = await sqlQueryUpsertInvoiceLineItem({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      priceId: invoiceLineItem.price.id ? invoiceLineItem.price.id : (await priceDao.upsert({ price: invoiceLineItem.price }, context)).id,
      title: invoiceLineItem.title,
      explanation: invoiceLineItem.explanation,
    },
  });
  const { id } = results[0]!; // grab the db generated values
  return new InvoiceLineItem({ ...invoiceLineItem, id }) as HasMetadata<InvoiceLineItem>;
};
