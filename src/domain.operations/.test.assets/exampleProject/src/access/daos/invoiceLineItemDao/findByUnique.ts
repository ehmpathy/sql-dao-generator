import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { InvoiceLineItem, Price } from '../../../domain';
import { sqlQueryFindInvoiceLineItemByUnique } from '../.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';
import { priceDao } from '../priceDao';

export const sql = `
  -- query_name = find_invoice_line_item_by_unique
  SELECT
    invoice_line_item.id,
    invoice_line_item.price,
    invoice_line_item.title,
    invoice_line_item.explanation
  FROM view_invoice_line_item_hydrated AS invoice_line_item
  JOIN invoice_line_item as view_invoice_line_item_current ON invoice_line_item.id = view_invoice_line_item_current.id
  WHERE 1=1
    AND view_invoice_line_item_current.price_id = :priceId
    AND invoice_line_item.title = :title
    AND invoice_line_item.explanation = :explanation;
`;

export const findByUnique = async (
  {
    price,
    title,
    explanation,
  }: {
    price: Price;
    title: string;
    explanation: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<InvoiceLineItem> | null> => {
  const results = await sqlQueryFindInvoiceLineItemByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      priceId: price.id ? price.id : ((await priceDao.findByUnique(price, context))?.id ?? -1),
      title,
      explanation,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
