import { HasMetadata } from 'type-fns';

import { TrainEngineer } from '../../../domain';
import { SqlQueryFindTrainEngineerByIdOutput as SqlQueryFindTrainEngineerByIdOutputStrict } from '../.generated/types';
import { asFromDatabase } from '../.generated/casts';
import { castFromDatabaseObject as castCertificateFromDatabaseObject, SqlQueryFindCertificateByIdOutputJsoned } from '../certificateDao/castFromDatabaseObject';

export type { SqlQueryFindTrainEngineerByIdOutputStrict };

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindTrainEngineerByIdOutputStrict,
): HasMetadata<TrainEngineer> =>
  new TrainEngineer({
    id: asFromDatabase.number(dbObject.id),
    uuid: dbObject.uuid,
    socialSecurityNumberHash: dbObject.social_security_number_hash,
    certificates: (dbObject.certificates as SqlQueryFindCertificateByIdOutputJsoned[]).map(castCertificateFromDatabaseObject),
    licenseUuids: dbObject.license_uuids as string[],
    name: dbObject.name,
  }) as HasMetadata<TrainEngineer>;
