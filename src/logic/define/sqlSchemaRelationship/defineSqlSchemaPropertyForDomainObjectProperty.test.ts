import { DomainObjectPropertyType, DomainObjectVariant } from 'domain-objects-metadata';
import { createExampleDomainObjectMetadata } from '../../__test_assets__/createExampleDomainObject';
import { defineSqlSchemaPropertyForDomainObjectProperty } from './defineSqlSchemaPropertyForDomainObjectProperty';

describe('defineSqlSchemaPropertyForDomainObjectProperty', () => {
  it('should throw an error if attempted to be run on a database generated value', () => {
    try {
      defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'createdAt',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toContain(
        'defineSqlSchemaPropertyForDomainObjectProperty was called for an db-generated property',
      );
    }
  });
  describe('names', () => {
    it('should define regular property names in snake case', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'socialSecurityNumberHash',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.name).toEqual('social_security_number_hash');
    });
    it('should add the _id suffix to directly nested reference property names', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'steamEngineCertificate',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'Certificate',
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
          },
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.name).toEqual('steam_engine_certificate_id');
    });
    it('should add the _ids suffix and strip plurality to directly nested reference array property names', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'engineCertificates',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Certificate',
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
            },
          },
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.name).toEqual('engine_certificate_ids');
    });
    it('should add the _id suffix to inferred uuid reference property names', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'steamEngineCertificateUuid',
          type: DomainObjectPropertyType.STRING,
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [
          { ...createExampleDomainObjectMetadata(), name: 'Certificate', extends: DomainObjectVariant.DOMAIN_ENTITY },
        ],
      });
      expect(sqlSchemaProperty.name).toEqual('steam_engine_certificate_id');
    });
    it('should add the _ids suffix and strip plurality to inferred uuid reference array property names', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'engineCertificateUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.STRING,
          },
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [
          { ...createExampleDomainObjectMetadata(), name: 'Certificate', extends: DomainObjectVariant.DOMAIN_ENTITY },
        ],
      });
      expect(sqlSchemaProperty.name).toEqual('engine_certificate_ids');
    });
  });
  describe('reference', () => {
    it('should define reference is null if theres no reference', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'socialSecurityNumberHash',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.reference).toEqual(null);
    });
    it('should define the reference correctly when there is a reference', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'steamEngineCertificate',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'Certificate',
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
          },
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.reference).toBeDefined();
      expect(sqlSchemaProperty.reference!.of.name).toEqual('Certificate');
    });
  });
  describe('modifiers', () => {
    it('should detect nullable, when nullable', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'socialSecurityNumberHash',
          type: DomainObjectPropertyType.STRING,
          required: true,
          nullable: true,
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.isNullable).toEqual(true);
    });
    it('should detect not nullable, when not nullable', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'socialSecurityNumberHash',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.isNullable).toEqual(false);
    });
    it('should detect updatable, when updatable', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'socialSecurityNumberHash',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        domainObject: {
          ...createExampleDomainObjectMetadata(),
          decorations: { updatable: ['socialSecurityNumberHash'], unique: null },
        },
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.isUpdatable).toEqual(true);
    });
    it('should detect not updatable, when not updatable', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'socialSecurityNumberHash',
          type: DomainObjectPropertyType.STRING,
          required: true,
        },
        domainObject: {
          ...createExampleDomainObjectMetadata(),
        },
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.isUpdatable).toEqual(false);
    });
    it('should detect array, when array', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'engineCertificateUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.STRING,
          },
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.isArray).toEqual(true);
    });
    it('should detect not array, when not array', () => {
      const sqlSchemaProperty = defineSqlSchemaPropertyForDomainObjectProperty({
        property: {
          name: 'engineCertificateUuid',
          type: DomainObjectPropertyType.STRING,
        },
        domainObject: createExampleDomainObjectMetadata(),
        allDomainObjects: [],
      });
      expect(sqlSchemaProperty.isArray).toEqual(false);
    });
  });
});
