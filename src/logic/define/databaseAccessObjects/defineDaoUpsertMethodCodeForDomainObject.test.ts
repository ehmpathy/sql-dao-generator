import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import { defineDaoUpsertMethodCodeForDomainObject } from './defineDaoUpsertMethodCodeForDomainObject';

describe('defineDaoUpsertMethodCodeForDomainObject', () => {
  it('should look correct for simple literal', () => {
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
    const code = defineDaoUpsertMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: [sqlSchemaRelationship],
    });

    // log an example
    expect(code).toContain('-- query_name = upsert_geocode'); // name of query
    expect(code).toContain(
      `
  FROM upsert_geocode(
    :latitude,
    :longitude
  )
    `.trim(),
    ); // calls upsert correctly
    expect(code).toContain(
      `
export const upsert = async (
  {
    geocode,
  }: {
    geocode: Geocode;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Geocode>>
      `.trim(),
    ); // defines fn correctly
    expect(code).toContain('await sqlQueryUpsertGeocode({');
    expect(code).toContain(
      `
    input: {
      latitude: geocode.latitude,
      longitude: geocode.longitude,
    }
      `.trim(),
    ); // defines inputs correctly
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
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it
    const code = defineDaoUpsertMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: [sqlSchemaRelationship],
    });

    // log an example
    expect(code).toContain('-- query_name = upsert_carriage'); // name of query
    expect(code).toContain(
      `
  FROM upsert_carriage(
    :cin,
    :carries,
    :capacity
  )
    `.trim(),
    ); // calls upsert correctly
    expect(code).toContain(
      `
async (
  {
    carriage,
  }: {
    carriage: Carriage;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Carriage>>
      `.trim(),
    ); // defines fn correctly
    expect(code).toContain('await sqlQueryUpsertCarriage({');
    expect(code).toContain(
      `
    input: {
      cin: carriage.cin,
      carries: carriage.carries,
      capacity: carriage.capacity,
    }
      `.trim(),
    ); // defines inputs correctly
    expect(code).toMatchSnapshot();
  });
  it('should look correct for a simple domain entity with a custom alias', () => {
    // define what we're testing on
    const domainObject = new DomainObjectMetadata({
      name: 'AsyncTaskGrantWish',
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
        exid: {
          name: 'exid',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
      },
      decorations: {
        alias: 'task',
        primary: null,
        unique: ['exid'],
        updatable: [],
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });

    // run it
    const code = defineDaoUpsertMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: [sqlSchemaRelationship],
    });

    // log an example
    expect(code).toContain('-- query_name = upsert_async_task_grant_wish'); // name of query
    expect(code).toContain(
      `
  FROM upsert_async_task_grant_wish(
    `.trim(),
    ); // calls upsert correctly
    expect(code).toContain(
      `
async (
  {
    task,
  }: {
    task: AsyncTaskGrantWish;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<AsyncTaskGrantWish>>
      `.trim(),
    ); // defines fn correctly
    expect(code).toContain('await sqlQueryUpsertAsyncTaskGrantWish');
    expect(code).toMatchSnapshot();
  });
  it('should return the exact autogenerated values that were defined on the domain entity', () => {
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
        effectiveAt: {
          name: 'effectiveAt',
          type: DomainObjectPropertyType.DATE,
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
    const code = defineDaoUpsertMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: [sqlSchemaRelationship],
    });

    // log an example
    expect(code).toContain('-- query_name = upsert_carriage'); // name of query
    expect(code).toContain('dgv.id, dgv.uuid, dgv.effective_at'); // name of query
    expect(code).toContain(
      `
  FROM upsert_carriage(
    :cin,
    :carries,
    :capacity
  )
    `.trim(),
    ); // calls upsert correctly
    expect(code).toContain(
      `
async (
  {
    carriage,
  }: {
    carriage: Carriage;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Carriage>>
      `.trim(),
    ); // defines fn correctly
    expect(code).toContain('await sqlQueryUpsertCarriage({');
    expect(code).toContain(
      `
    input: {
      cin: carriage.cin,
      carries: carriage.carries,
      capacity: carriage.capacity,
    }
      `.trim(),
    ); // defines inputs correctly
    expect(code).toContain('id, uuid, effective_at: effectiveAt');
    expect(code).toContain(
      'return new Carriage({ ...carriage, id, uuid, effectiveAt })',
    );
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
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [] as DomainObjectMetadata[],
    });

    // define property that gets referenced
    const geocodeSqlSchemaRelationship =
      defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
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
        }),
        allDomainObjects: [domainObject],
      });

    // run it
    const code = defineDaoUpsertMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: [
        sqlSchemaRelationship,
        geocodeSqlSchemaRelationship,
      ],
    });

    // log an example
    expect(code).toContain('-- query_name = upsert_train_located_event'); // name of query
    expect(code).toContain(
      `
  FROM upsert_train_located_event(
    :trainUuid,
    :occurredAt,
    :geocodeIds
  )
    `.trim(),
    ); // calls upsert correctly
    expect(code).toContain(
      `
async (
  {
    trainLocatedEvent,
  }: {
    trainLocatedEvent: TrainLocatedEvent;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<TrainLocatedEvent>>
      `.trim(),
    ); // defines fn correctly
    expect(code).toContain('await sqlQueryUpsertTrainLocatedEvent({');
    expect(code).toContain(
      `
    input: {
      trainUuid: trainLocatedEvent.trainUuid,
      occurredAt: trainLocatedEvent.occurredAt,
      geocodeIds: await Promise.all(trainLocatedEvent.geocodes.map(async (geocode) => geocode.id ? geocode.id : (await geocodeDao.upsert({ geocode }, context)).id)),
    }
      `.trim(),
    ); // defines inputs correctly
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
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [
        domainObject,
        { name: 'Locomotive', extends: DomainObjectVariant.DOMAIN_ENTITY },
        { name: 'TrainEngineer', extends: DomainObjectVariant.DOMAIN_ENTITY },
      ] as DomainObjectMetadata[],
    });

    // define property that gets referenced
    const geocodeSqlSchemaRelationship =
      defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
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
        }),
        allDomainObjects: [domainObject],
      });
    const badgeSqlSchemaRelationship =
      defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainBadge',
          extends: DomainObjectVariant.DOMAIN_LITERAL,
          properties: {
            name: {
              name: 'name',
              type: DomainObjectPropertyType.STRING,
            },
            description: {
              name: 'description',
              type: DomainObjectPropertyType.STRING,
            },
            rank: {
              name: 'rank',
              type: DomainObjectPropertyType.ENUM,
              of: ['GOLD', 'SILVER', 'BRONZE'],
            },
          },
          decorations: {
            alias: null,
            primary: null,
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
    const locomotiveSqlSchemaRelationship =
      defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Locomotive',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {
            uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          },
          decorations: {
            alias: null,
            primary: null,
            unique: ['uuid'],
            updatable: [],
          },
        }),
        allDomainObjects: [domainObject],
      });
    const engineerSqlSchemaRelationship =
      defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {
            uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          }, // domain entity reference, so we dont need to look at properties
          decorations: {
            alias: null,
            primary: null,
            unique: ['uuid'],
            updatable: [],
          },
        }),
        allDomainObjects: [domainObject],
      });

    // run it
    const code = defineDaoUpsertMethodCodeForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: [
        sqlSchemaRelationship,
        geocodeSqlSchemaRelationship,
        badgeSqlSchemaRelationship,
        locomotiveSqlSchemaRelationship,
        engineerSqlSchemaRelationship,
      ],
    });

    // log an example
    expect(code).toContain('-- query_name = upsert_train'); // name of query
    expect(code).toContain(
      `
  FROM upsert_train(
    :tin,
    :homeStationGeocodeId,
    (SELECT id FROM train_engineer WHERE train_engineer.uuid = :leadEngineerUuid),
    :badgeIds,
    (
      SELECT COALESCE(array_agg(locomotive.id ORDER BY locomotive_ref.array_order_index), array[]::bigint[]) AS array_agg
      FROM locomotive
      JOIN unnest(:locomotiveUuids::uuid[]) WITH ORDINALITY
        AS locomotive_ref (uuid, array_order_index)
        ON locomotive.uuid = locomotive_ref.uuid
    )
  )
    `.trim(),
    ); // calls upsert correctly
    expect(code).toContain(
      `
async (
  {
    train,
  }: {
    train: Train;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Train>>
      `.trim(),
    ); // defines fn correctly
    expect(code).toContain('await sqlQueryUpsertTrain({');
    expect(code).toContain(
      `
    input: {
      tin: train.tin,
      homeStationGeocodeId: train.homeStationGeocode.id ? train.homeStationGeocode.id : (await geocodeDao.upsert({ geocode: train.homeStationGeocode }, context)).id,
      leadEngineerUuid: train.leadEngineerUuid,
      badgeIds: await Promise.all(train.badges.map(async (trainBadge) => trainBadge.id ? trainBadge.id : (await trainBadgeDao.upsert({ trainBadge }, context)).id)),
      locomotiveUuids: train.locomotiveUuids,
    }
      `.trim(),
    ); // defines inputs correctly
    expect(code).toMatchSnapshot();
  });
});
