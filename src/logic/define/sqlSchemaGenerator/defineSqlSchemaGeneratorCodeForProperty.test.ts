import {
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { createExampleDomainObjectMetadata } from '../../__test_assets__/createExampleDomainObject';
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
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
  });
});
