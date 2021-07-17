import { DomainEntity } from 'domain-objects';

/**
 * a train engineer drives and maintains the train
 */
export interface Engineer {
  id?: number;
  uuid?: string;
  socialSecurityNumberHash: string; // the hash of their social security number
  name: string;
}
export class Engineer extends DomainEntity<Engineer> implements Engineer {
  public static unique = ['socialSecurityNumberHash'];
  public static updatable = ['name'];
}
