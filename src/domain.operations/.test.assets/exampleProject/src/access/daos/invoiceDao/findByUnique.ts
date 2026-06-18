import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Invoice } from '../../../domain';
import { sqlQueryFindInvoiceByUnique } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_invoice_by_unique
  SELECT
    invoice.id,
    invoice.uuid,
    invoice.external_id,
    invoice.items,
    invoice.total_price,
    invoice.status
  FROM view_invoice_hydrated AS invoice
  WHERE 1=1
    AND invoice.external_id = :externalId;
`;

export const findByUnique = async (
  {
    externalId,
  }: {
    externalId: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Invoice> | null> => {
  const results = await sqlQueryFindInvoiceByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      externalId,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
