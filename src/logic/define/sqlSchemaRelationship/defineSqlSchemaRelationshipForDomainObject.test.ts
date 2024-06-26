import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { createExampleDomainObjectMetadata } from '../../__test_assets__/createExampleDomainObject';
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
});
