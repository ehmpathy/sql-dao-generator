import { DomainEvent } from 'domain-objects';
import { Geocode } from './Geocode';

/**
 * tracking the location of trains over time
 */
export interface TrainLocatedEvent {
  trainUuid: string;
  occurredAt: string;
  geocode: Geocode;
}
export class TrainLocatedEvent extends DomainEvent<TrainLocatedEvent> implements TrainLocatedEvent {
  public static unique = ['trainUuid', 'occurredAt'];
}
