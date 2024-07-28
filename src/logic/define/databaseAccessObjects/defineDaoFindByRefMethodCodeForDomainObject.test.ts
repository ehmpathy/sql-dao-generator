import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import { defineDaoFindByRefMethodCodeForDomainObject } from './defineDaoFindByRefMethodCodeForDomainObject';

describe('defineDaoFindByRefMethodCodeForDomainObject', () => {
  it('should look correct for simple literal', () => {
    // define what we're testing on
    const domainObject = new DomainObjectMetadata({
      name: 'Geocode',
      extends: DomainObjectVariant.DOMAIN_LITERAL,
      properties: {
        id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
        uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
        latitude: { name: 'latitude', type: DomainObjectPropertyType.NUMBER },
        longitude: {
          name: 'longitude',
          type: DomainObjectPropertyType.NUMBER,
        },
      },
      decorations: {
        alias: null,
        primary: null,
        unique: null,
        updatable: null,
      },
    });

    // run it
    const code = defineDaoFindByRefMethodCodeForDomainObject({
      domainObject,
    });

    // log an example
    expect(code).toContain('input: { ref: Ref<typeof Geocode> }');
    expect(code).toMatchSnapshot();
  });
  it('should look correct for simple domain entity', () => {
    // define what we're testing on
    const domainObject = new DomainObjectMetadata({
      name: 'Carriage',
      extends: DomainObjectVariant.DOMAIN_ENTITY,
      properties: {
        id: {
          name: 'id',
          type: DomainObjectPropertyType.NUMBER,
          required: false,
        },
        uuid: {
          name: 'uuid',
          type: DomainObjectPropertyType.STRING,
          required: false,
        },
        cin: {
          name: 'cin',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        carries: {
          name: 'carries',
          type: DomainObjectPropertyType.ENUM,
          of: ['PASSENGER', 'FREIGHT'],
          required: true,
        },
        capacity: {
          name: 'capacity',
          type: DomainObjectPropertyType.NUMBER,
          nullable: true,
        },
      },
      decorations: {
        alias: null,
        primary: null,
        unique: ['cin'],
        updatable: ['capacity'],
      },
    });

    // run it
    const code = defineDaoFindByRefMethodCodeForDomainObject({
      domainObject,
    });

    // log an example
    expect(code).toContain('input: { ref: Ref<typeof Carriage> }');
    expect(code).toMatchSnapshot();
  });
  it('should look correct for a domain event with a static referenced array', () => {
    // define what we're testing on
    const domainObject = new DomainObjectMetadata({
      name: 'TrainLocatedEvent',
      extends: DomainObjectVariant.DOMAIN_EVENT,
      properties: {
        id: {
          name: 'id',
          type: DomainObjectPropertyType.NUMBER,
          required: false,
        },
        trainUuid: {
          name: 'trainUuid',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        occurredAt: {
          name: 'occurredAt',
          type: DomainObjectPropertyType.DATE,
          required: true,
        },
        geocodes: {
          name: 'geocodes',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
          required: true,
        },
      },
      decorations: {
        alias: null,
        primary: null,
        unique: ['trainUuid', 'occurredAt'],
        updatable: [],
      },
    });

    // run it
    const code = defineDaoFindByRefMethodCodeForDomainObject({
      domainObject,
    });

    // log an example
    expect(code).toContain('input: { ref: Ref<typeof TrainLocatedEvent> }');
    expect(code).toMatchSnapshot();
  });
  it('should look correct for domain entity with references, array and solo, implicit and direct', () => {
    // define what we're testing on
    const domainObject = new DomainObjectMetadata({
      name: 'Train',
      extends: DomainObjectVariant.DOMAIN_ENTITY,
      properties: {
        id: {
          name: 'id',
          type: DomainObjectPropertyType.NUMBER,
          required: false,
        },
        uuid: {
          name: 'uuid',
          type: DomainObjectPropertyType.STRING,
          required: false,
        },
        tin: {
          name: 'tin',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        homeStationGeocode: {
          name: 'homeStationGeocode',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'Geocode',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
        leadEngineerUuid: {
          name: 'leadEngineerUuid',
          type: DomainObjectPropertyType.STRING,
        },
        badges: {
          name: 'badges',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'TrainBadge',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
        locomotiveUuids: {
          name: 'locomotiveUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.STRING,
          },
        },
      },
      decorations: {
        alias: null,
        primary: null,
        unique: ['tin'],
        updatable: [
          'homeStation',
          'badges',
          'locomotiveUuids',
          'leadEngineerUuid',
        ],
      },
    });

    // run it
    const code = defineDaoFindByRefMethodCodeForDomainObject({
      domainObject,
    });

    // log an example
    expect(code).toContain('isPrimaryKeyRef({ of: Train })');
    expect(code).toMatchSnapshot();
  });
});
