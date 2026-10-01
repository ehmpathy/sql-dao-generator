import { DAO_UTIL_JSON_TYPE_NAME } from './constants';
import type { DaoCastsSection } from './defineDaoCastsCodeFile';

/**
 * .what = defines the shared type helper that restates a raw row type as its json shape
 * .why  = a value selected via `json_build_object` no longer has the raw row shape; every dao's
 *         jsoned type is built from this one helper
 */
export const defineDaoCastsSectionAsJsonFromDbObject = (): DaoCastsSection => ({
  imports: [],
  content: `
/**
 * .what = restates a raw row type as the shape that same row takes inside a json column
 * .why  = json has no date type, so a \`timestamptz\` that is a \`Date\` on the raw path is an
 *         iso-8601 \`string\` here. every other primitive crosses unchanged
 * .note = derived from the raw type rather than mirrored by hand. a nested json column stays
 *         opaque — truth for that level is restored by that dao's own cast
 */
export type ${DAO_UTIL_JSON_TYPE_NAME}<T> = T extends Date
  ? string
  : T extends (infer E)[]
    ? ${DAO_UTIL_JSON_TYPE_NAME}<E>[]
    : T extends object
      ? { [K in keyof T]: ${DAO_UTIL_JSON_TYPE_NAME}<T[K]> }
      : T;
`.trim(),
});
