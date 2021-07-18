import { DomainEntity } from 'domain-objects';

/**
 * a train engineer drives and maintains the train
 */
export interface TrainEngineer {
  id?: number;
  uuid?: string;
  socialSecurityNumberHash: string; // the hash of their social security number
  name: string;
}
export class TrainEngineer extends DomainEntity<TrainEngineer> implements TrainEngineer {
  public static unique = ['socialSecurityNumberHash'];
  public static updatable = ['name'];
}
