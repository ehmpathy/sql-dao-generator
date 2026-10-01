import { DAO_CAST_IMPL_NUMBER, DAO_UTIL_ERROR_NAME } from './constants';
import type { DaoCastsSection } from './defineDaoCastsCodeFile';

/**
 * .what = defines the shared cast that makes a `number` property true on both serialization paths
 * .why  = `bigint` and `numeric` arrive as `string` raw (absent a pg type parser) and as a json
 *         `number` inside `json_build_object`. one cast, both paths, one runtime type
 * .note = the pg type-parser supply registers this same cast, so both reads refuse alike
 */
export const defineDaoCastsSectionAsNumberFromDbValue =
  (): DaoCastsSection => ({
    imports: [],
    content: `
/**
 * .what = casts a db value to the \`number\` its domain object declares
 * .why  = \`bigint\` and \`numeric\` are \`string\` from a raw select and a json \`number\` from inside
 *         \`json_build_object\`
 */
const ${DAO_CAST_IMPL_NUMBER} = (value: number | string): number => {
  // refuse a value that is neither — \`Number(null)\` and \`Number(true)\` are finite, so the
  // guards below would admit them
  if (typeof value !== 'number' && typeof value !== 'string')
    throw new ${DAO_UTIL_ERROR_NAME}(
      \`could not cast db value to number: the value is neither a number nor a string, so it did not come from a numeric column. check the column it was read from, or declare the property as the type it actually holds\`,
      { expected: 'number', value, valueTypeof: typeof value },
    );

  // refuse what no js number holds as a quantity: NaN, \`Infinity\`, and a blank, which
  // \`Number\` reads as 0
  const cast = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(cast) || (typeof value === 'string' && !value.trim()))
    throw new ${DAO_UTIL_ERROR_NAME}(
      \`could not cast db value to number: the value is not a finite number. check the column holds a numeric, or declare the property as a string\`,
      { expected: 'number', value, valueTypeof: typeof value },
    );

  // refuse an integer past float range — a truncated id points at the wrong row
  if (Number.isInteger(cast) && !Number.isSafeInteger(cast))
    throw new ${DAO_UTIL_ERROR_NAME}(
      \`could not cast db value to number: the value is an integer beyond Number.MAX_SAFE_INTEGER, so it can not be held by a js number without loss. declare the property as a string, or narrow the column\`,
      { expected: 'number', value, valueTypeof: typeof value },
    );

  return cast;
};
`.trim(),
  });
