import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';
import { getError } from 'test-fns';

import { createExampleDomainObjectMetadata } from '@src/domain.operations/.test.assets/createExampleDomainObject';
import { UserInputError } from '@src/domain.operations/UserInputError';

import { defineSqlSchemaRelationshipForDomainObject } from './defineSqlSchemaRelationshipForDomainObject';

describe('defineSqlSchemarelationshipForDomainObject', () => {
  it('should look right for a domain-literal', () => {
    const relationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject: new DomainObjectMetadata({
        name: 'PreciseGeocode',
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
          origin: null,
          alias: null,
          primary: null,
          unique: null,
          updatable: null,
        },
      }),
      allDomainObjects: [],
    });
    expect(relationship.name.sqlSchema).toEqual('precise_geocode'); // should be snake case
    expect(relationship.properties.length).toEqual(5); // sanity check
    expect(relationship.decorations.unique.domainObject).toEqual(null); // it wasn't defined, since domain literal
    expect(relationship.decorations.unique.sqlSchema).toEqual([
      'latitude',
      'longitude',
    ]); // should be all of the properties, since domain literal
    expect(relationship).toMatchSnapshot();
  });
  it('should look right for a domain-literal with an alias', () => {
    const relationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject: new DomainObjectMetadata({
        name: 'PreciseGeocode',
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
          origin: null,
          alias: 'geocode',
          primary: null,
          unique: null,
          updatable: null,
        },
      }),
      allDomainObjects: [],
    });
    expect(relationship.name.sqlSchema).toEqual('precise_geocode'); // should be snake case
    expect(relationship.properties.length).toEqual(5); // sanity check
    expect(relationship.decorations.alias.domainObject).toEqual('geocode');
    expect(relationship.decorations.unique.domainObject).toEqual(null); // it wasn't defined, since domain literal
    expect(relationship.decorations.unique.sqlSchema).toEqual([
      'latitude',
      'longitude',
    ]); // should be all of the properties, since domain literal
    expect(relationship).toMatchSnapshot();
  });
  it('should look right for another domain-literal, one with multi word property names', () => {
    const relationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject: new DomainObjectMetadata({
        name: 'ChatParticipant',
        extends: DomainObjectVariant.DOMAIN_LITERAL,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          role: { name: 'role', type: DomainObjectPropertyType.STRING },
          externalId: {
            name: 'externalId',
            type: DomainObjectPropertyType.STRING,
          },
        },
        decorations: {
          origin: null,
          alias: null,
          primary: null,
          unique: null,
          updatable: null,
        },
      }),
      allDomainObjects: [],
    });
    expect(relationship.name.sqlSchema).toEqual('chat_participant'); // should be snake case
    expect(relationship.properties.length).toEqual(5); // sanity check
    expect(relationship.decorations.unique.domainObject).toEqual(null); // it wasn't defined, since domain literal
    expect(relationship.decorations.unique.sqlSchema).toEqual([
      'role',
      'external_id',
    ]); // should be all of the properties, since domain literal
    expect(relationship).toMatchSnapshot();
  });
  it('should look right for a domain-entity', () => {
    const relationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject: new DomainObjectMetadata({
        name: 'TrainCarriage',
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
          manufacturer: {
            name: 'manufacturer',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'TrainManufacturer',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
        decorations: {
          origin: null,
          alias: null,
          primary: null,
          unique: ['cin'],
          updatable: ['capacity'],
        },
      }),
      allDomainObjects: [],
    });
    expect(relationship.name.sqlSchema).toEqual('train_carriage'); // should be snake case
    expect(relationship.properties.length).toEqual(9); // only includes the non-auto-generated ones
    expect(relationship.decorations.unique.sqlSchema).toEqual(['cin']); // sanity check
    expect(relationship).toMatchSnapshot();
  });
  it('should look right for a domain-event', () => {
    const relationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject: new DomainObjectMetadata({
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
          origin: null,
          alias: null,
          primary: null,
          unique: ['trainUuid', 'occurredAt'],
          updatable: [],
        },
      }),
      allDomainObjects: [
        {
          ...createExampleDomainObjectMetadata(),
          name: 'Train',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      ],
    });
    expect(relationship.name.sqlSchema).toEqual('train_located_event'); // should be snake case
    expect(relationship.properties.length).toEqual(6); // only includes the non-auto-generated ones
    expect(relationship.decorations.unique.sqlSchema).toEqual([
      'train_id',
      'occurred_at',
    ]); // notice that `trainUuid` was converted to `train_id`! (since the sql column is called `train_id`, since it references a `train`)
    expect(relationship).toMatchSnapshot();
  });
  describe('fail loud for unsupported unique keys', () => {
    it('should throw a clear UserInputError (not a bare TypeError) for a primitive array in a unique key', () => {
      // define an entity that (invalidly) declares a primitive array as part of its unique key
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
          unique: ['tags'],
          updatable: [],
        },
      });

      // build the relationship and capture the error; the guard lives here, at the one construction site all consumers funnel through
      const error = getError(() =>
        defineSqlSchemaRelationshipForDomainObject({
          domainObject,
          allDomainObjects: [domainObject],
        }),
      );

      // it must fail loud with a contextualized UserInputError, not a bare null-deref TypeError deeper in a consumer
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.message).toContain('can not be part of a unique key');
      expect(error.message).toContain('Post');
      expect(error.message).toContain('tags');
    });
    it('should throw for a domain-literal with a primitive array (implicitly part of its all-property unique key)', () => {
      // a domain literal is unique on ALL of its properties, so a primitive array property lands in the implicit unique key
      const domainObject = new DomainObjectMetadata({
        name: 'Waypoint',
        extends: DomainObjectVariant.DOMAIN_LITERAL,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          labels: {
            name: 'labels',
            type: DomainObjectPropertyType.ARRAY,
            of: { type: DomainObjectPropertyType.STRING },
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

      // build the relationship and capture the error
      const error = getError(() =>
        defineSqlSchemaRelationshipForDomainObject({
          domainObject,
          allDomainObjects: [domainObject],
        }),
      );

      // it must fail loud with a contextualized UserInputError that explains the literal case
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.message).toContain('can not be part of a unique key');
      expect(error.message).toContain('Waypoint');
      expect(error.message).toContain('labels');
      expect(error.message).toContain('domain-literals are unique on all');
    });
    it('should allow a matched _uuids reference array in a unique key (the complementary allowed branch)', () => {
      // the guard rejects only NON-reference arrays. a _uuids array that matches a known domain
      // object is an implicit by-uuid reference (it carries a .reference), so it is legitimately
      // allowed in a unique key and must build without a throw — the positive counterpart to the
      // two fail-loud cases above
      const domainObject = new DomainObjectMetadata({
        name: 'Playlist',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
        properties: {
          id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
          uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
          trackUuids: {
            name: 'trackUuids',
            type: DomainObjectPropertyType.ARRAY,
            of: { type: DomainObjectPropertyType.STRING },
          },
        },
        decorations: {
          origin: null,
          alias: null,
          primary: null,
          unique: ['trackUuids'],
          updatable: [],
        },
      });
      const track = {
        ...createExampleDomainObjectMetadata(),
        name: 'Track',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
      } as DomainObjectMetadata;

      // build it directly — a throw here would fail the test
      const relationship = defineSqlSchemaRelationshipForDomainObject({
        domainObject,
        allDomainObjects: [domainObject, track],
      });
      expect(relationship).toBeDefined();
      expect(relationship.name.sqlSchema).toEqual('playlist');
    });
  });
});
