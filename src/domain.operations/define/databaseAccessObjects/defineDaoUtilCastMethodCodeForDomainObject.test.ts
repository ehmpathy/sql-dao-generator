import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '@src/domain.operations/define/sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';

import { defineDaoUtilCastMethodCodeForDomainObject } from './defineDaoUtilCastMethodCodeForDomainObject';

describe('defineDaoUtilCastMethodCodeForDomainObject', () => {
  it('should look correct for simple literal', () => {
    // define what we're testing on
    const domainObject = new DomainObjectMetadata({
      name: 'Geocode',
      extends: DomainObjectVariant.DOMAIN_LITERAL,
      properties: {
        id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
        latitude: { name: 'latitude', type: DomainObjectPropertyType.NUMBER },
        longitude: { name: 'longitude', type: DomainObjectPropertyType.NUMBER },
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
    const code = defineDaoUtilCastMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    });

    // log an example
    expect(code).toContain("import { Geocode } from '$PATH_TO_DOMAIN_OBJECT'");
    // the upstream row is the strict shape, renamed on `sql-code-generator`'s behalf until `#95`
    expect(code).toContain(
      "import { SqlQueryFindGeocodeByIdOutput as SqlQueryFindGeocodeByIdOutputStrict } from '$PATH_TO_GENERATED_SQL_TYPES';",
    );
    // the union is declared by name, and the cast takes that name
    expect(code).toContain('export type SqlQueryFindGeocodeByIdOutput =');
    expect(code).toContain('| SqlQueryFindGeocodeByIdOutputStrict');
    expect(code).toContain('| SqlQueryFindGeocodeByIdOutputJsoned');
    expect(code).toContain('dbObject: SqlQueryFindGeocodeByIdOutput,');
    // .why = the positive twin of the entity case's negative; a rename reddens here first
    expect(code).toContain('AsJsonFromDbObject');
    expect(code).toContain('new Geocode({');
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
    const code = defineDaoUtilCastMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    });

    // log an example
    expect(code).toContain("import { Carriage } from '$PATH_TO_DOMAIN_OBJECT'");
    expect(code).toContain(
      "import { SqlQueryFindCarriageByIdOutput as SqlQueryFindCarriageByIdOutputStrict } from '$PATH_TO_GENERATED_SQL_TYPES';",
    );
    // an entity is never nested, so it never arrives as json: strict shape alone, no jsoned
    expect(code).toContain(
      'export type { SqlQueryFindCarriageByIdOutputStrict };',
    );
    expect(code).toContain('dbObject: SqlQueryFindCarriageByIdOutputStrict,');
    expect(code).not.toContain('SqlQueryFindCarriageByIdOutputJsoned');
    expect(code).not.toContain('AsJsonFromDbObject');
    expect(code).toContain('new Carriage({');
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
        origin: null,
        alias: null,
        primary: null,
        unique: ['trainUuid', 'occurredAt'],
        updatable: [],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [] as DomainObjectMetadata[],
    });

    // run it
    const code = defineDaoUtilCastMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    });

    // log an example
    expect(code).toContain(
      "import { TrainLocatedEvent } from '$PATH_TO_DOMAIN_OBJECT'",
    );
    // a nester imports the upstream row as its strict shape too. the nested narrow is per-read:
    // in the type, every `findBy*` call site would have to assert `as ...Strict`
    expect(code).toContain(
      "import { SqlQueryFindTrainLocatedEventByIdOutput as SqlQueryFindTrainLocatedEventByIdOutputStrict } from '$PATH_TO_GENERATED_SQL_TYPES';",
    );
    expect(code).not.toContain('Omit<');
    expect(code).not.toContain('SqlQueryFindTrainLocatedEventByIdOutputRaw');
    expect(code).toContain(
      "import { castFromDatabaseObject as castGeocodeFromDatabaseObject, SqlQueryFindGeocodeByIdOutputJsoned } from '../geocodeDao/castFromDatabaseObject';",
    );
    // an event is not a literal, so strict alone; the literal it nests owes its own jsoned shape
    expect(code).toContain(
      'dbObject: SqlQueryFindTrainLocatedEventByIdOutputStrict,',
    );
    expect(code).not.toContain('SqlQueryFindTrainLocatedEventByIdOutputJsoned');
    expect(code).toContain('new TrainLocatedEvent({');
    // no null guard: the sql COALESCEs the `json_agg` to `'[]'::json`
    expect(code).toContain(
      'geocodes: (dbObject.geocodes as SqlQueryFindGeocodeByIdOutputJsoned[]).map(castGeocodeFromDatabaseObject)',
    );
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
        origin: null,
        alias: null,
        primary: null,
        unique: ['tin'],
        updatable: [
          'homeStationGeocode',
          'badges',
          'locomotiveUuids',
          'leadEngineerUuid',
        ],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [
        domainObject,
        { name: 'Locomotive', extends: DomainObjectVariant.DOMAIN_ENTITY },
        { name: 'TrainEngineer', extends: DomainObjectVariant.DOMAIN_ENTITY },
      ] as DomainObjectMetadata[],
    });

    // run it
    const code = defineDaoUtilCastMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    });

    // log an example
    expect(code).toContain("import { Train } from '$PATH_TO_DOMAIN_OBJECT'");
    // each nested literal's jsoned shape is imported from its own dao and used at the read
    expect(code).toContain(
      "import { SqlQueryFindTrainByIdOutput as SqlQueryFindTrainByIdOutputStrict } from '$PATH_TO_GENERATED_SQL_TYPES';",
    );
    expect(code).not.toContain('Omit<');
    expect(code).not.toContain('SqlQueryFindTrainByIdOutputRaw');
    expect(code).toContain(
      "import { castFromDatabaseObject as castGeocodeFromDatabaseObject, SqlQueryFindGeocodeByIdOutputJsoned } from '../geocodeDao/castFromDatabaseObject';",
    );
    expect(code).toContain(
      "import { castFromDatabaseObject as castTrainBadgeFromDatabaseObject, SqlQueryFindTrainBadgeByIdOutputJsoned } from '../trainBadgeDao/castFromDatabaseObject';",
    );
    // an entity takes the strict shape alone; the literals it nests keep their jsoned shapes
    expect(code).toContain('dbObject: SqlQueryFindTrainByIdOutputStrict,');
    expect(code).not.toContain('SqlQueryFindTrainByIdOutputJsoned');
    // the strict shape restates no nested column
    expect(code).not.toContain(
      'home_station_geocode: SqlQueryFindGeocodeByIdOutputJsoned;',
    );
    expect(code).not.toContain(
      'badges: SqlQueryFindTrainBadgeByIdOutputJsoned[];',
    );
    expect(code).toContain('new Train({');
    expect(code).toContain(
      'homeStationGeocode: castGeocodeFromDatabaseObject(dbObject.home_station_geocode as SqlQueryFindGeocodeByIdOutputJsoned)',
    );
    expect(code).toContain('leadEngineerUuid: dbObject.lead_engineer_uuid');
    expect(code).toContain(
      'badges: (dbObject.badges as SqlQueryFindTrainBadgeByIdOutputJsoned[]).map(castTrainBadgeFromDatabaseObject)',
    );
    expect(code).toContain(
      'locomotiveUuids: dbObject.locomotive_uuids as string[]',
    );
    expect(code).toMatchSnapshot();
  });
  it('should look correct when the same dobj is referenced more than once in a dobj', () => {
    // define an entity that references the SAME domain object (Geocode) twice — once as origin,
    // once as destination. the cast method must import castGeocodeFromDatabaseObject exactly once
    // (deduped, not twice) and reuse it for both properties.
    const domainObject = new DomainObjectMetadata({
      name: 'TravelRoute',
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
        originGeocode: {
          name: 'originGeocode',
          type: DomainObjectPropertyType.REFERENCE,
          required: true,
          of: {
            name: 'Geocode',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
        destinationGeocode: {
          name: 'destinationGeocode',
          type: DomainObjectPropertyType.REFERENCE,
          required: true,
          of: {
            name: 'Geocode',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
      },
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        unique: ['originGeocode', 'destinationGeocode'],
        updatable: [],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it
    const code = defineDaoUtilCastMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    });

    // the geocode cast is imported once; counted by split, since `{` is a regex metacharacter
    const geocodeCastImport =
      "import { castFromDatabaseObject as castGeocodeFromDatabaseObject, SqlQueryFindGeocodeByIdOutputJsoned } from '../geocodeDao/castFromDatabaseObject';";
    expect(code.split(geocodeCastImport).length - 1).toEqual(1);

    // both reads cast through it, each narrowed at its own site
    expect(code).not.toContain(
      'origin_geocode: SqlQueryFindGeocodeByIdOutputJsoned;',
    );
    expect(code).toContain(
      'originGeocode: castGeocodeFromDatabaseObject(dbObject.origin_geocode as SqlQueryFindGeocodeByIdOutputJsoned)',
    );
    expect(code).toContain(
      'destinationGeocode: castGeocodeFromDatabaseObject(dbObject.destination_geocode as SqlQueryFindGeocodeByIdOutputJsoned)',
    );
    expect(code).toContain('new TravelRoute({');
    expect(code).toMatchSnapshot();
  });
  it('should look correct for a domain entity which directly declares a reference to another', () => {
    // define what we're testing on
    const domainObject = new DomainObjectMetadata({
      name: 'CarriageCargo',
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
        carriageRef: {
          name: 'carriageRef',
          type: DomainObjectPropertyType.REFERENCE,
          required: true,
          of: {
            name: 'Carriage',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        },
      },
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        unique: ['carriageRef'],
        updatable: [],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it
    const code = defineDaoUtilCastMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    });

    // log an example
    expect(code).toContain(
      "import { CarriageCargo } from '$PATH_TO_DOMAIN_OBJECT'",
    );
    // a declaration-ref selects a `.uuid`, so this dobj nests no other
    expect(code).toContain(
      "import { SqlQueryFindCarriageCargoByIdOutput as SqlQueryFindCarriageCargoByIdOutputStrict } from '$PATH_TO_GENERATED_SQL_TYPES';",
    );
    // strict alone; the ref reads `{ uuid: ... }`, so no nested cast or jsoned shape is imported
    expect(code).toContain(
      'dbObject: SqlQueryFindCarriageCargoByIdOutputStrict,',
    );
    expect(code).not.toContain('SqlQueryFindCarriageCargoByIdOutputJsoned');
    expect(code).not.toContain('castCarriageFromDatabaseObject');
    expect(code).not.toContain('SqlQueryFindCarriageByIdOutputJsoned');
    expect(code).toContain('new CarriageCargo({');
    expect(code).toContain('carriageRef: { uuid: dbObject.carriage_uuid }');
    expect(code).toMatchSnapshot();
  });
  it('should read a NULLABLE declared reference from the same key it null-checks', () => {
    // .why = a guard on `carriage_ref`, a key the row lacks, reads `undefined === null` and never
    //        fires — a null reference then casts to `{ uuid: undefined }`
    const domainObject = new DomainObjectMetadata({
      name: 'CarriageCargo',
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
        carriageRef: {
          name: 'carriageRef',
          type: DomainObjectPropertyType.REFERENCE,
          required: false,
          nullable: true, // <- the whole point
          of: {
            name: 'Carriage',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        },
      },
      decorations: {
        origin: null,
        alias: null,
        primary: null,
        // a nullable property can not serve as a natural key
        unique: ['uuid'],
        updatable: [],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it
    const code = defineDaoUtilCastMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
    });

    // both halves name `carriage_uuid` — the key the generated query actually selects
    expect(code).toContain(
      'carriageRef: dbObject.carriage_uuid === null ? null : { uuid: dbObject.carriage_uuid }',
    );

    // and the key that does NOT exist on the database object appears nowhere
    expect(code).not.toContain('carriage_ref');
    expect(code).toMatchSnapshot();
  });
  describe('primitive and enum arrays', () => {
    it('should cast a non-_uuids primitive string[] array with an "as string[]" assertion', () => {
      // define an entity with a genuine (non-_uuids) primitive string array
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

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // it should assert the domain string[] type on the loose sql-generated element type
      expect(code).toContain('tags: dbObject.tags as string[]');
    });
    it('should short-circuit a NULLABLE primitive string[] array, since `as string[]` asserts non-null too', () => {
      // .why = `as string[]` also asserts non-null. a native `varchar[]` is selected raw and may
      //        be null; the reference arms need no guard, since their sql COALESCEs to `array[]`
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
            nullable: true, // <- the whole point
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

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // the guard must precede the assertion, so null is never declared a string[]
      expect(code).toContain(
        'tags: dbObject.tags === null ? null : dbObject.tags as string[]',
      );

      // the bare assertion must be absent
      expect(code).not.toContain('tags: dbObject.tags as string[]');
    });
    it('should cast an enum[] array with an "as DomainObject[prop]" assertion', () => {
      // define an entity with an enum array
      const domainObject = new DomainObjectMetadata({
        name: 'Post',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
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

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // it should assert the domain enum-array type on the loose sql-generated element type
      expect(code).toContain("statuses: dbObject.statuses as Post['statuses']");
    });
    it('should cast a number[] array elementwise, since each element carries the same divergence its solo form does', () => {
      // a number diverges by path per element, so it is cast per element.
      // note: unreachable end-to-end until sql-schema-generator's ARRAY_OF accepts native primitives
      const domainObject = new DomainObjectMetadata({
        name: 'Post',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          scores: {
            name: 'scores',
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

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // each element goes through the cast
      expect(code).toContain(
        'scores: dbObject.scores.map(asFromDatabase.number)',
      );
      expect(code).not.toContain('scores: dbObject.scores as');
      // and it should import exactly the cast it uses, from the one shared module
      expect(code).toContain(
        "import { asFromDatabase } from '../.generated/casts';",
      );
    });
    it('should cast a Date[] array elementwise, for the same reason', () => {
      // a DATE arrives as a `Date` from a raw column and an iso-8601 string from inside json
      const domainObject = new DomainObjectMetadata({
        name: 'Post',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          editedAtTimes: {
            name: 'editedAtTimes',
            type: DomainObjectPropertyType.ARRAY,
            of: { type: DomainObjectPropertyType.DATE },
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

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      expect(code).toContain(
        'editedAtTimes: dbObject.edited_at_times.map(asFromDatabase.date)',
      );
      // .note = one import serves both casts; `id` is a number, so both are used
      expect(code).toContain(
        "import { asFromDatabase } from '../.generated/casts';",
      );
    });
    it('should short-circuit a NULLABLE cast array on null, before the .map is reached', () => {
      // .why = a nullable array is expressible, and `.map` on null raises a bare `TypeError`
      const domainObject = new DomainObjectMetadata({
        name: 'Post',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          editedAtTimes: {
            name: 'editedAtTimes',
            type: DomainObjectPropertyType.ARRAY,
            of: { type: DomainObjectPropertyType.DATE },
            nullable: true,
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

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // the guard must precede the .map, so null never reaches it
      expect(code).toContain(
        'editedAtTimes: dbObject.edited_at_times === null ? null : dbObject.edited_at_times.map(asFromDatabase.date)',
      );

      // and the unguarded form must be absent
      expect(code).not.toContain(
        'editedAtTimes: dbObject.edited_at_times.map(',
      );
    });
    it('should NOT guard a nullable REFERENCE array, because its sql COALESCEs to an empty array', () => {
      // .why = a native array column is selected raw, so a nullable one arrives null. a reference
      //        array is selected as `COALESCE(array_agg(...), array[]::uuid[])`
      //        (defineQuerySelectExpressionForSqlSchemaProperty.ts), so it arrives `[]`, never null
      const engineer = new DomainObjectMetadata({
        name: 'TrainEngineer',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
        },
        decorations: {
          origin: null,
          alias: null,
          primary: null,
          unique: ['uuid'],
          updatable: [],
        },
      });
      const domainObject = new DomainObjectMetadata({
        name: 'Train',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          trainEngineerUuids: {
            name: 'trainEngineerUuids',
            type: DomainObjectPropertyType.ARRAY,
            of: { type: DomainObjectPropertyType.STRING },
            nullable: true,
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
        allDomainObjects: [domainObject, engineer],
      });

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // the unguarded `as string[]` is CORRECT here — the sql guarantees a non-null array
      expect(code).toContain(
        'trainEngineerUuids: dbObject.train_engineer_uuids as string[]',
      );

      // no null guard: the database can not take that branch
      expect(code).not.toContain('dbObject.train_engineer_uuids === null');
    });
    it('should short-circuit a NULLABLE cast property on null, before the cast is reached', () => {
      // .why = a cast must never see null: `new Date(null)` is the unix epoch, a valid wrong Date
      const domainObject = new DomainObjectMetadata({
        name: 'Post',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          archivedAt: {
            name: 'archivedAt',
            type: DomainObjectPropertyType.DATE,
            nullable: true,
          },
          score: {
            name: 'score',
            type: DomainObjectPropertyType.NUMBER,
            nullable: true,
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

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // it should guard both nullable properties before their cast
      expect(code).toContain(
        'archivedAt: dbObject.archived_at === null ? null : asFromDatabase.date(dbObject.archived_at)',
      );
      expect(code).toContain(
        'score: dbObject.score === null ? null : asFromDatabase.number(dbObject.score)',
      );

      // the non-nullable property stays unguarded, so a blanket guard fails
      expect(code).toContain('id: asFromDatabase.number(dbObject.id)');
      expect(code).not.toContain('dbObject.id === null ? null :');
    });
    it('should not import a cast a dao does not use', () => {
      // imports derive from the same source as the property code
      const domainObject = new DomainObjectMetadata({
        name: 'Post',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          title: { name: 'title', type: DomainObjectPropertyType.STRING },
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

      // run it
      const code = defineDaoUtilCastMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // no declared DATE or NUMBER property, so the casts module is not imported at all
      expect(code).not.toContain('asFromDatabase');
    });
  });
});
