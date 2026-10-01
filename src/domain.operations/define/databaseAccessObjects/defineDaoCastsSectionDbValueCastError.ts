import { DAO_UTIL_ERROR_NAME } from './constants';
import type { DaoCastsSection } from './defineDaoCastsCodeFile';

/**
 * .what = defines the shared error every generated cast throws when a db value can not be cast
 * .why  = its name is read from `DAO_UTIL_ERROR_NAME`, since no type-checker relates the section
 *         that declares it to the sections that throw it
 * .note = it makes `helpful-errors` a dependency of every generated dao dir. npm hoists it via
 *         `domain-objects`; pnpm and yarn pnp do not
 */
export const defineDaoCastsSectionDbValueCastError = (): DaoCastsSection => ({
  imports: [`import { ConstraintError } from 'helpful-errors';`],
  content: `
/**
 * .what = thrown when a value from the database can not be cast to its declared domain type
 * .why  = a cast may throw; it may never absorb. a wrong-but-plausible value would hide the defect
 * .note = a \`ConstraintError\`, since the caller declared the type this value does not fit
 * .note = the value lives in metadata, never in the message, so \`.redact(['metadata'])\` keeps
 *         the diagnosis. the stack trace names the dao line that read it
 * .note = no constructor — the inherited statics build via \`new this(message, metadata)\`
 */
export class ${DAO_UTIL_ERROR_NAME} extends ConstraintError<{
  expected: string;
  value: unknown;
  valueTypeof: string;
}> {}
`.trim(),
});
