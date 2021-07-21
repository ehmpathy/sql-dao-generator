import { DomainObjectMetadata } from 'domain-objects-metadata';

export const defineOutputTypeOfFoundDomainObject = (domainObject: DomainObjectMetadata) => {
  const hasUuidProperty = !!domainObject.properties.uuid;
  const outputType = hasUuidProperty ? `HasId<HasUuid<${domainObject.name}>>` : `HasId<${domainObject.name}>`;
  return outputType;
};
