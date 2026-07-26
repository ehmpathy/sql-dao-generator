import { ConstraintError, MalfunctionError } from 'helpful-errors';

/**
 * .what = casts a raw sql-schema-generator stderr string into a helpful, actionable HelpfulError
 * .why = sql-dao-generator now emits prop.ARRAY_OF(prop.<primitive>()) for primitive/enum
 *   arrays, but sql-schema-generator's ARRAY_OF accepts only REFERENCEs/UUIDs today, so it
 *   throws a bare "only arrays of REFERENCEs or UUIDs are supported". without this cast a
 *   consumer sees raw subprocess stderr with no hint that this is a known downstream
 *   limitation. this names the cause and the fix, and preserves the raw stderr as metadata.
 *   see handoff.sql-schema-generator.md
 */

// the exact, documented error sql-schema-generator throws when ARRAY_OF wraps a non-reference, non-uuid element (i.e. a native primitive or enum array). see defineProperty.ts ARRAY_OF in sql-schema-generator + handoff.sql-schema-generator.md.
// note: this is a best-effort partial-text match, coupled to sql-schema-generator's exact error text. safe while that dep is pinned; re-verify this text against the real upstream error on the next intentional sql-schema-generator upgrade. if it no longer fits, the fallback is still a fail-loud MalfunctionError with the raw stderr — only the helpful hint is lost, never the failure.
const NATIVE_ARRAY_UNSUPPORTED_SIGNAL =
  'only arrays of REFERENCEs or UUIDs are supported';

export const asHelpfulSqlSchemaGeneratorError = ({
  stderr,
}: {
  stderr: string;
}): Error => {
  // the installed sql-schema-generator can not yet build a native primitive/enum array column; the caller resolves it (upgrade or remodel), so it is a constraint on their input, not a malfunction
  if (stderr.includes(NATIVE_ARRAY_UNSUPPORTED_SIGNAL))
    return new ConstraintError(
      [
        'sql-schema-generator can not yet build a native primitive or enum array column',
        '(e.g. text[] / numeric[] / boolean[] / timestamptz[] / enum[]).',
        'sql-dao-generator emits prop.ARRAY_OF(prop.<primitive>()) for these, but the installed',
        'sql-schema-generator ARRAY_OF accepts only REFERENCEs or UUIDs.',
        'fix: upgrade sql-schema-generator to a version that supports native primitive/enum array',
        'columns, or model this property as an array of domain-object references (a relation) until',
        'then. see handoff.sql-schema-generator.md for the tracked follow-up.',
      ].join(' '),
      { stderr },
    );

  // otherwise, the subprocess failed for a reason we did not anticipate — surface it as a malfunction with the raw stderr preserved as metadata
  return new MalfunctionError('sql-schema-generator failed', { stderr });
};
