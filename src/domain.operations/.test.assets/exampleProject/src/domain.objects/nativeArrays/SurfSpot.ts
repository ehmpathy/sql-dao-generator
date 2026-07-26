import { DomainEntity } from 'domain-objects';

export enum SwellDirection {
  N = 'N',
  NW = 'NW',
  W = 'W',
  SW = 'SW',
  S = 'S',
}

/**
 * a surf spot exercises all four native array kinds through names a seaturtle would use:
 * - aliases (string[])            -> text[]     the other names surfers call the break
 * - bestSwellPeriodsSec (number[])-> numeric[]  the swell periods the break likes, in seconds
 * - swellWindows (SwellDirection[]) -> enum[]   the swell directions that light the break up
 * - lineupPhotoUuids (string[])   -> uuid[]     the _uuids implicit-reference array of lineup photos
 *
 * it lives in this dedicated subfolder — not the main index.ts and not matched by the cli's
 * `src/domain.objects/*.ts` glob — so real introspect() coverage of the array kinds can be proven
 * without a route through the cli `generate`, which shells out to sql-schema-generator (whose
 * ARRAY_OF still rejects native primitive/enum arrays today).
 */
export interface SurfSpot {
  id?: number;
  uuid?: string;
  slug: string;
  aliases: string[]; // primitive string array -> text[]
  bestSwellPeriodsSec: number[]; // primitive number array -> numeric[]
  swellWindows: SwellDirection[]; // enum array -> native enum[]
  lineupPhotoUuids: string[]; // _uuids implicit-reference array -> uuid[]
}
export class SurfSpot extends DomainEntity<SurfSpot> implements SurfSpot {
  public static primary = ['uuid'] as const;
  public static unique = ['slug'] as const;
  public static updatable = [];
}
