import { DomainEntity } from 'domain-objects';

import { Certificate } from './Certificate';

/**
 * a train engineer drives and maintains the train
 */
export interface TrainEngineer {
  id?: number;
  uuid?: string;
  socialSecurityNumberHash: string; // the hash of their social security number
  certificates: Certificate[]; // an array of what certificates they've earned
  licenseUuids: string[]; // an array of licenses, tracked in a separate database, that the engineer has earned
  name: string;
}
export class TrainEngineer
  extends DomainEntity<TrainEngineer>
  implements TrainEngineer
{
  public static primary = ['uuid'] as const;
  public static unique = ['socialSecurityNumberHash'] as const;
  public static updatable = ['name', 'certificates', 'licenseUuids'];
}
