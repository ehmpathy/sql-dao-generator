import { DomainLiteral } from 'domain-objects';

/**
 * .what = a point on the earth, carried as a value rather than an identity
 * .why  = a literal may be nested, so it is the shape that reaches the json path and exhibits the
 *         runtime-type divergence this generator repairs
 * .note = `createdAt` is declared on purpose: a generated column enters the nested json only when
 *         the domain declares it, and it carries the DATE half of the divergence
 */
export interface Geocode {
  id?: number;
  createdAt?: Date;
  latitude: number;
  longitude: number;
}
export class Geocode extends DomainLiteral<Geocode> implements Geocode {}
