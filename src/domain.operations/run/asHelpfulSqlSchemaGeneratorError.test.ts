import { given, then, when } from 'test-fns';

import { asHelpfulSqlSchemaGeneratorError } from './asHelpfulSqlSchemaGeneratorError';

describe('asHelpfulSqlSchemaGeneratorError', () => {
  given(
    '[case1] the documented native-array-unsupported stderr from sql-schema-generator',
    () => {
      // this is the exact error sql-schema-generator throws when a consumer models a
      // primitive/enum array (e.g. tags: string[]) — the wish's headline example — because
      // its ARRAY_OF accepts only REFERENCEs/UUIDs today. see handoff.sql-schema-generator.md
      const stderr =
        'Error: only arrays of REFERENCEs or UUIDs are supported\n    at ARRAY_OF (.../defineProperty.ts:367)';

      when('[t0] the stderr is cast into a helpful error', () => {
        const error = asHelpfulSqlSchemaGeneratorError({ stderr });

        then('it names the native-array limitation as the cause', () => {
          expect(error.message).toContain(
            'can not yet build a native primitive or enum array column',
          );
        });

        then('it names the fix — upgrade or model as a reference', () => {
          expect(error.message).toContain('upgrade sql-schema-generator');
          expect(error.message).toContain('array of domain-object references');
        });

        then('it points at the handoff for follow-up', () => {
          expect(error.message).toContain('handoff.sql-schema-generator.md');
        });

        then('it preserves the raw error for later diagnosis', () => {
          expect(error.message).toContain(
            'only arrays of REFERENCEs or UUIDs are supported',
          );
        });
      });
    },
  );

  given('[case2] an unrelated sql-schema-generator stderr', () => {
    const stderr = 'Error: could not connect to config at ./absent.yml';

    when('[t0] the stderr is cast into a helpful error', () => {
      const error = asHelpfulSqlSchemaGeneratorError({ stderr });

      then('it surfaces the raw failure with context', () => {
        expect(error.message).toContain('sql-schema-generator failed');
        expect(error.message).toContain(
          'could not connect to config at ./absent.yml',
        );
      });

      then('it does not mislabel it as the native-array limitation', () => {
        expect(error.message).not.toContain(
          'can not yet build a native primitive or enum array column',
        );
      });
    });
  });
});
