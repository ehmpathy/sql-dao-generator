import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Invoice } from '../../../domain';
import { sqlQueryFindInvoiceByUuid } from '../.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_invoice_by_uuid
  SELECT
    invoice.id,
    invoice.uuid,
    invoice.external_id,
    invoice.items,
    invoice.total_price,
    invoice.status
  FROM view_invoice_hydrated AS invoice
  WHERE invoice.uuid = :uuid;
`;

export const findByUuid = async (
  {
    uuid,
  }: {
    uuid: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Invoice> | null> => {
  const results = await sqlQueryFindInvoiceByUuid({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      uuid,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
