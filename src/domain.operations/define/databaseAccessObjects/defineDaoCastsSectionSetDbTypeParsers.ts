import { DAO_CAST_IMPL_NUMBER } from './constants';
import type { DaoCastsSection } from './defineDaoCastsCodeFile';

/**
 * .what = defines the pg type-parser supply that a consumer opts into from their own connection
 * .why  = node-postgres returns `int8` and `numeric` as strings, so a domain `number` arrives as a
 *         string on the raw path unless the consumer registers a parser
 * .note = supplied, never applied: `pg.types` is process-global, so an import-time call would
 *         change how every query in the consumer's process parses bigints
 * .note = each parser is the number cast itself, so it must be composed after that section
 */
export const defineDaoCastsSectionSetDbTypeParsers = (): DaoCastsSection => ({
  imports: [`import pg from 'pg';`],
  content: `
/**
 * .what = reads one postgres \`int8[]\` wire value — \`{1,2}\`, with an unquoted \`NULL\` element
 * .note = a NULL element stays \`null\`, as node-postgres' own parser does
 */
const asInt8ArrayFromDbValue = (value: string): (number | null)[] =>
  value === '{}'
    ? []
    : value
        .slice(1, -1)
        .split(',')
        .map((each) => (each === 'NULL' ? null : ${DAO_CAST_IMPL_NUMBER}(each)));

/**
 * .what = registers the pg type parsers this schema needs, on the shared pg module
 * .why  = a generated dao declares \`id: number\`; absent these parsers the raw-column path hands
 *         back strings, so the declared type is false on any read that skips a generated cast
 * .note = each parser refuses an integer past \`Number.MAX_SAFE_INTEGER\` rather than truncate it
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
  pg.types.setTypeParser(20, ${DAO_CAST_IMPL_NUMBER});

  // numeric — every domain \`number\` property
  pg.types.setTypeParser(1700, ${DAO_CAST_IMPL_NUMBER});

  // int8[] — the bigint[] columns the _current views expose. \`as never\`: the \`pg\` typings' oid
  // union omits 1016
  pg.types.setTypeParser(1016 as never, asInt8ArrayFromDbValue);
};
`.trim(),
});
