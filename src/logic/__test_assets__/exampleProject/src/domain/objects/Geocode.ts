import { DomainValueObject } from 'domain-objects';

export interface Geocode {
  id?: number;
  latitude: number;
  longitude: number;
}
export class Geocode extends DomainValueObject<Geocode> implements Geocode {}
