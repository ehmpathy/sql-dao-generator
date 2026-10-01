import { ConstraintError } from 'helpful-errors';
import pg from 'pg';

/**
 * .what = restates a raw row type as the shape that same row takes inside a json column
 * .why  = json has no date type, so a `timestamptz` that is a `Date` on the raw path is an
 *         iso-8601 `string` here. every other primitive crosses unchanged
 * .note = derived from the raw type rather than mirrored by hand. a nested json column stays
 *         opaque — truth for that level is restored by that dao's own cast
 */
export type AsJsonFromDbObject<T> = T extends Date
  ? string
  : T extends (infer E)[]
    ? AsJsonFromDbObject<E>[]
    : T extends object
      ? { [K in keyof T]: AsJsonFromDbObject<T[K]> }
      : T;

/**
 * .what = thrown when a value from the database can not be cast to its declared domain type
 * .why  = a cast may throw; it may never absorb. a wrong-but-plausible value would hide the defect
 * .note = a `ConstraintError`, since the caller declared the type this value does not fit
 * .note = the value lives in metadata, never in the message, so `.redact(['metadata'])` keeps
 *         the diagnosis. the stack trace names the dao line that read it
 * .note = no constructor — the inherited statics build via `new this(message, metadata)`
 */
export class DbValueCastError extends ConstraintError<{
  expected: string;
  value: unknown;
  valueTypeof: string;
}> {}

/**
 * .what = casts a db value to the `Date` its domain object declares
 * .why  = a `timestamptz` is a `Date` from a raw select and an iso-8601 `string` from inside
 *         `json_build_object`
 */
const asDateFromDbValue = (value: Date | string): Date => {
  // pass through the `Date` node-postgres parsed on the raw path
  if (value instanceof Date) return value;

  // refuse a value that is neither — reachable from a hand-written query whose row is typed `any`
  if (typeof value !== 'string')
    throw new DbValueCastError(
      `could not cast db value to Date: the value is neither a Date nor a string, so it did not come from a timestamp column. check the column it was read from, or declare the property as the type it actually holds`,
      { expected: 'Date', value, valueTypeof: typeof value },
    );

  // parse the iso-8601 string postgres rendered into json
  const cast = new Date(value);
  if (Number.isNaN(cast.getTime()))
    throw new DbValueCastError(
      `could not cast db value to Date: the value is not a date this runtime can parse. check the column holds a timestamp, or declare the property as a string`,
      { expected: 'Date', value, valueTypeof: typeof value },
    );

  return cast;
};

/**
 * .what = casts a db value to the `number` its domain object declares
 * .why  = `bigint` and `numeric` are `string` from a raw select and a json `number` from inside
 *         `json_build_object`
 */
const asNumberFromDbValue = (value: number | string): number => {
  // refuse a value that is neither — `Number(null)` and `Number(true)` are finite, so the
  // guards below would admit them
  if (typeof value !== 'number' && typeof value !== 'string')
    throw new DbValueCastError(
      `could not cast db value to number: the value is neither a number nor a string, so it did not come from a numeric column. check the column it was read from, or declare the property as the type it actually holds`,
      { expected: 'number', value, valueTypeof: typeof value },
    );

  // refuse what no js number holds as a quantity: NaN, `Infinity`, and a blank, which
  // `Number` reads as 0
  const cast = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(cast) || (typeof value === 'string' && !value.trim()))
    throw new DbValueCastError(
      `could not cast db value to number: the value is not a finite number. check the column holds a numeric, or declare the property as a string`,
      { expected: 'number', value, valueTypeof: typeof value },
    );

  // refuse an integer past float range — a truncated id points at the wrong row
  if (Number.isInteger(cast) && !Number.isSafeInteger(cast))
    throw new DbValueCastError(
      `could not cast db value to number: the value is an integer beyond Number.MAX_SAFE_INTEGER, so it can not be held by a js number without loss. declare the property as a string, or narrow the column`,
      { expected: 'number', value, valueTypeof: typeof value },
    );

  return cast;
};

/**
 * .what = the casts that make a declared property type true, whichever way it was selected
 * .why  = a `timestamptz` is a `Date` from a raw column and an iso-8601 string from inside
 *         `json_build_object`; a `bigint` is a `number` or a `string`, per the pg type parsers
 *         this process carries. each cast takes either and returns one
 */
export const asFromDatabase = {
  date: asDateFromDbValue,
  number: asNumberFromDbValue,
};

/**
 * .what = reads one postgres `int8[]` wire value — `{1,2}`, with an unquoted `NULL` element
 * .note = a NULL element stays `null`, as node-postgres' own parser does
 */
const asInt8ArrayFromDbValue = (value: string): (number | null)[] =>
  value === '{}'
    ? []
    : value
        .slice(1, -1)
        .split(',')
        .map((each) => (each === 'NULL' ? null : asNumberFromDbValue(each)));

/**
 * .what = registers the pg type parsers this schema needs, on the shared pg module
 * .why  = a generated dao declares `id: number`; absent these parsers the raw-column path hands
 *         back strings, so the declared type is false on any read that skips a generated cast
 * .note = each parser refuses an integer past `Number.MAX_SAFE_INTEGER` rather than truncate it
 * .note = it replaces any parser already registered for these oids. idempotent
 *
 * usage — from your own connection file, deliberately:
 *
 *   import { setDbTypeParsers } from '../access/daos/.generated/casts';
 *
 *   setDbTypeParsers();
 *   const client = new Client({ ... });
 */
export const setDbTypeParsers = (): void => {
  // int8 — bigint, bigserial, and every REFERENCES column
  pg.types.setTypeParser(20, asNumberFromDbValue);

  // numeric — every domain `number` property
  pg.types.setTypeParser(1700, asNumberFromDbValue);

  // int8[] — the bigint[] columns the _current views expose. `as never`: the `pg` typings' oid
  // union omits 1016
  pg.types.setTypeParser(1016 as never, asInt8ArrayFromDbValue);
};
