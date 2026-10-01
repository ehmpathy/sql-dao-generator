import { HasMetadata } from 'type-fns';

import { Certificate } from '../../../domain';
import { SqlQueryFindCertificateByIdOutput as SqlQueryFindCertificateByIdOutputStrict } from '../.generated/types';
import type { AsJsonFromDbObject } from '../.generated/casts';
import { asFromDatabase } from '../.generated/casts';

export type { SqlQueryFindCertificateByIdOutputStrict };

export type SqlQueryFindCertificateByIdOutputJsoned =
  AsJsonFromDbObject<SqlQueryFindCertificateByIdOutputStrict>;

export type SqlQueryFindCertificateByIdOutput =
  | SqlQueryFindCertificateByIdOutputStrict
  | SqlQueryFindCertificateByIdOutputJsoned;

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindCertificateByIdOutput,
): HasMetadata<Certificate> =>
  new Certificate({
    id: asFromDatabase.number(dbObject.id),
    type: dbObject.type as Certificate['type'],
    industryId: dbObject.industry_id,
  }) as HasMetadata<Certificate>;
