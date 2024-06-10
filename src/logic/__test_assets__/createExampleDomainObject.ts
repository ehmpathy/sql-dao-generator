import {
  DomainObjectMetadata,
  DomainObjectVariant,
} from 'domain-objects-metadata';

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
        alias: null,
        primary: null,
        unique: ['uuid'],
        updatable: null,
      },
    });
  throw new Error(
    'unsupported domain object variant to create example object for',
  );
};
