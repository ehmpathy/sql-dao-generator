import {
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';
import { getError } from 'helpful-errors';

import { SqlSchemaReferenceMethod } from '@src/domain.objects/SqlSchemaReferenceMetadata';
import { createExampleDomainObjectMetadata } from '@src/domain.operations/.test.assets/createExampleDomainObject';
import { UserInputError } from '@src/domain.operations/UserInputError';

import { defineSqlSchemaGeneratorCodeForProperty } from './defineSqlSchemaGeneratorCodeForProperty';

describe('defineSqlSchemaGeneratorCodeForProperty', () => {
  describe('base property', () => {
    it('should generate correctly for type string', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'name',
          type: DomainObjectPropertyType.STRING,
        },
        sqlSchemaProperty: {
          name: 'name',
          isArray: false,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('name: prop.VARCHAR(),');
    });
    it('should generate correctly for type number', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'latitude',
          type: DomainObjectPropertyType.NUMBER,
        },
        sqlSchemaProperty: {
          name: 'latitude',
          isArray: false,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('latitude: prop.NUMERIC(),');
    });
    it('should generate correctly for type date', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'occurredAt',
          type: DomainObjectPropertyType.DATE,
        },
        sqlSchemaProperty: {
          name: 'occurred_at',
          isArray: false,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('occurred_at: prop.TIMESTAMPTZ(),');
    });
    it('should generate correctly for type boolean', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'certified',
          type: DomainObjectPropertyType.BOOLEAN,
        },
        sqlSchemaProperty: {
          name: 'certified',
          isArray: false,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('certified: prop.BOOLEAN(),');
    });
    it('should generate correctly for type enum', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'status',
          type: DomainObjectPropertyType.ENUM,
          of: ['QUEUED', 'ATTEMPTED', 'FULFILLED', 'FAILED', 'CANCELED'],
        },
        sqlSchemaProperty: {
          name: 'status',
          isArray: false,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual(
        "status: prop.ENUM(['QUEUED', 'ATTEMPTED', 'FULFILLED', 'FAILED', 'CANCELED']),",
      );
    });
    it('should generate correctly for reference', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'homeAddress',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'Address',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
        sqlSchemaProperty: {
          name: 'home_address_id',
          isArray: false,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: {
            method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
            of: {
              name: 'Address',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
      });
      expect(property).toEqual('home_address_id: prop.REFERENCES(address),');
    });
    it('should generate correctly for reference - name in prop reference should be camelCase', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'homeAddress',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'HomeAddress',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
        sqlSchemaProperty: {
          name: 'home_address_id',
          isArray: false,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: {
            method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
            of: {
              name: 'HomeAddress',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
      });
      expect(property).toEqual(
        'home_address_id: prop.REFERENCES(homeAddress),',
      );
    });
    it('should generate correctly for reference - where there is a self reference', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: {
          ...createExampleDomainObjectMetadata(),
          name: 'Service',
        },
        domainObjectProperty: {
          name: 'parentService',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'Service',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
        sqlSchemaProperty: {
          name: 'parent_service_id',
          isArray: false,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: {
            method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
            of: {
              name: 'Service',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
      });
      expect(property).toEqual(
        'parent_service_id: prop.REFERENCES(() => service),',
      );
    });
    it('should generate correctly for reference array', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'externalIds',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'PlaneExternalId',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
        sqlSchemaProperty: {
          name: 'external_id_ids',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: {
            method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
            of: {
              name: 'PlaneExternalId',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
      });
      expect(property).toEqual(
        'external_id_ids: prop.ARRAY_OF(prop.REFERENCES(planeExternalId)),',
      ); // note the camel case inside prop.REFERENCES
    });
    it('should generate correctly for reference array - where there is a self reference', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: {
          ...createExampleDomainObjectMetadata({
            extend: DomainObjectVariant.DOMAIN_ENTITY,
          }),
          name: 'Service',
        },
        domainObjectProperty: {
          name: 'parentServiceUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: { name: 'Service', extends: DomainObjectVariant.DOMAIN_ENTITY },
          },
        },
        sqlSchemaProperty: {
          name: 'parent_service_ids',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: {
            method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
            of: { name: 'Service', extends: DomainObjectVariant.DOMAIN_ENTITY },
          },
        },
      });
      expect(property).toEqual(
        'parent_service_ids: prop.ARRAY_OF(prop.REFERENCES(() => service)),',
      ); // note the camel case inside prop.REFERENCES
    });
  });
  describe('primitive and enum arrays', () => {
    it('should generate a native varchar[] column for a string[] primitive array', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'tags',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.STRING },
        },
        sqlSchemaProperty: {
          name: 'tags',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('tags: prop.ARRAY_OF(prop.VARCHAR()),');
    });
    it('should generate a native numeric[] column for a number[] primitive array', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'scores',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.NUMBER },
        },
        sqlSchemaProperty: {
          name: 'scores',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('scores: prop.ARRAY_OF(prop.NUMERIC()),');
    });
    it('should generate a native boolean[] column for a boolean[] primitive array', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'flags',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.BOOLEAN },
        },
        sqlSchemaProperty: {
          name: 'flags',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('flags: prop.ARRAY_OF(prop.BOOLEAN()),');
    });
    it('should generate a native timestamptz[] column for a Date[] primitive array', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'occurredAts',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.DATE },
        },
        sqlSchemaProperty: {
          name: 'occurred_ats',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual(
        'occurred_ats: prop.ARRAY_OF(prop.TIMESTAMPTZ()),',
      );
    });
    it('should generate a native enum[] column for an enum array', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'statuses',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.ENUM,
            of: ['ACTIVE', 'PAUSED'],
          },
        },
        sqlSchemaProperty: {
          name: 'statuses',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual(
        "statuses: prop.ARRAY_OF(prop.ENUM(['ACTIVE', 'PAUSED'])),",
      );
    });
    it('should still generate a uuid[] column for a _uuids-suffix string[] with no matched domain object', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'favoriteFruitUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.STRING },
        },
        sqlSchemaProperty: {
          name: 'favorite_fruit_uuids',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual(
        'favorite_fruit_uuids: prop.ARRAY_OF(prop.UUID()),',
      );
    });
    it('should generate a native numeric[] column (not a uuid[]) for a _uuids-suffix number[]', () => {
      // a _uuids suffix on a non-string array is NOT a uuid reference — it is a native primitive
      // array. the shared isUuidReferenceArrayProperty predicate gates on a string element, so this
      // number[] falls through to the native branch, in agreement with schema-control (which declares
      // no join table for it) — the two layers can not drift on this fork
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'scoreUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.NUMBER },
        },
        sqlSchemaProperty: {
          name: 'score_uuids',
          isArray: true,
          isNullable: false,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('score_uuids: prop.ARRAY_OF(prop.NUMERIC()),');
    });
    it('should fail loud for a nested array shape (string[][])', () => {
      const error = getError(() =>
        defineSqlSchemaGeneratorCodeForProperty({
          domainObject: createExampleDomainObjectMetadata(),
          domainObjectProperty: {
            name: 'matrix',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.ARRAY,
              of: { type: DomainObjectPropertyType.STRING },
            },
          },
          sqlSchemaProperty: {
            name: 'matrix',
            isArray: true,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: null,
          },
        }),
      );
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.message).toContain('Unsupported array shape');
    });
  });
  describe('modifiers', () => {
    it('should generate properties with updatable modifier correctly', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'name',
          type: DomainObjectPropertyType.STRING,
        },
        sqlSchemaProperty: {
          name: 'name',
          isArray: false,
          isNullable: false,
          isUpdatable: true,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual('name: { ...prop.VARCHAR(), updatable: true },');
    });
    it('should generate properties with nullable modifier correctly', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'externalIds',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'PlaneExternalId',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
        sqlSchemaProperty: {
          name: 'external_id_ids',
          isArray: true,
          isNullable: true,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: {
            method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
            of: {
              name: 'PlaneExternalId',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
      });
      expect(property).toEqual(
        'external_id_ids: { ...prop.ARRAY_OF(prop.REFERENCES(planeExternalId)), nullable: true },',
      );
    });
    it('should generate properties with both modifiers correctly', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'status',
          type: DomainObjectPropertyType.ENUM,
          of: ['QUEUED', 'ATTEMPTED', 'FULFILLED', 'FAILED', 'CANCELED'],
        },
        sqlSchemaProperty: {
          name: 'status',
          isArray: false,
          isNullable: true,
          isUpdatable: true,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual(
        "status: { ...prop.ENUM(['QUEUED', 'ATTEMPTED', 'FULFILLED', 'FAILED', 'CANCELED']), updatable: true, nullable: true },",
      );
    });
    it('should preserve the nullable modifier on a primitive array column', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'tags',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.STRING },
        },
        sqlSchemaProperty: {
          name: 'tags',
          isArray: true,
          isNullable: true,
          isUpdatable: false,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual(
        'tags: { ...prop.ARRAY_OF(prop.VARCHAR()), nullable: true },',
      );
    });
    it('should preserve the updatable modifier on a primitive array column', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'tags',
          type: DomainObjectPropertyType.ARRAY,
          of: { type: DomainObjectPropertyType.STRING },
        },
        sqlSchemaProperty: {
          name: 'tags',
          isArray: true,
          isNullable: false,
          isUpdatable: true,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual(
        'tags: { ...prop.ARRAY_OF(prop.VARCHAR()), updatable: true },',
      );
    });
    it('should preserve the updatable modifier on an enum array column', () => {
      const property = defineSqlSchemaGeneratorCodeForProperty({
        domainObject: createExampleDomainObjectMetadata(),
        domainObjectProperty: {
          name: 'statuses',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.ENUM,
            of: ['ACTIVE', 'PAUSED'],
          },
        },
        sqlSchemaProperty: {
          name: 'statuses',
          isArray: true,
          isNullable: false,
          isUpdatable: true,
          isDatabaseGenerated: false,
          reference: null,
        },
      });
      expect(property).toEqual(
        "statuses: { ...prop.ARRAY_OF(prop.ENUM(['ACTIVE', 'PAUSED'])), updatable: true },",
      );
    });
  });
});
