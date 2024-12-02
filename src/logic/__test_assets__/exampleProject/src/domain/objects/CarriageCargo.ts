import { DomainEntity, Ref } from 'domain-objects';
import { Carriage } from './Carriage';

/**
 * .what = cargo which has been allocated to a carriage at a given point in time
 */
export interface CarriageCargo {
  id?: number;
  uuid?: string;

  /**
   * the itinerary during which it is allocated
   */
  itineraryUuid: string; // todo: ref to an itinerary once we declare it

  /**
   * the carriage it has been allocated to
   */
  carriageRef: Ref<typeof Carriage>;

  /**
   * the slot that it has been allocated to on the carriage
   */
  slot: number;

  /**
   * the cargo that has been allocated
   */
  cargoExid: null | string;
}
export class CarriageCargo extends DomainEntity<CarriageCargo> implements CarriageCargo {
  public static primary = ['uuid'] as const;
  public static unique = ['itineraryUuid', 'carriageRef', 'slot'] as const;
  public static updatable = ['cargoExid'];
}
