import { HasMetadata } from 'type-fns';

import { Certificate } from '../../../domain';
import { SqlQueryFindCertificateByIdOutput } from '../../../data/dao/.generated/types';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindCertificateByIdOutput,
): HasMetadata<Certificate> =>
  new Certificate({
    id: dbObject.id,
    type: dbObject.type as Certificate['type'],
    industryId: dbObject.industry_id,
  }) as HasMetadata<Certificate>;
