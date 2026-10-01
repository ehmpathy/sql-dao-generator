import { given, then, when } from 'test-fns';

import { UserInputError } from './UserInputError';

describe('UserInputError', () => {
  given('[case1] an error that names a domain object property', () => {
    when('[t0] the message is read', () => {
      const error = new UserInputError({
        reason:
          'properties that reference a domain-object must be named after it',
        domainObjectName: 'Train',
        domainObjectPropertyName: 'homeStation',
      });

      then('the subject clause names both the object and the property', () => {
        expect(error.message).toContain(
          `'Train.homeStation' does not meet this criteria.`,
        );
      });

      then('the reason and the call to action both survive', () => {
        expect(error.message).toContain(
          'properties that reference a domain-object must be named after it',
        );
        expect(error.message).toContain('Please correct this and try again.');
      });
    });
  });

  given('[case2] an error that names a domain object, with no property', () => {
    when('[t0] the message is read', () => {
      const error = new UserInputError({
        reason: 'this domain object declares no unique key',
        domainObjectName: 'Train',
      });

      then(
        'the subject clause names the object alone, with no dot-segment',
        () => {
          expect(error.message).toContain(
            `'Train' does not meet this criteria.`,
          );
          expect(error.message).not.toContain(`'Train.`);
        },
      );
    });
  });

  given('[case3] an error with NO subject at all — every config guard', () => {
    // .why = a config guard names a config key, never a domain object. the class used to
    //        interpolate an absent name straight into the message, so a human saw the
    //        literal word `undefined` quoted as though it were their own input.
    when('[t0] the message is read', () => {
      const error = new UserInputError({
        reason: 'config.language must be defined',
      });

      then('the literal word `undefined` never reaches the human', () => {
        expect(error.message).not.toContain('undefined');
      });

      then(
        'the subject clause is omitted entirely, rather than left empty',
        () => {
          expect(error.message).not.toContain('does not meet this criteria');
        },
      );

      then(
        'the reason and the call to action both survive the omission',
        () => {
          expect(error.message).toEqual(
            'User input error. config.language must be defined. Please correct this and try again.',
          );
        },
      );
    });
  });

  given('[case4] an error that carries a potential solution', () => {
    when('[t0] the message is read', () => {
      const error = new UserInputError({
        reason: `no config file was found at 'nope.yml'`,
        potentialSolution: 'check the path handed to --config (-c).',
      });

      then(
        'the solution is set apart by a blank line, so it reads as a next step',
        () => {
          expect(error.message).toContain(
            '\n\ncheck the path handed to --config (-c).',
          );
        },
      );

      then('it still carries no subject clause and no `undefined`', () => {
        expect(error.message).not.toContain('undefined');
        expect(error.message).not.toContain('does not meet this criteria');
      });
    });
  });

  given('[case5] a reason that already ends in a period', () => {
    when('[t0] the message is read', () => {
      const error = new UserInputError({
        reason: 'config.dialect must be defined.',
      });

      then('the period is not doubled', () => {
        expect(error.message).toContain(
          'config.dialect must be defined. Please',
        );
        expect(error.message).not.toContain('..');
      });
    });
  });
});
