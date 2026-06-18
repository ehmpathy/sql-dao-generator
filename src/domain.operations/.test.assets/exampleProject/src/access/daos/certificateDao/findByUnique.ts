import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Certificate } from '../../../domain';
import { sqlQueryFindCertificateByUnique } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_certificate_by_unique
  SELECT
    certificate.id,
    certificate.type,
    certificate.industry_id
  FROM view_certificate_hydrated AS certificate
  WHERE 1=1
    AND certificate.type = :type
    AND certificate.industry_id = :industryId;
`;

export const findByUnique = async (
  {
    type,
    industryId,
  }: {
    type: Certificate['type'];
    industryId: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Certificate> | null> => {
  const results = await sqlQueryFindCertificateByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      type,
      industryId,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
