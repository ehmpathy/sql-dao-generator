import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import { defineSqlSchemaControlCodeForDomainObject } from './defineSqlSchemaControlCodeForDomainObject';

describe('defineSqlSchemaControlCodeForDomainObject', () => {
  it('should look right for a simple domain literal', () => {
    // define what we're testing on
    const domainObject = new DomainObjectMetadata({
      name: 'Geocode',
      extends: DomainObjectVariant.DOMAIN_LITERAL,
      properties: {
        latitude: {
          name: 'latitude',
          type: DomainObjectPropertyType.NUMBER,
        },
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
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it
    const code = defineSqlSchemaControlCodeForDomainObject({
      sqlSchemaRelationship,
    });

    // check that it looks right
    expect(code).toContain('path: ./tables/geocode.sql');
    expect(code).toContain('path: ./functions/upsert_geocode.sql');
    expect(code.split('\n').length).toEqual(7); // comment (1), static (2), upsert (2)
    expect(code).toMatchSnapshot();
  });
  it('should look right for a domain object with updatable properties', () => {
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
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it
    const code = defineSqlSchemaControlCodeForDomainObject({
      sqlSchemaRelationship,
    });

    // check that it looks right
    expect(code).toContain('path: ./tables/carriage.sql');
    expect(code).toContain('path: ./tables/carriage_version.sql');
    expect(code).toContain('path: ./tables/carriage_cvp.sql');
    expect(code).toContain('path: ./views/view_carriage_current.sql');
    expect(code).toContain('path: ./functions/upsert_carriage.sql');
    expect(code.split('\n').length).toEqual(13); // comment (1), resources (5x2)
    expect(code).toMatchSnapshot();
  });
  it('should look right for a domain object with static array properties', () => {
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
        sensorUuids: {
          name: 'sensorUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.STRING },
        },
      },
      decorations: {
        alias: null,
        primary: null,
        unique: ['trainUuid', 'occurredAt'],
        updatable: [],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [
        domainObject,
        { name: 'Train', extends: DomainObjectVariant.DOMAIN_ENTITY },
      ] as DomainObjectMetadata[],
    });

    // run it
    const code = defineSqlSchemaControlCodeForDomainObject({
      sqlSchemaRelationship,
    });

    // check that it looks right
    expect(code).toContain('path: ./tables/train_located_event.sql');
    expect(code).toContain('path: ./tables/train_located_event_to_geocode.sql');
    expect(code).toContain(
      'path: ./tables/train_located_event_to_sensor_uuid.sql',
    );
    expect(code).toContain(
      'path: ./views/view_train_located_event_current.sql',
    );
    expect(code).toContain('path: ./functions/upsert_train_located_event.sql');
    expect(code.split('\n').length).toEqual(13); // comment (1), resources (5x2)
    expect(code).toMatchSnapshot();
  });
  it('should look right for a domain object with updatable array properties', () => {
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
        badges: {
          name: 'badges',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Badge',
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
        leadEngineerUuid: {
          name: 'leadEngineerUuid',
          type: DomainObjectPropertyType.STRING,
        },
        sensorUuids: {
          name: 'sensorUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.STRING },
        },
      },
      decorations: {
        alias: null,
        primary: null,
        unique: ['uuid'],
        updatable: ['locomotiveUuids', 'leadEngineerUuid', 'sensorUuids'],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [
        domainObject,
        { name: 'Locomotive', extends: DomainObjectVariant.DOMAIN_ENTITY },
        { name: 'Engineer', extends: DomainObjectVariant.DOMAIN_ENTITY },
      ] as DomainObjectMetadata[],
    });

    // run it
    const code = defineSqlSchemaControlCodeForDomainObject({
      sqlSchemaRelationship,
    });

    // check that it looks right
    expect(code).toContain('path: ./tables/train.sql');
    expect(code).toContain('path: ./tables/train_to_badge.sql');
    expect(code).toContain('path: ./tables/train.sql');
    expect(code).toContain('path: ./tables/train_version_to_locomotive.sql');
    expect(code).toContain('path: ./tables/train_version_to_sensor_uuid.sql');
    expect(code).toContain('path: ./tables/train_cvp.sql');
    expect(code).toContain('path: ./views/view_train_current.sql');
    expect(code).toContain('path: ./functions/upsert_train.sql');
    expect(code.split('\n').length).toEqual(19); // comment (1), resources (8x2)
    expect(code).toMatchSnapshot();
  });
});
