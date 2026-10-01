/**
 * .what = an error raised when the input a human supplied can not be honored
 * .why  = it names the fix, rather than only the symptom
 * .note = the subject clause is omitted when no subject was supplied, so a config-level guard
 *         never renders the word `undefined`
 */
export class UserInputError extends Error {
  constructor({
    reason,
    domainObjectName,
    domainObjectPropertyName,
    potentialSolution,
  }: {
    reason: string;
    domainObjectName?: string;
    domainObjectPropertyName?: string;
    potentialSolution?: string;
  }) {
    const subject = domainObjectName
      ? `'${domainObjectName}${
          domainObjectPropertyName ? `.${domainObjectPropertyName}` : ''
        }' does not meet this criteria.`
      : null;
    super(
      [
        `User input error. ${reason.replace(/\.$/, '')}.`,
        subject,
        'Please correct this and try again.',
      ]
        .filter((part): part is string => !!part)
        .join(' ') + (potentialSolution ? `\n\n${potentialSolution}` : ''),
    );
  }
}
