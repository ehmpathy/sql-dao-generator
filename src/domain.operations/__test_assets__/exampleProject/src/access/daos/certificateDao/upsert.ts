import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Certificate } from '../../../domain';
import { sqlQueryUpsertCertificate } from '../.generated/queryFunctions';

export const sql = `
  -- query_name = upsert_certificate
  SELECT
    dgv.id
  FROM upsert_certificate(
    :type,
    :industryId
  ) as dgv;
`;

export const upsert = async (
  {
    certificate,
  }: {
    certificate: Certificate;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Certificate>> => {
  const results = await sqlQueryUpsertCertificate({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      type: certificate.type,
      industryId: certificate.industryId,
    },
  });
  const { id } = results[0]!; // grab the db generated values
  return new Certificate({ ...certificate, id }) as HasMetadata<Certificate>;
};
