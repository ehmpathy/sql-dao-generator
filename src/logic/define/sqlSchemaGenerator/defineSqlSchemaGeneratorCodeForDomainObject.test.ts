import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import { defineSqlSchemaGeneratorCodeForDomainObject } from './defineSqlSchemaGeneratorCodeForDomainObject';

describe('defineSqlSchemaGeneratorCodeForDomainObject', () => {
  describe('imports', () => {
    it('should not have extra new lines if there are no imports', () => {
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
          unique: null,
          updatable: null,
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // check import lines
      const importLines = code
        .split('\n')
        .filter((line) => line.includes('import {'));
      expect(importLines.length).toEqual(1); // should only have one import
      expect(importLines[0]).toContain("from 'sql-schema-generator';"); // and it should be the one from the sql-schema-generator

      // check that there's not an extra newline after the import
      const lines = code.split('\n');
      expect(lines[0]).toContain('import {'); // should be the first import
      expect(lines[1]).toEqual(''); // should be a newline
      expect(lines[2]).not.toEqual(''); // should not be a newline

      // take a snapshot for documenting example
      expect(code).toMatchSnapshot();
    });
    it('should create an import for each directly nested and uuid inferred reference, sorted', () => {
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
          homeStationGeocode: {
            name: 'homeStation',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Station',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
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
        },
        decorations: {
          unique: ['uuid'],
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
          { name: 'Engineer', extends: DomainObjectVariant.DOMAIN_ENTITY },
        ] as DomainObjectMetadata[],
      });

      // run it
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });

      // check import lines
      const importLines = code
        .split('\n')
        .filter((line) => line.includes('import {'));
      expect(importLines.length).toEqual(5); // should have 5 import lines; one for schema generator, 4 for domain entity references
      expect(importLines[0]).toContain("from 'sql-schema-generator';"); // first should be schema generator
      expect(importLines[1]).toContain("from './badge'"); // b, is first in alphabetical order of subsequent imports
      expect(importLines[2]).toContain("from './engineer'"); // e, is next
      expect(importLines[3]).toContain("from './locomotive'"); // l, is after that
      expect(importLines[4]).toContain("from './station'"); // s, is last

      // check that there's a new line after schema-generator import, no newlines between reference imports, and a newline after reference imports
      const lines = code.split('\n');
      expect(lines[0]).toContain('import {'); // should be the first import
      expect(lines[1]).toEqual(''); // should be a newline
      expect(lines[2]).toContain('import {'); // should be the an import
      expect(lines[3]).toContain('import {'); // should be the an import
      expect(lines[4]).toContain('import {'); // should be the an import
      expect(lines[5]).toContain('import {'); // should be the an import
      expect(lines[6]).toEqual(''); // should be a newline
      expect(lines[7]).not.toEqual(''); // should not be a newline

      // take a snapshot for documenting example
      expect(code).toMatchSnapshot();
    });
  });
  describe('domain object variants', () => {
    it('should create a correct looking sql-schema-generator object for a domain-literal', () => {
      // define what we're testing on
      const domainObject = new DomainObjectMetadata({
        name: 'Geocode',
        extends: DomainObjectVariant.DOMAIN_LITERAL,
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
          latitude: { name: 'latitude', type: DomainObjectPropertyType.NUMBER },
          longitude: {
            name: 'longitude',
            type: DomainObjectPropertyType.NUMBER,
          },
        },
        decorations: { unique: null, updatable: null },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });
      expect(code).toContain(
        "import { Literal, prop } from 'sql-schema-generator'",
      );
      expect(code).toContain('export const geocode: Literal = new Literal({');
      expect(code).toContain("name: 'geocode'");
      expect(code).not.toContain('id:');
      expect(code).not.toContain('uuid:');
      expect(code).toContain('latitude: prop.NUMERIC()');
      expect(code).toContain('longitude: prop.NUMERIC()');
      expect(code).not.toContain('unique:');
      expect(code).toMatchSnapshot(); // log example
    });

    it('should create a correct looking sql-schema-generator object for a domain-entity', () => {
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
          unique: ['cin'],
          updatable: [],
        },
      });
      const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject],
      });

      // run it
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });
      expect(code).toContain(
        "import { Entity, prop } from 'sql-schema-generator'",
      );
      expect(code).toContain('export const carriage: Entity = new Entity({');
      expect(code).toContain("name: 'carriage'");
      expect(code).not.toContain('id:'); // should be filtered out
      expect(code).not.toContain('uuid:'); // should be filtered out
      expect(code).toContain('cin: prop.VARCHAR(),');
      expect(code).toContain("carries: prop.ENUM(['PASSENGER', 'FREIGHT']),");
      expect(code).toContain(
        'capacity: { ...prop.NUMERIC(), nullable: true },',
      );
      expect(code).toContain("unique: ['cin'],");
      expect(code).toMatchSnapshot();
    });
    it('should create a correct looking sql-schema-generator object for a domain-event', () => {
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
          geocode: {
            name: 'geocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
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
        allDomainObjects: [
          domainObject,
          { name: 'Train', extends: DomainObjectVariant.DOMAIN_ENTITY },
        ] as DomainObjectMetadata[],
      });

      // run it
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        domainObject,
        sqlSchemaRelationship,
      });
      expect(code).toContain(
        "import { Event, prop } from 'sql-schema-generator'",
      );
      expect(code).toContain(
        'export const trainLocatedEvent: Event = new Event({',
      );
      expect(code).toContain("name: 'train_located_event'");
      expect(code).not.toContain(' id:'); // should be filtered out
      expect(code).not.toContain(' uuid:'); // should be filtered out
      expect(code).toContain('train_id: prop.REFERENCES(train),');
      expect(code).toContain('occurred_at: prop.TIMESTAMPTZ(),');
      expect(code).toContain('geocode_id: prop.REFERENCES(geocode),');
      expect(code).toContain("unique: ['train_id', 'occurred_at'],");
      expect(code).toMatchSnapshot();
    });
  });
});
