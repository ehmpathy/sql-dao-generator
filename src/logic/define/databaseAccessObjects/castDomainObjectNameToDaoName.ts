import { pascalCase } from 'change-case';

export const castDomainObjectNameToDaoName = (domainObjectName: string) =>
  `dao${pascalCase(domainObjectName)}`;
