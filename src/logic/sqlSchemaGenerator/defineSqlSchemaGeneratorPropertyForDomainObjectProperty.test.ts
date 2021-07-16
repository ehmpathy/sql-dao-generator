import { DomainObjectMetadata, DomainObjectPropertyType, DomainObjectVariant } from 'domain-objects-metadata';
import {
  defineSqlSchemaGeneratorPropertyForDomainObjectProperty,
  DirectlyNestedDomainEntityReferenceForbiddenError,
} from './defineSqlSchemaGeneratorPropertyForDomainObjectProperty';

describe('defineSqlSchemaGeneratorPropertyForDomainObjectProperty', () => {
  describe('base property', () => {
    describe('standard types', () => {
      it('should generate correctly for type string', () => {
        const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
          propertyName: 'name',
          propertyDefinition: {
            type: DomainObjectPropertyType.STRING,
          },
          metadata: {
            decorations: {
              unique: null,
              updatable: null,
            },
          } as DomainObjectMetadata,
          allMetadatas: [],
        });
        expect(property).toEqual('name: prop.VARCHAR(),');
      });
      it('should generate correctly for type number', () => {
        const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
          propertyName: 'latitude',
          propertyDefinition: {
            type: DomainObjectPropertyType.NUMBER,
          },
          metadata: {
            decorations: {
              unique: null,
              updatable: null,
            },
          } as DomainObjectMetadata,
          allMetadatas: [],
        });
        expect(property).toEqual('latitude: prop.NUMERIC(),');
      });
      it('should generate correctly for type date', () => {
        const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
          propertyName: 'occurredAt',
          propertyDefinition: {
            type: DomainObjectPropertyType.DATE,
          },
          metadata: {
            decorations: {
              unique: null,
              updatable: null,
            },
          } as DomainObjectMetadata,
          allMetadatas: [],
        });
        expect(property).toEqual('occurred_at: prop.TIMESTAMPTZ(),');
      });
      it('should generate correctly for type boolean', () => {
        const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
          propertyName: 'certified',
          propertyDefinition: {
            type: DomainObjectPropertyType.BOOLEAN,
          },
          metadata: {
            decorations: {
              unique: null,
              updatable: null,
            },
          } as DomainObjectMetadata,
          allMetadatas: [],
        });
        expect(property).toEqual('certified: prop.BOOLEAN(),');
      });
      it('should generate correctly for type enum', () => {
        const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
          propertyName: 'status',
          propertyDefinition: {
            type: DomainObjectPropertyType.ENUM,
            of: ['QUEUED', 'ATTEMPTED', 'FULFILLED', 'FAILED', 'CANCELED'],
          },
          metadata: {
            decorations: {
              unique: null,
              updatable: null,
            },
          } as DomainObjectMetadata,
          allMetadatas: [],
        });
        expect(property).toEqual("status: prop.ENUM(['QUEUED', 'ATTEMPTED', 'FULFILLED', 'FAILED', 'CANCELED']),");
      });
    });
    describe('reference types', () => {
      describe('reference value object', () => {
        it('should generate correctly for reference type', () => {
          const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
            propertyName: 'home_address',
            propertyDefinition: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'Address',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
              },
            },
            metadata: {
              decorations: {
                unique: null,
                updatable: null,
              },
            } as DomainObjectMetadata,
            allMetadatas: [],
          });
          expect(property).toContain('home_address_id:'); // name must be casted correctly. (the _id suffix is required)
          expect(property).toEqual('home_address_id: prop.REFERENCES(address),');
        });
        it('should generate correctly for array reference type', () => {
          const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
            propertyName: 'external_ids',
            propertyDefinition: {
              type: DomainObjectPropertyType.ARRAY,
              of: {
                type: DomainObjectPropertyType.REFERENCE,
                of: {
                  name: 'PlaneExternalId',
                  extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
                },
              },
            },
            metadata: {
              decorations: {
                unique: null,
                updatable: null,
              },
            } as DomainObjectMetadata,
            allMetadatas: [],
          });
          expect(property).toContain('external_id_ids:'); // name must be casted correctly. (the _ids suffix is required)
          expect(property).toEqual('external_id_ids: prop.ARRAY_OF(prop.REFERENCES(plane_external_id)),');
        });
      });
      describe('reference entity', () => {
        it('should throw an error if user attempts to directly reference an entity', () => {
          try {
            defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
              propertyName: 'user',
              propertyDefinition: {
                type: DomainObjectPropertyType.REFERENCE,
                of: {
                  name: 'User',
                  extends: DomainObjectVariant.DOMAIN_ENTITY,
                },
              },
              metadata: {
                name: 'Profile',
                decorations: {
                  unique: null,
                  updatable: null,
                },
              } as DomainObjectMetadata,
              allMetadatas: [],
            });
            throw new Error('should not reach here');
          } catch (error) {
            expect(error).toBeInstanceOf(DirectlyNestedDomainEntityReferenceForbiddenError);
            expect(error.message).toContain('DomainEntity found directly nested inside of another domain object.');
            expect(error.message).toMatchSnapshot();
          }
        });
        it('should throw an error if user attempts to directly reference an entity in an array', () => {
          try {
            defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
              propertyName: 'users',
              propertyDefinition: {
                type: DomainObjectPropertyType.ARRAY,
                of: {
                  type: DomainObjectPropertyType.REFERENCE,
                  of: {
                    name: 'User',
                    extends: DomainObjectVariant.DOMAIN_ENTITY,
                  },
                },
              },
              metadata: {
                name: 'Profile',
                decorations: {
                  unique: null,
                  updatable: null,
                },
              } as DomainObjectMetadata,
              allMetadatas: [],
            });
            throw new Error('should not reach here');
          } catch (error) {
            expect(error).toBeInstanceOf(DirectlyNestedDomainEntityReferenceForbiddenError);
            expect(error.message).toContain('DomainEntity found directly nested inside of another domain object.');
            expect(error.message).toMatchSnapshot();
          }
        });
        it.only('should generate correctly for a uuid reference type', () => {
          const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
            propertyName: 'userUuid',
            propertyDefinition: {
              type: DomainObjectPropertyType.STRING,
            },
            metadata: {
              name: 'Profile',
              decorations: {
                unique: null,
                updatable: null,
              },
            } as DomainObjectMetadata,
            allMetadatas: [{ name: 'User', extends: DomainObjectVariant.DOMAIN_ENTITY }] as DomainObjectMetadata[],
          });
          expect(property).toContain('user_id:'); // name must be casted correctly. (the _id suffix is required)
          expect(property).toEqual('user_id: prop.REFERENCES(user),');
        });
      });
    });
  });
  describe('modifiers', () => {
    it('should generate properties with updatable modifier correctly', () => {
      const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
        propertyName: 'name',
        propertyDefinition: {
          type: DomainObjectPropertyType.STRING,
        },
        metadata: {
          decorations: {
            unique: null,
            updatable: ['name'],
          },
        } as DomainObjectMetadata,
        allMetadatas: [],
      });
      expect(property).toEqual('name: { ...prop.VARCHAR(), updatable: true },');
    });
    it('should generate properties with nullable modifier correctly', () => {
      const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
        propertyName: 'external_ids',
        propertyDefinition: {
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'PlaneExternalId',
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
            },
          },
          nullable: true,
        },
        metadata: {
          decorations: {
            unique: null,
            updatable: null,
          },
        } as DomainObjectMetadata,
        allMetadatas: [],
      });
      expect(property).toContain('external_id_ids:'); // name must be casted correctly. (the _ids suffix is required)
      expect(property).toEqual(
        'external_id_ids: { ...prop.ARRAY_OF(prop.REFERENCES(plane_external_id)), nullable: true },',
      );
    });
    it('should generate properties with both modifiers correctly', () => {
      const property = defineSqlSchemaGeneratorPropertyForDomainObjectProperty({
        propertyName: 'status',
        propertyDefinition: {
          type: DomainObjectPropertyType.ENUM,
          of: ['QUEUED', 'ATTEMPTED', 'FULFILLED', 'FAILED', 'CANCELED'],
          nullable: true,
        },
        metadata: {
          decorations: {
            unique: null,
            updatable: ['status'],
          },
        } as DomainObjectMetadata,
        allMetadatas: [],
      });
      expect(property).toEqual(
        "status: { ...prop.ENUM(['QUEUED', 'ATTEMPTED', 'FULFILLED', 'FAILED', 'CANCELED']), updatable: true, nullable: true },",
      );
    });
  });
});
