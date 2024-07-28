import { DomainEntity } from 'domain-objects';

export enum CarriagePurpose {
  PASSENGER = 'PASSENGER',
  FREIGHT = 'FREIGHT',
}

/**
 * a carriage carries things or people in a train
 */
export interface Carriage {
  id?: number;
  uuid?: string;
  cin: string; // human readable identifier for carriage
  carries: CarriagePurpose;
  capacity: number; // for passenger carriages, number of passengers; for freight, the volume
}
export class Carriage extends DomainEntity<Carriage> implements Carriage {
  public static primary = ['uuid'] as const; // there is nothing that naturally identifies a carriage -> it is unique only on the unique identifier tracked in our db
  public static unique = ['uuid'] as const; // there is nothing that naturally identifies a carriage -> it is unique only on the unique identifier tracked in our db
  public static updatable = [];
}
