import { DomainEntity } from 'domain-objects';

import { Geocode } from './Geocode';

export interface TrainStation {
  id?: number;
  uuid?: string;
  geocode: Geocode;
  name: string;
}
export class TrainStation
  extends DomainEntity<TrainStation>
  implements TrainStation
{
  public static unique = ['geocode']; // identified by where it is in the world (note; identified by a ref to a literal)
  public static updatable = ['name']; // name can be updated
}
