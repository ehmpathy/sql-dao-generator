import { DomainObjectMetadata, DomainObjectPropertyType, DomainObjectVariant } from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import { defineDaoFindByMethodCodeForDomainObject, FindByQueryType } from './defineDaoFindByMethodCodeForDomainObject';

describe('defineDaoFindByMethodCodeForDomainObject', () => {
  describe('findById', () => {
    it('should look correct for simple value object', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Geocode',
        extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          unique: null,
          updatable: null,
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship],
        findByQueryType: FindByQueryType.ID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_geocode_by_id'); // name of query
      expect(code).toContain('geocode.id,'); // select expressions
      expect(code).toContain('geocode.uuid,');
      expect(code).toContain('geocode.latitude,');
      expect(code).toContain('geocode.longitude'); // last select expression does not have comma
      expect(code).toContain('FROM geocode'); // table to query
      expect(code).toContain('WHERE geocode.id = :id'); // condition
      expect(code).toContain('await sqlQueryFindGeocodeById({');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for simple domain entity', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Carriage',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING, required: false },
          cin: { name: 'cin', type: DomainObjectPropertyType.STRING, required: true },
          carries: {
            name: 'carries',
            type: DomainObjectPropertyType.ENUM,
            of: ['PASSENGER', 'FREIGHT'],
            required: true,
          },
          capacity: { name: 'capacity', type: DomainObjectPropertyType.NUMBER, nullable: true },
        },
        decorations: {
          unique: ['cin'],
          updatable: ['capacity'],
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship],
        findByQueryType: FindByQueryType.ID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_carriage_by_id'); // name of query
      expect(code).toContain('carriage.id,'); // select expressions
      expect(code).toContain('carriage.uuid,');
      expect(code).toContain('carriage.cin,');
      expect(code).toContain('carriage.carries,');
      expect(code).toContain('carriage.capacity');
      expect(code).toContain('FROM view_carriage_current AS carriage'); // table to query (view, in this case)
      expect(code).toContain('WHERE carriage.id = :id'); // condition
      expect(code).toContain('await sqlQueryFindCarriageById({');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for a domain event with a static referenced array', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'TrainLocatedEvent',
        extends: DomainObjectVariant.DOMAIN_EVENT,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          trainUuid: { name: 'trainUuid', type: DomainObjectPropertyType.STRING, required: true },
          occurredAt: { name: 'occurredAt', type: DomainObjectPropertyType.DATE, required: true },
          geocodes: {
            name: 'geocodes',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
              },
            },
            required: true,
          },
        },
        decorations: {
          unique: ['trainUuid', 'occurredAt'],
          updatable: [],
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [] as DomainObjectMetadata[],
      });

      // define property that gets referenced
      const geocodeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship, geocodeSqlSchemaRelationship],
        findByQueryType: FindByQueryType.ID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_train_located_event_by_id'); // name of query
      expect(code).toContain('train_located_event.id,'); // select expressions
      expect(code).toContain('train_located_event.train_uuid,');
      expect(code).toContain('train_located_event.occurred_at,');
      expect(code).toContain(') AS geocodes'); // its a complicated select expression (already has test coverage elsewhere)
      expect(code).toContain('FROM view_train_located_event_current AS train_located_event'); // table to query (view, in this case)
      expect(code).toContain('WHERE train_located_event.id = :id'); // condition
      expect(code).toContain('await sqlQueryFindTrainLocatedEventById(');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for domain entity with references, array and solo, implicit and direct', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Train',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING, required: false },
          tin: { name: 'tin', type: DomainObjectPropertyType.STRING, required: true },
          homeStationGeocode: {
            name: 'homeStationGeocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
            },
          },
          leadEngineerUuid: { name: 'leadEngineerUuid', type: DomainObjectPropertyType.STRING },
          badges: {
            name: 'badges',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'TrainBadge',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          unique: ['tin'],
          updatable: ['homeStation', 'badges', 'locomotiveUuids', 'leadEngineerUuid'],
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
      const geocodeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
      const badgeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainBadge',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
      const locomotiveSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Locomotive',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {}, // domain entity reference, so we dont need to look at properties
          decorations: { unique: ['uuid'], updatable: [] },
        }),
        allDomainObjects: [domainObject],
      });
      const engineerSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {}, // domain entity reference, so we dont need to look at properties
          decorations: { unique: ['uuid'], updatable: [] },
        }),
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          geocodeSqlSchemaRelationship,
          badgeSqlSchemaRelationship,
          locomotiveSqlSchemaRelationship,
          engineerSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.ID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_train_by_id'); // name of query
      expect(code).toContain('train.id,'); // select expressions
      expect(code).toContain('train.uuid,');
      expect(code).toContain('train.tin,');
      expect(code).toContain(') AS home_station_geocode,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS lead_engineer_uuid,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS badges,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS locomotive_uuids'); // complicated select expression (already has test coverage)
      expect(code).toContain('FROM view_train_current AS train'); // table to query (view, in this case)
      expect(code).toContain('WHERE train.id = :id'); // condition
      expect(code).toContain('await sqlQueryFindTrainById(');
      expect(code).toMatchSnapshot();
    });
  });
  describe('findByUuid', () => {
    it('should look correct for simple value object', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Geocode',
        extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          unique: null,
          updatable: null,
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship],
        findByQueryType: FindByQueryType.UUID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_geocode_by_uuid'); // name of query
      expect(code).toContain('geocode.id,'); // select expressions
      expect(code).toContain('geocode.uuid,');
      expect(code).toContain('geocode.latitude,');
      expect(code).toContain('geocode.longitude'); // last select expression does not have comma
      expect(code).toContain('FROM geocode'); // table to query
      expect(code).toContain('WHERE geocode.uuid = :uuid'); // condition
      expect(code).toContain('await sqlQueryFindGeocodeByUuid({');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for simple domain entity', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Carriage',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING, required: false },
          cin: { name: 'cin', type: DomainObjectPropertyType.STRING, required: true },
          carries: {
            name: 'carries',
            type: DomainObjectPropertyType.ENUM,
            of: ['PASSENGER', 'FREIGHT'],
            required: true,
          },
          capacity: { name: 'capacity', type: DomainObjectPropertyType.NUMBER, nullable: true },
        },
        decorations: {
          unique: ['cin'],
          updatable: ['capacity'],
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship],
        findByQueryType: FindByQueryType.UUID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_carriage_by_uuid'); // name of query
      expect(code).toContain('carriage.id,'); // select expressions
      expect(code).toContain('carriage.uuid,');
      expect(code).toContain('carriage.cin,');
      expect(code).toContain('carriage.carries,');
      expect(code).toContain('carriage.capacity');
      expect(code).toContain('FROM view_carriage_current AS carriage'); // table to query (view, in this case)
      expect(code).toContain('WHERE carriage.uuid = :uuid'); // condition
      expect(code).toContain('await sqlQueryFindCarriageByUuid({');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for a domain event with a static referenced array', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'TrainLocatedEvent',
        extends: DomainObjectVariant.DOMAIN_EVENT,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          trainUuid: { name: 'trainUuid', type: DomainObjectPropertyType.STRING, required: true },
          occurredAt: { name: 'occurredAt', type: DomainObjectPropertyType.DATE, required: true },
          geocodes: {
            name: 'geocodes',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
              },
            },
            required: true,
          },
        },
        decorations: {
          unique: ['trainUuid', 'occurredAt'],
          updatable: [],
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [] as DomainObjectMetadata[],
      });

      // define property that gets referenced
      const geocodeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship, geocodeSqlSchemaRelationship],
        findByQueryType: FindByQueryType.UUID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_train_located_event_by_uuid'); // name of query
      expect(code).toContain('train_located_event.id,'); // select expressions
      expect(code).toContain('train_located_event.train_uuid,');
      expect(code).toContain('train_located_event.occurred_at,');
      expect(code).toContain(') AS geocodes'); // its a complicated select expression (already has test coverage elsewhere)
      expect(code).toContain('FROM view_train_located_event_current AS train_located_event'); // table to query (view, in this case)
      expect(code).toContain('WHERE train_located_event.uuid = :uuid'); // condition
      expect(code).toContain('await sqlQueryFindTrainLocatedEventByUuid(');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for domain entity with references, array and solo, implicit and direct', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Train',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING, required: false },
          tin: { name: 'tin', type: DomainObjectPropertyType.STRING, required: true },
          homeStationGeocode: {
            name: 'homeStationGeocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
            },
          },
          leadEngineerUuid: { name: 'leadEngineerUuid', type: DomainObjectPropertyType.STRING },
          badges: {
            name: 'badges',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'TrainBadge',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          unique: ['tin'],
          updatable: ['homeStation', 'badges', 'locomotiveUuids', 'leadEngineerUuid'],
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
      const geocodeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
      const badgeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainBadge',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
      const locomotiveSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Locomotive',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {}, // domain entity reference, so we dont need to look at properties
          decorations: { unique: ['uuid'], updatable: [] },
        }),
        allDomainObjects: [domainObject],
      });
      const engineerSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {}, // domain entity reference, so we dont need to look at properties
          decorations: { unique: ['uuid'], updatable: [] },
        }),
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          geocodeSqlSchemaRelationship,
          badgeSqlSchemaRelationship,
          locomotiveSqlSchemaRelationship,
          engineerSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.UUID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_train_by_uuid'); // name of query
      expect(code).toContain('train.id,'); // select expressions
      expect(code).toContain('train.uuid,');
      expect(code).toContain('train.tin,');
      expect(code).toContain(') AS home_station_geocode,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS lead_engineer_uuid,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS badges,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS locomotive_uuids'); // complicated select expression (already has test coverage)
      expect(code).toContain('FROM view_train_current AS train'); // table to query (view, in this case)
      expect(code).toContain('WHERE train.uuid = :uuid'); // condition
      expect(code).toContain('await sqlQueryFindTrainByUuid(');
      expect(code).toMatchSnapshot();
    });
  });
  describe('findByUnique', () => {
    it('should look correct for simple value object', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Geocode',
        extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          unique: null,
          updatable: null,
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain('-- query_name = find_geocode_by_unique'); // name of query
      expect(code).toContain('geocode.id,'); // select expressions
      expect(code).toContain('geocode.uuid,');
      expect(code).toContain('geocode.latitude,');
      expect(code).toContain('geocode.longitude'); // last select expression does not have comma
      expect(code).toContain('FROM geocode'); // table to query
      expect(code).toContain('WHERE 1=1'); // condition
      expect(code).toContain('  AND geocode.latitude = :latitude'); // condition
      expect(code).toContain('  AND geocode.longitude = :longitude'); // condition
      expect(code).toContain(
        `
async ({
  dbConnection,
  latitude,
  longitude,
}: {
  dbConnection: DatabaseConnection;
  latitude: number;
  longitude: number;
}): Promise<HasId<Geocode> | null> =>
        `.trim(),
      );
      expect(code).toContain('await sqlQueryFindGeocodeByUnique({');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for simple domain entity', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Carriage',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING, required: false },
          cin: { name: 'cin', type: DomainObjectPropertyType.STRING, required: true },
          carries: {
            name: 'carries',
            type: DomainObjectPropertyType.ENUM,
            of: ['PASSENGER', 'FREIGHT'],
            required: true,
          },
          capacity: { name: 'capacity', type: DomainObjectPropertyType.NUMBER, nullable: true },
        },
        decorations: {
          unique: ['cin'],
          updatable: ['capacity'],
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain('-- query_name = find_carriage_by_unique'); // name of query
      expect(code).toContain('carriage.id,'); // select expressions
      expect(code).toContain('carriage.uuid,');
      expect(code).toContain('carriage.cin,');
      expect(code).toContain('carriage.carries,');
      expect(code).toContain('carriage.capacity');
      expect(code).toContain('FROM view_carriage_current AS carriage'); // table to query (view, in this case)
      expect(code).toContain('WHERE 1=1'); // condition
      expect(code).toContain('  AND carriage.cin = :cin'); // condition
      expect(code).toContain(
        `
async ({
  dbConnection,
  cin,
}: {
  dbConnection: DatabaseConnection;
  cin: string;
})
      `.trim(),
      );
      expect(code).toContain('await sqlQueryFindCarriageByUnique({');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for a domain event with a static referenced array', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'TrainLocatedEvent',
        extends: DomainObjectVariant.DOMAIN_EVENT,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          trainUuid: { name: 'trainUuid', type: DomainObjectPropertyType.STRING, required: true },
          occurredAt: { name: 'occurredAt', type: DomainObjectPropertyType.DATE, required: true },
          geocodes: {
            name: 'geocodes',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
              },
            },
            required: true,
          },
        },
        decorations: {
          unique: ['trainUuid', 'occurredAt'],
          updatable: [],
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [] as DomainObjectMetadata[],
      });

      // define property that gets referenced
      const geocodeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [sqlSchemaRelationship, geocodeSqlSchemaRelationship],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain('-- query_name = find_train_located_event_by_unique'); // name of query
      expect(code).toContain('train_located_event.id,'); // select expressions
      expect(code).toContain('train_located_event.train_uuid,');
      expect(code).toContain('train_located_event.occurred_at,');
      expect(code).toContain(') AS geocodes'); // its a complicated select expression (already has test coverage elsewhere)
      expect(code).toContain('FROM view_train_located_event_current AS train_located_event'); // table to query (view, in this case)
      expect(code).toContain('WHERE 1=1'); // condition
      expect(code).toContain('  AND train_located_event.train_uuid = :trainUuid'); // condition
      expect(code).toContain('  AND train_located_event.occurred_at = :occurredAt'); // condition
      expect(code).toContain(
        `
async ({
  dbConnection,
  trainUuid,
  occurredAt,
}: {
  dbConnection: DatabaseConnection;
  trainUuid: string;
  occurredAt: Date;
})
        `.trim(),
      );
      expect(code).toContain('await sqlQueryFindTrainLocatedEventByUnique(');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for domain entity with references, array and solo, implicit and direct', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Train',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING, required: false },
          tin: { name: 'tin', type: DomainObjectPropertyType.STRING, required: true },
          homeStationGeocode: {
            name: 'homeStationGeocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
            },
          },
          leadEngineerUuid: { name: 'leadEngineerUuid', type: DomainObjectPropertyType.STRING },
          badges: {
            name: 'badges',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'TrainBadge',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          unique: ['tin'],
          updatable: ['homeStation', 'badges', 'locomotiveUuids', 'leadEngineerUuid'],
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
      const geocodeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
      const badgeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainBadge',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
      const locomotiveSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Locomotive',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {}, // domain entity reference, so we dont need to look at properties
          decorations: { unique: ['uuid'], updatable: [] },
        }),
        allDomainObjects: [domainObject],
      });
      const engineerSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {}, // domain entity reference, so we dont need to look at properties
          decorations: { unique: ['uuid'], updatable: [] },
        }),
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          geocodeSqlSchemaRelationship,
          badgeSqlSchemaRelationship,
          locomotiveSqlSchemaRelationship,
          engineerSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain('-- query_name = find_train_by_unique'); // name of query
      expect(code).toContain('train.id,'); // select expressions
      expect(code).toContain('train.uuid,');
      expect(code).toContain('train.tin,');
      expect(code).toContain(') AS home_station_geocode,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS lead_engineer_uuid,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS badges,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS locomotive_uuids'); // complicated select expression (already has test coverage)
      expect(code).toContain('FROM view_train_current AS train'); // table to query (view, in this case)
      expect(code).toContain(
        `
  WHERE 1=1
    AND train.tin = :tin
        `.trim(),
      ); // condition
      expect(code).toContain('await sqlQueryFindTrainByUnique(');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for domain entity that is unique on references, solo and array, implicit and nested', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Train',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER, required: false },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING, required: false },
          tin: { name: 'tin', type: DomainObjectPropertyType.STRING, required: true },
          homeStationGeocode: {
            name: 'homeStationGeocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
            },
          },
          leadEngineerUuid: { name: 'leadEngineerUuid', type: DomainObjectPropertyType.STRING },
          badges: {
            name: 'badges',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'TrainBadge',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          unique: ['homeStationGeocode', 'badges', 'locomotiveUuids', 'leadEngineerUuid'],
          updatable: [],
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
      const geocodeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
      const badgeSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainBadge',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            unique: null,
            updatable: null,
          },
        }),
        allDomainObjects: [domainObject],
      });
      const locomotiveSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'Locomotive',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {}, // domain entity reference, so we dont need to look at properties
          decorations: { unique: ['uuid'], updatable: [] },
        }),
        allDomainObjects: [domainObject],
      });
      const engineerSqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {}, // domain entity reference, so we dont need to look at properties
          decorations: { unique: ['uuid'], updatable: [] },
        }),
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          geocodeSqlSchemaRelationship,
          badgeSqlSchemaRelationship,
          locomotiveSqlSchemaRelationship,
          engineerSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain('-- query_name = find_train_by_unique'); // name of query
      expect(code).toContain('train.id,'); // select expressions
      expect(code).toContain('train.uuid,');
      expect(code).toContain('train.tin,');
      expect(code).toContain(') AS home_station_geocode,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS lead_engineer_uuid,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS badges,'); // complicated select expression (already has test coverage)
      expect(code).toContain(') AS locomotive_uuids'); // complicated select expression (already has test coverage)
      expect(code).toContain('FROM view_train_current AS train'); // table to query (view, in this case)
      expect(code).toContain(
        `
  WHERE 1=1
    AND train.home_station_geocode_id = :homeStationGeocodeId
    AND train.badge_ids = :badgeIds
    AND train.locomotive_ids = (
      SELECT COALESCE(array_agg(locomotive.id ORDER BY locomotive_ref.array_order_index), array[]::bigint[]) AS array_agg
      FROM locomotive
      JOIN unnest(:locomotiveUuids::uuid[]) WITH ORDINALITY
        AS locomotive_ref (uuid, array_order_index)
        ON locomotive.uuid = locomotive_ref.uuid
    )
    AND train.lead_engineer_id = (SELECT id FROM train_engineer WHERE train_engineer.uuid = :leadEngineerUuid);
        `.trim(),
      ); // condition
      expect(code).toContain(
        `
async ({
  dbConnection,
  homeStationGeocode,
  badges,
  locomotiveUuids,
  leadEngineerUuid,
}: {
  dbConnection: DatabaseConnection;
  homeStationGeocode: HasId<Geocode>;
  badges: HasId<TrainBadge>[];
  locomotiveUuids: string[];
  leadEngineerUuid: string;
}): Promise<HasId<HasUuid<Train>> | null> =>
      `.trim(),
      );
      expect(code).toContain('await sqlQueryFindTrainByUnique(');
      expect(code).toMatchSnapshot();
    });
  });
});
