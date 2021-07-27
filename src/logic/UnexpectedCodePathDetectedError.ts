export class UnexpectedCodePathDetectedError extends Error {
  constructor({
    reason,
    domainObjectName,
    domainObjectPropertyName,
  }: {
    reason: string;
    domainObjectName?: string;
    domainObjectPropertyName?: string;
  }) {
    super(
      `
Unexpected code path detected. ${reason}. ref '${domainObjectName}${
        domainObjectPropertyName ? `.${domainObjectPropertyName}` : ''
      }'. This indicates a bug within sql-dao-generator.
    `.trim(),
    );
  }
}
