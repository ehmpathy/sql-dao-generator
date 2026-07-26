import {
  DomainObjectMetadata,
  DomainObjectVariant,
} from 'domain-objects-metadata';
import { UnexpectedCodePathError } from 'helpful-errors';

export const createExampleDomainObjectMetadata = ({
  extend = DomainObjectVariant.DOMAIN_LITERAL,
}: {
  extend?: DomainObjectVariant;
} = {}) => {
  if (extend === DomainObjectVariant.DOMAIN_LITERAL)
    return new DomainObjectMetadata({
      name: 'ExampleDomainLiteral',
      extends: DomainObjectVariant.DOMAIN_LITERAL,
      properties: {},
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        unique: null,
        updatable: null,
      },
    });

  if (extend === DomainObjectVariant.DOMAIN_ENTITY)
    return new DomainObjectMetadata({
      name: 'ExampleDomainEntity',
      extends: DomainObjectVariant.DOMAIN_LITERAL,
      properties: {},
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        unique: ['uuid'],
        updatable: [],
      },
    });
  if (extend === DomainObjectVariant.DOMAIN_EVENT)
    return new DomainObjectMetadata({
      name: 'ExampleDomainEvent',
      extends: extend,
      properties: {},
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        unique: ['uuid'],
        updatable: null,
      },
    });
  throw new UnexpectedCodePathError(
    'unsupported domain object variant to create example object for',
    { extend },
  );
};
