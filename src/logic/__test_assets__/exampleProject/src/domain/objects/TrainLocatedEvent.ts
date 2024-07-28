import { DomainEvent } from 'domain-objects';

import { Geocode } from './Geocode';

/**
 * tracking the location of trains over time
 */
export interface TrainLocatedEvent {
  id?: number;
  trainUuid: string;
  occurredAt: string;
  geocode: Geocode;
}
export class TrainLocatedEvent
  extends DomainEvent<TrainLocatedEvent>
  implements TrainLocatedEvent
{
  public static primary = ['uuid'] as const;
  public static unique = ['trainUuid', 'occurredAt'] as const;
}
