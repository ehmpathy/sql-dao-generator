import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { InvoiceLineItem } from '../../../domain';
import { sqlQueryFindInvoiceLineItemById } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_invoice_line_item_by_id
  SELECT
    invoice_line_item.id,
    invoice_line_item.price,
    invoice_line_item.title,
    invoice_line_item.explanation
  FROM view_invoice_line_item_hydrated AS invoice_line_item
  WHERE invoice_line_item.id = :id;
`;

export const findById = async (
  {
    id,
  }: {
    id: number;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<InvoiceLineItem> | null> => {
  const results = await sqlQueryFindInvoiceLineItemById({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      id,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
