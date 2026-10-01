import {
  DAO_CAST_IMPL_DATE,
  DAO_CAST_IMPL_NUMBER,
  DAO_CASTS_NAMESPACE,
} from './constants';
import type { DaoCastsSection } from './defineDaoCastsCodeFile';

/**
 * .what = defines the one symbol a generated dao imports to reach any cast — the namespace that
 *         binds each cast implementation to a member
 * .why  = the casts are one family; one more cast is one more member, never one more import
 * .note = composed AFTER the casts it names: an object literal evaluates at module init, so a
 *         member above its `const` throws at import (temporal dead zone)
 * .note = members name the target shape; implementations keep full names for stack traces
 */
export const defineDaoCastsSectionAsFromDatabase = (): DaoCastsSection => ({
  imports: [],
  content: `
/**
 * .what = the casts that make a declared property type true, whichever way it was selected
 * .why  = a \`timestamptz\` is a \`Date\` from a raw column and an iso-8601 string from inside
 *         \`json_build_object\`; a \`bigint\` is a \`number\` or a \`string\`, per the pg type parsers
 *         this process carries. each cast takes either and returns one
 */
export const ${DAO_CASTS_NAMESPACE} = {
  date: ${DAO_CAST_IMPL_DATE},
  number: ${DAO_CAST_IMPL_NUMBER},
};
`.trim(),
});
