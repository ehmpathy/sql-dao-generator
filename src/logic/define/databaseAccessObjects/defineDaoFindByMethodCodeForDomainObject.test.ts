import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import {
  defineDaoFindByMethodCodeForDomainObject,
  FindByQueryType,
} from './defineDaoFindByMethodCodeForDomainObject';

describe('defineDaoFindByMethodCodeForDomainObject', () => {
  describe('findById', () => {
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
      expect(code).toContain('FROM view_geocode_hydrated AS geocode'); // table to query
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
      expect(code).toContain('FROM view_carriage_hydrated AS carriage'); // table to query (view, in this case)
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
              id: {
                name: 'id',
                type: DomainObjectPropertyType.NUMBER,
                required: false,
              },
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
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          geocodeSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.ID,
      });

      // log an example
      expect(code).toContain('-- query_name = find_train_located_event_by_id'); // name of query
      expect(code).toContain('train_located_event.id,'); // select expressions
      expect(code).toContain('train_located_event.train_uuid,');
      expect(code).toContain('train_located_event.occurred_at,');
      expect(code).toContain('geocodes');
      expect(code).toContain(
        'FROM view_train_located_event_hydrated AS train_located_event',
      ); // table to query (view, in this case)
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
              id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
              uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
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
      expect(code).toContain('home_station_geocode,');
      expect(code).toContain('lead_engineer_uuid,');
      expect(code).toContain('badges,');
      expect(code).toContain('locomotive_uuids');
      expect(code).toContain('FROM view_train_hydrated AS train'); // table to query (view, in this case)
      expect(code).toContain('WHERE train.id = :id'); // condition
      expect(code).toContain('await sqlQueryFindTrainById(');
      expect(code).toMatchSnapshot();
    });
  });
  describe('findByUuid', () => {
    it('should look correct for simple literal', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Geocode',
        extends: DomainObjectVariant.DOMAIN_LITERAL,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
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
      expect(code).toContain('geocode.latitude,');
      expect(code).toContain('geocode.longitude'); // last select expression does not have comma
      expect(code).toContain('FROM view_geocode_hydrated AS geocode'); // table to query
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
      expect(code).toContain('FROM view_carriage_hydrated AS carriage'); // table to query (view, in this case)
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
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          geocodeSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.UUID,
      });

      // log an example
      expect(code).toContain(
        '-- query_name = find_train_located_event_by_uuid',
      ); // name of query
      expect(code).toContain('train_located_event.id,'); // select expressions
      expect(code).toContain('train_located_event.train_uuid,');
      expect(code).toContain('train_located_event.occurred_at,');
      expect(code).toContain('geocodes');
      expect(code).toContain(
        'FROM view_train_located_event_hydrated AS train_located_event',
      ); // table to query (view, in this case)
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
      expect(code).toContain('home_station_geocode,');
      expect(code).toContain('lead_engineer_uuid,');
      expect(code).toContain('badges,');
      expect(code).toContain('locomotive_uuids');
      expect(code).toContain('FROM view_train_hydrated AS train'); // table to query (view, in this case)
      expect(code).toContain('WHERE train.uuid = :uuid'); // condition
      expect(code).toContain('await sqlQueryFindTrainByUuid(');
      expect(code).toMatchSnapshot();
    });
  });
  describe('findByUnique', () => {
    it('should look correct for simple literal', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Geocode',
        extends: DomainObjectVariant.DOMAIN_LITERAL,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
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
      expect(code).toContain('geocode.latitude,');
      expect(code).toContain('geocode.longitude'); // last select expression does not have comma
      expect(code).toContain('FROM view_geocode_hydrated AS geocode'); // table to query
      expect(code).toContain('WHERE 1=1'); // condition
      expect(code).toContain('  AND geocode.latitude = :latitude'); // condition
      expect(code).toContain('  AND geocode.longitude = :longitude'); // condition
      expect(code).toContain(
        `
async (
  {
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Geocode> | null> =>
        `.trim(),
      );
      expect(code).toContain('await sqlQueryFindGeocodeByUnique({');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for simple literal that references another literal', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'InvoiceLineItem',
        extends: DomainObjectVariant.DOMAIN_LITERAL,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          price: {
            name: 'price',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              extends: DomainObjectVariant.DOMAIN_LITERAL,
              name: 'Price',
            },
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

      // define referenced domain object
      const priceSqlSchemaRelationship =
        defineSqlSchemaRelationshipForDomainObject({
          domainObject: new DomainObjectMetadata({
            name: 'Price',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
            properties: {
              id: {
                name: 'id',
                type: DomainObjectPropertyType.NUMBER,
                required: false,
              },
              amount: { name: 'amount', type: DomainObjectPropertyType.NUMBER },
              currency: {
                name: 'currency',
                type: DomainObjectPropertyType.STRING,
              },
            },
            decorations: {
              alias: null,
              primary: null,
              unique: null,
              updatable: null,
            },
          }),
          allDomainObjects: [],
        });

      // run it
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          priceSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain(
        "import { InvoiceLineItem, Price } from '$PATH_TO_DOMAIN_OBJECT';",
      ); // its should import price, since its nested
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
      expect(code).toContain('FROM view_carriage_hydrated AS carriage'); // table to query (view, in this case)
      expect(code).toContain('WHERE 1=1'); // condition
      expect(code).toContain('  AND carriage.cin = :cin'); // condition
      expect(code).toContain(
        `
async (
  {
    cin,
  }: {
    cin: string;
  },
  context:
      `.trim(),
      );
      expect(code).toContain('await sqlQueryFindCarriageByUnique({');
      expect(code).toMatchSnapshot();
    });
    it('should look correct for simple domain entity unique only on uuid', () => {
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
          unique: ['uuid'],
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
      expect(code).toContain('carriage.carries,');
      expect(code).toContain('carriage.capacity');
      expect(code).toContain('FROM view_carriage_hydrated AS carriage'); // table to query (view, in this case)
      expect(code).toContain('WHERE 1=1'); // condition
      expect(code).toContain('  AND carriage.uuid = :uuid'); // condition
      expect(code).toContain(
        `
async (
  {
    uuid,
  }: {
    uuid: string;
  },
  context:
      `.trim(),
      );
      expect(code).toContain('await sqlQueryFindCarriageByUnique({');
      expect(code).toMatchSnapshot();
    });
    it('should look for a domain entity unique on a nested domain object', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Station',
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
          station: {
            name: 'geocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              extends: DomainObjectVariant.DOMAIN_LITERAL,
              name: 'Geocode',
            },
          },
          name: {
            name: 'name',
            type: DomainObjectPropertyType.STRING,
            nullable: true,
          },
        },
        decorations: {
          alias: null,
          primary: null,
          unique: ['geocode'],
          updatable: ['name'],
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
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
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          geocodeSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain('-- query_name = find_station_by_unique'); // name of query
      expect(code).toContain('station.id,'); // select expressions
      expect(code).toContain('station.uuid,');
      expect(code).toContain('geocode,'); // should select the hydratable literal
      expect(code).toContain('station.name');
      expect(code).toContain('FROM view_station_hydrated AS station'); // table to query (view, in this case)
      expect(code).toContain('WHERE 1=1'); // condition
      expect(code).toContain(
        '  AND view_station_current.geocode_id = :geocodeId',
      ); // condition
      expect(code).toContain(
        `
async (
  {
    geocode,
  }: {
    geocode: Geocode;
  },
  context
      `.trim(),
      );
      expect(code).toContain('await sqlQueryFindStationByUnique({');
      expect(code).toMatchSnapshot();
    });

    it('should look correct for a domain entity unique on a directly declared reference to another domain object', () => {
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

      // define property that gets referenced
      const geocodeSqlSchemaRelationship =
        defineSqlSchemaRelationshipForDomainObject({
          domainObject: new DomainObjectMetadata({
            name: 'Carriage',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
            properties: {
              uuid: {
                name: 'uuid',
                type: DomainObjectPropertyType.STRING,
              },
            },
            decorations: {
              alias: null,
              primary: ['uuid'],
              unique: ['uuid'],
              updatable: [],
            },
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
        ],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain('import { Carriage, '); // should include the directly declared referenced dobj
      expect(code).toContain('import { carriageDao '); // should include the referenced dao too
      expect(code).toContain('import { isPrimaryKeyRef }'); // should include the utility too
      expect(code).toContain('-- query_name = find_carriage_cargo_by_unique'); // name of query
      expect(code).toContain('carriage_cargo.id,'); // select expressions
      expect(code).toContain('carriage_cargo.uuid,');
      expect(code).toContain('carriage_cargo.carriage_uuid');
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
      const code = defineDaoFindByMethodCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
        allSqlSchemaRelationships: [
          sqlSchemaRelationship,
          geocodeSqlSchemaRelationship,
        ],
        findByQueryType: FindByQueryType.UNIQUE,
      });

      // log an example
      expect(code).toContain(
        '-- query_name = find_train_located_event_by_unique',
      ); // name of query
      expect(code).toContain('train_located_event.id,'); // select expressions
      expect(code).toContain('train_located_event.train_uuid,');
      expect(code).toContain('train_located_event.occurred_at,');
      expect(code).toContain('geocodes');
      expect(code).toContain(
        'FROM view_train_located_event_hydrated AS train_located_event',
      ); // table to query (view, in this case)
      expect(code).toContain('WHERE 1=1'); // condition
      expect(code).toContain(
        '  AND train_located_event.train_uuid = :trainUuid',
      ); // condition
      expect(code).toContain(
        '  AND train_located_event.occurred_at = :occurredAt',
      ); // condition
      expect(code).toContain(
        `
async (
  {
    trainUuid,
    occurredAt,
  }: {
    trainUuid: string;
    occurredAt: Date;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
)
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
      expect(code).toContain('home_station_geocode,');
      expect(code).toContain('lead_engineer_uuid,');
      expect(code).toContain('badges,');
      expect(code).toContain('locomotive_uuids');
      expect(code).toContain('FROM view_train_hydrated AS train'); // table to query (view, in this case)
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
          unique: [
            'homeStationGeocode',
            'badges',
            'locomotiveUuids',
            'leadEngineerUuid',
          ],
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
      const geocodeSqlSchemaRelationship =
        defineSqlSchemaRelationshipForDomainObject({
          domainObject: new DomainObjectMetadata({
            name: 'Geocode',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
            properties: {
              id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
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
              id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
              uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
              name: { name: 'name', type: DomainObjectPropertyType.STRING },
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
      expect(code).toContain('home_station_geocode,');
      expect(code).toContain('lead_engineer_uuid,');
      expect(code).toContain('badges,');
      expect(code).toContain('locomotive_uuids');
      expect(code).toContain('FROM view_train_hydrated AS train'); // table to query (view, in this case)
      expect(code).toContain(
        `
  WHERE 1=1
    AND view_train_current.home_station_geocode_id = :homeStationGeocodeId
    AND view_train_current.badge_ids = :badgeIds
    AND view_train_current.locomotive_ids = (
      SELECT COALESCE(array_agg(locomotive.id ORDER BY locomotive_ref.array_order_index), array[]::bigint[]) AS array_agg
      FROM locomotive
      JOIN unnest(:locomotiveUuids::uuid[]) WITH ORDINALITY
        AS locomotive_ref (uuid, array_order_index)
        ON locomotive.uuid = locomotive_ref.uuid
    )
    AND view_train_current.lead_engineer_id = (SELECT id FROM train_engineer WHERE train_engineer.uuid = :leadEngineerUuid);
        `.trim(),
      ); // condition
      expect(code).toContain(
        `
async (
  {
    homeStationGeocode,
    badges,
    locomotiveUuids,
    leadEngineerUuid,
  }: {
    homeStationGeocode: Geocode;
    badges: TrainBadge[];
    locomotiveUuids: string[];
    leadEngineerUuid: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Train> | null> =>
      `.trim(),
      );
      expect(code).toContain('await sqlQueryFindTrainByUnique(');
      expect(code).toMatchSnapshot();
    });
  });
});
