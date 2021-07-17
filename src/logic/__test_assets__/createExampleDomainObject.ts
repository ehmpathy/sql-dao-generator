import { DomainObjectMetadata, DomainObjectVariant } from 'domain-objects-metadata';

export const createExampleDomainObjectMetadata = ({
  extend = DomainObjectVariant.DOMAIN_VALUE_OBJECT,
}: {
  extend?: DomainObjectVariant;
} = {}) => {
  if (extend === DomainObjectVariant.DOMAIN_VALUE_OBJECT)
    return new DomainObjectMetadata({
      name: 'ExampleDomainValueObject',
      extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
      properties: {},
      decorations: { unique: null, updatable: null },
    });

  if (extend === DomainObjectVariant.DOMAIN_ENTITY)
    return new DomainObjectMetadata({
      name: 'ExampleDomainEntity',
      extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
      properties: {},
      decorations: { unique: ['uuid'], updatable: [] },
    });
  if (extend === DomainObjectVariant.DOMAIN_EVENT)
    return new DomainObjectMetadata({
      name: 'ExampleDomainEvent',
      extends: extend,
      properties: {},
      decorations: { unique: ['uuid'], updatable: null },
    });
  throw new Error('unsupported domain object variant to create example object for');
};
