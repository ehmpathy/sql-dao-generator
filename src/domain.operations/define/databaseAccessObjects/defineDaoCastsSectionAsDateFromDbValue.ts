import { DAO_CAST_IMPL_DATE, DAO_UTIL_ERROR_NAME } from './constants';
import type { DaoCastsSection } from './defineDaoCastsCodeFile';

/**
 * .what = defines the shared cast that makes a `Date` property true on both serialization paths
 * .why  = a `timestamptz` arrives as a `Date` from a raw column select (node-postgres parses oid
 *         1184) but as an iso-8601 `string` from inside `json_build_object` — json has no date
 *         type. one cast, both paths, one runtime type
 */
export const defineDaoCastsSectionAsDateFromDbValue = (): DaoCastsSection => ({
  imports: [],
  content: `
/**
 * .what = casts a db value to the \`Date\` its domain object declares
 * .why  = a \`timestamptz\` is a \`Date\` from a raw select and an iso-8601 \`string\` from inside
 *         \`json_build_object\`
 */
const ${DAO_CAST_IMPL_DATE} = (value: Date | string): Date => {
  // pass through the \`Date\` node-postgres parsed on the raw path
  if (value instanceof Date) return value;

  // refuse a value that is neither — reachable from a hand-written query whose row is typed \`any\`
  if (typeof value !== 'string')
    throw new ${DAO_UTIL_ERROR_NAME}(
      \`could not cast db value to Date: the value is neither a Date nor a string, so it did not come from a timestamp column. check the column it was read from, or declare the property as the type it actually holds\`,
      { expected: 'Date', value, valueTypeof: typeof value },
    );

  // parse the iso-8601 string postgres rendered into json
  const cast = new Date(value);
  if (Number.isNaN(cast.getTime()))
    throw new ${DAO_UTIL_ERROR_NAME}(
      \`could not cast db value to Date: the value is not a date this runtime can parse. check the column holds a timestamp, or declare the property as a string\`,
      { expected: 'Date', value, valueTypeof: typeof value },
    );

  return cast;
};
`.trim(),
});
