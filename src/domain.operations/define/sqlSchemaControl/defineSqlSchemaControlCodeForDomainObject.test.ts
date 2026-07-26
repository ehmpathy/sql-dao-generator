import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '@src/domain.operations/define/sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';

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
        origin: null,
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
        origin: null,
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
        origin: null,
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
        origin: null,
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
  it('should not emit a join table (and not crash) for native primitive and enum arrays', () => {
    // a domain entity with native primitive + enum array columns (the wish's headline case)
    const domainObject = new DomainObjectMetadata({
      name: 'Post',
      extends: DomainObjectVariant.DOMAIN_ENTITY,
      properties: {
        id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
        uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
        tags: {
          name: 'tags',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.STRING },
        },
        scores: {
          name: 'scores',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.NUMBER },
        },
        statuses: {
          name: 'statuses',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.ENUM,
            of: ['ACTIVE', 'PAUSED'],
          },
        },
      },
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        unique: ['uuid'],
        updatable: [],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it — must not throw for the native array columns
    const code = defineSqlSchemaControlCodeForDomainObject({
      sqlSchemaRelationship,
    });

    // the base table + hydrated view are emitted, but NO join table for any native array
    expect(code).toContain('path: ./tables/post.sql');
    expect(code).toContain('path: ./views/view_post_hydrated.sql');
    expect(code).not.toContain('_to_tags');
    expect(code).not.toContain('_to_scores');
    expect(code).not.toContain('_to_statuses');
    expect(code).toMatchSnapshot();
  });
  it('should not emit a join table (and not crash) for updatable native primitive and enum arrays on the version table', () => {
    // a domain entity whose native primitive/enum arrays are UPDATABLE, so they route
    // through the version-table array loop (the exact branch that crashed pre-fix). the
    // presence of an updatable scalar guarantees a version table exists to route them to.
    const domainObject = new DomainObjectMetadata({
      name: 'Post',
      extends: DomainObjectVariant.DOMAIN_ENTITY,
      properties: {
        id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
        uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
        title: { name: 'title', type: DomainObjectPropertyType.STRING },
        tags: {
          name: 'tags',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.STRING },
        },
        statuses: {
          name: 'statuses',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.ENUM,
            of: ['ACTIVE', 'PAUSED'],
          },
        },
      },
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        unique: ['uuid'],
        updatable: ['title', 'tags', 'statuses'],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it — the updatable native arrays must route through the version-table loop without a throw
    const code = defineSqlSchemaControlCodeForDomainObject({
      sqlSchemaRelationship,
    });

    // the version table (and its cvp + current view) are emitted, since there are updatable props
    expect(code).toContain('path: ./tables/post.sql');
    expect(code).toContain('path: ./tables/post_version.sql');
    expect(code).toContain('path: ./tables/post_cvp.sql');
    expect(code).toContain('path: ./views/view_post_current.sql');
    expect(code).toContain('path: ./views/view_post_hydrated.sql');

    // but NO join table for the updatable native arrays — neither on the base nor the version table
    expect(code).not.toContain('_to_tags');
    expect(code).not.toContain('_to_statuses');
    expect(code).toMatchSnapshot();
  });
  it('should not declare a uuid join table for a _uuids-suffix number[] (it is a native array, not a uuid reference)', () => {
    // a _uuids suffix on a non-string array is a native primitive array, not a uuid reference. the
    // shared predicate gates on a string element, so schema-control declares no join table for it —
    // in agreement with the schema-generator, which emits a native numeric[] column. this locks the
    // two layers together so the manifest can not declare a join table the generator never builds
    const domainObject = new DomainObjectMetadata({
      name: 'Post',
      extends: DomainObjectVariant.DOMAIN_ENTITY,
      properties: {
        id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
        uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
        scoreUuids: {
          name: 'scoreUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.NUMBER },
        },
      },
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        unique: ['uuid'],
        updatable: [],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it — the non-string _uuids array must route through the native branch without a throw
    const code = defineSqlSchemaControlCodeForDomainObject({
      sqlSchemaRelationship,
    });

    // the base table is emitted, but NO uuid join table for the number[] named *_uuids
    expect(code).toContain('path: ./tables/post.sql');
    expect(code).not.toContain('_to_score_uuid');
    expect(code).toMatchSnapshot();
  });
});
