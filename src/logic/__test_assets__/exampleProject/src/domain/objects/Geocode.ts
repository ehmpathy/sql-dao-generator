import { DomainLiteral } from 'domain-objects';

export interface Geocode {
  id?: number;
  latitude: number;
  longitude: number;
}
export class Geocode extends DomainLiteral<Geocode> implements Geocode {}
