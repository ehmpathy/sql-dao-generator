import { ConstraintError, MalfunctionError } from 'helpful-errors';

/**
 * .what = casts a raw sql-schema-generator stderr string into an actionable HelpfulError
 * .why = we generate prop.ARRAY_OF(prop.<primitive>()) for primitive/enum arrays, but
 *   sql-schema-generator's ARRAY_OF accepts only REFERENCEs/UUIDs, and its bare throw names no
 *   cause or fix. see .behavior/v2026_07_20.consume-primitive-array-classification/handoff.sql-schema-generator.md
 */

// the error sql-schema-generator's ARRAY_OF (defineProperty.ts) throws on a native primitive or enum array
// note: a text match against a pinned dep; re-verify on the next upgrade. a miss loses only the hint — the fallback still fails loud
const NATIVE_ARRAY_UNSUPPORTED_SIGNAL =
  'only arrays of REFERENCEs or UUIDs are supported';

export const asHelpfulSqlSchemaGeneratorError = ({
  stderr,
}: {
  stderr: string;
}): Error => {
  // native array unsupported: the caller fixes it (upgrade or remodel), so a constraint
  if (stderr.includes(NATIVE_ARRAY_UNSUPPORTED_SIGNAL))
    return new ConstraintError(
      [
        'sql-schema-generator can not yet build a native primitive or enum array column',
        '(e.g. text[] / numeric[] / boolean[] / timestamptz[] / enum[]).',
        'sql-dao-generator generates prop.ARRAY_OF(prop.<primitive>()) for these, but the installed',
        'sql-schema-generator ARRAY_OF accepts only REFERENCEs or UUIDs.',
        'fix: upgrade sql-schema-generator to a version that supports native primitive/enum array',
        'columns, or model this property as an array of domain-object references (a relation) until',
        'then.',
        // .note = no `see <path>` line: a `.behavior/` path is absent from a consumer's install.
        //   the handoff is cited in the jsdoc above, for the maintainer who can open it
      ].join(' '),
      { stderr },
    );

  // otherwise, an unanticipated failure: a malfunction, raw stderr kept as metadata
  return new MalfunctionError('sql-schema-generator failed', { stderr });
};
