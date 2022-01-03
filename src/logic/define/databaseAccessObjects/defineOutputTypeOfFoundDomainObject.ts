import { DomainObjectMetadata } from 'domain-objects-metadata';

export const defineOutputTypeOfFoundDomainObject = (domainObject: DomainObjectMetadata) => {
  const outputType = `HasMetadata<${domainObject.name}>`;
  return outputType;
};
