import { camelCase } from 'change-case';

export const castDomainObjectNameToDaoName = (domainObjectName: string) => `${camelCase(domainObjectName)}Dao`;
