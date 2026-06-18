import { HasMetadata } from 'type-fns';

import { TrainEngineer } from '../../../domain';
import { SqlQueryFindCertificateByIdOutput, SqlQueryFindTrainEngineerByIdOutput } from '../.generated/types';
import { castFromDatabaseObject as castCertificateFromDatabaseObject } from '../certificateDao/castFromDatabaseObject';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindTrainEngineerByIdOutput,
): HasMetadata<TrainEngineer> =>
  new TrainEngineer({
    id: dbObject.id,
    uuid: dbObject.uuid,
    socialSecurityNumberHash: dbObject.social_security_number_hash,
    certificates: (dbObject.certificates as SqlQueryFindCertificateByIdOutput[]).map(castCertificateFromDatabaseObject),
    licenseUuids: dbObject.license_uuids as string[],
    name: dbObject.name,
  }) as HasMetadata<TrainEngineer>;
