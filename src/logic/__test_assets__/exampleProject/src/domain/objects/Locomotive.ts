import { DomainEntity } from 'domain-objects';

export enum LocomotiveFuel {
  STEAM = 'STEAM',
  COAL = 'COAL',
  DIESEL = 'DIESEL',
  BATTERY = 'BATTERY',
  FISSION = 'FISSION',
}

/**
 * the locomotive is a part of a train that provides power to the train (i.e., locomotion)
 *
 * > A locomotive or engine is a rail transport vehicle that provides the motive power for a train.
 * > If a locomotive is capable of carrying a payload, it is usually rather referred to as a multiple unit, motor coach, railcar or power car; the use of these self-propelled vehicles is increasingly common for passenger trains, but rare for freight (see CargoSprinter and Iron Highway).
 */
export interface Locomotive {
  id?: number;
  uuid?: string;
  ein: string; // an "engine identification number", like a vin on a car
  fuel: LocomotiveFuel;
  capacity: number; // in tons
  milage: number; // updated at the end of each day
}
export class Locomotive extends DomainEntity<Locomotive> implements Locomotive {
  public static unique = ['ein'];
  public static updatable = ['milage'];
}
