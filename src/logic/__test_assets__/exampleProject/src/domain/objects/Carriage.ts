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
  cin: string; // a "carriage identification number", like a vin on a car
  carries: CarriagePurpose;
  capacity: number; // for passenger carriages, number of passengers; for freight, the volume
}
export class Carriage extends DomainEntity<Carriage> implements Carriage {
  public static unique = ['cin'];
}
