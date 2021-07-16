import { DomainObjectMetadata, DomainObjectPropertyType, DomainObjectVariant } from 'domain-objects-metadata';
import { defineSqlSchemaGeneratorCodeForDomainObject } from './defineSqlSchemaGeneratorCodeForDomainObject';

describe('defineSqlSchemaGeneratorCodeForDomainObject', () => {
  describe('names', () => {
    it('should define the generator object name in camel case', () => {
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        metadata: new DomainObjectMetadata({
          name: 'GreatStuff',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
          properties: {
            latitude: {
              type: DomainObjectPropertyType.NUMBER,
            },
            longitude: {
              type: DomainObjectPropertyType.NUMBER,
            },
          },
          decorations: {
            unique: null,
            updatable: null,
          },
        }),
        allMetadatas: [],
      });
      expect(code).toContain('export const greatStuff = new '); // camel case
    });
    it('should define the table name in snake case', () => {
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        metadata: new DomainObjectMetadata({
          name: 'GreatStuff',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
          properties: {
            latitude: {
              type: DomainObjectPropertyType.NUMBER,
            },
            longitude: {
              type: DomainObjectPropertyType.NUMBER,
            },
          },
          decorations: {
            unique: null,
            updatable: null,
          },
        }),
        allMetadatas: [],
      });
      expect(code).toContain("name: 'great_stuff'"); // snake case
    });
    it('should define property names in snake case', () => {
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        metadata: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {
            socialSecurityNumberHash: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            name: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            hasCertificate: {
              type: DomainObjectPropertyType.BOOLEAN,
              nullable: true,
            },
          },
          decorations: {
            unique: ['socialSecurityNumberHash'],
            updatable: ['name', 'hasCertificate'],
          },
        }),
        allMetadatas: [],
      });
      expect(code).toContain('social_security_number_hash: '); // snake
      expect(code).toContain('has_certificate: '); // snake
      expect(code).toMatchSnapshot(); // to save an example
    });
    it('should add the _id suffix to directly nested reference property names', () => {
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        metadata: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {
            socialSecurityNumberHash: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            name: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            steamEngineCertificate: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'Certificate',
                extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
              },
            },
          },
          decorations: {
            unique: ['socialSecurityNumberHash'],
            updatable: ['name', 'certificate'],
          },
        }),
        allMetadatas: [],
      });
      // console.log(code);
      expect(code).toContain('steam_engine_certificate_id: '); // snake
      expect(code).toMatchSnapshot(); // to save an example
    });
    it('should add the _ids suffix and strip plurality to directly nested reference array property names', () => {
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        metadata: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {
            socialSecurityNumberHash: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            name: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            engineCertificates: {
              type: DomainObjectPropertyType.ARRAY,
              of: {
                type: DomainObjectPropertyType.REFERENCE,
                of: {
                  name: 'Certificate',
                  extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
                },
              },
            },
          },
          decorations: {
            unique: ['socialSecurityNumberHash'],
            updatable: ['name', 'engineCertificates'],
          },
        }),
        allMetadatas: [],
      });
      // console.log(code);
      expect(code).toContain('engine_certificate_ids: '); // snake
      expect(code).toMatchSnapshot(); // to save an example
    });
    it('should add the _id suffix to inferred uuid reference property names', () => {
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        metadata: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {
            socialSecurityNumberHash: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            name: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            steamEngineCertificateUuid: {
              type: DomainObjectPropertyType.STRING,
            },
          },
          decorations: {
            unique: ['socialSecurityNumberHash'],
            updatable: ['name', 'steamEngineCertificateUuid'],
          },
        }),
        allMetadatas: [
          {
            name: 'Certificate',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      // console.log(code);
      expect(code).toContain('steam_engine_certificate_id: '); // snake
      expect(code).toMatchSnapshot(); // to save an example
    });
    it('should add the _ids suffix and strip plurality to inferred uuid reference array property names', () => {
      const code = defineSqlSchemaGeneratorCodeForDomainObject({
        metadata: new DomainObjectMetadata({
          name: 'TrainEngineer',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
          properties: {
            socialSecurityNumberHash: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            name: {
              type: DomainObjectPropertyType.STRING,
              required: true,
            },
            engineCertificateUuids: {
              type: DomainObjectPropertyType.ARRAY,
              of: {
                type: DomainObjectPropertyType.STRING,
              },
            },
          },
          decorations: {
            unique: ['socialSecurityNumberHash'],
            updatable: ['name', 'engineCertificateUuids'],
          },
        }),
        allMetadatas: [
          {
            name: 'Certificate',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      // console.log(code);
      expect(code).toContain('engine_certificate_ids: '); // snake
      expect(code).toMatchSnapshot(); // to save an example
    });
  });
  describe('domain object variants', () => {
    describe('domain value object', () => {
      it('should throw an error if unique properties are attempted to be defined for domain-value-object', () => {
        try {
          defineSqlSchemaGeneratorCodeForDomainObject({
            metadata: new DomainObjectMetadata({
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
              properties: {
                latitude: {
                  type: DomainObjectPropertyType.NUMBER,
                },
                longitude: {
                  type: DomainObjectPropertyType.NUMBER,
                },
              },
              decorations: {
                unique: ['latitude'],
                updatable: null,
              },
            }),
            allMetadatas: [],
          });
          throw new Error('should not reach here');
        } catch (error) {
          expect(error.message).toContain("domain value objects must _not_ have their 'unique' properties specified");
        }
      });
      it('should throw an error if updatable properties are attempted to be defined for domain-value-object', () => {
        try {
          defineSqlSchemaGeneratorCodeForDomainObject({
            metadata: new DomainObjectMetadata({
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
              properties: {
                latitude: {
                  type: DomainObjectPropertyType.NUMBER,
                },
                longitude: {
                  type: DomainObjectPropertyType.NUMBER,
                },
              },
              decorations: {
                unique: null,
                updatable: ['latitude'],
              },
            }),
            allMetadatas: [],
          });
          throw new Error('should not reach here');
        } catch (error) {
          expect(error.message).toContain("domain value objects must _not_ have any 'updatable' properties specified");
        }
      });
      it('should create a correct looking sql-schema-generator object for a domain-value-object', () => {
        const code = defineSqlSchemaGeneratorCodeForDomainObject({
          metadata: new DomainObjectMetadata({
            name: 'Geocode',
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
            properties: {
              id: {
                type: DomainObjectPropertyType.NUMBER,
                required: false,
              },
              uuid: {
                type: DomainObjectPropertyType.STRING,
                required: false,
              },
              latitude: {
                type: DomainObjectPropertyType.NUMBER,
              },
              longitude: {
                type: DomainObjectPropertyType.NUMBER,
              },
            },
            decorations: {
              unique: null,
              updatable: null,
            },
          }),
          allMetadatas: [],
        });
        expect(code).toContain("import { prop, ValueObject } from 'sql-schema-generator'");
        expect(code).toContain('export const geocode = new ValueObject({');
        expect(code).toContain("name: 'geocode'");
        expect(code).not.toContain('id:');
        expect(code).not.toContain('uuid:');
        expect(code).toContain('latitude: prop.NUMERIC()');
        expect(code).toContain('longitude: prop.NUMERIC()');
        expect(code).not.toContain('unique:');
        expect(code).toMatchSnapshot(); // log example
      });
    });
    describe('domain entity', () => {
      it('should throw an error if domain-entity does not have unique properties defined', () => {
        try {
          defineSqlSchemaGeneratorCodeForDomainObject({
            metadata: new DomainObjectMetadata({
              name: 'Carriage',
              extends: DomainObjectVariant.DOMAIN_ENTITY,
              properties: {
                id: {
                  type: DomainObjectPropertyType.NUMBER,
                  required: false,
                },
                uuid: {
                  type: DomainObjectPropertyType.STRING,
                  required: false,
                },
                cin: {
                  type: DomainObjectPropertyType.STRING,
                  required: true,
                },
                carries: {
                  type: DomainObjectPropertyType.ENUM,
                  of: ['PASSENGER', 'FREIGHT'],
                  required: true,
                },
                capacity: {
                  type: DomainObjectPropertyType.NUMBER,
                  nullable: true,
                },
              },
              decorations: {
                unique: null,
                updatable: [],
              },
            }),
            allMetadatas: [],
          });
          throw new Error('should not reach here');
        } catch (error) {
          expect(error.message).toContain(
            "domain entities must have at least one 'unique' property defined in order for a schema to be generated",
          );
        }
      });
      it('should throw an error if domain-entity does not have updatable properties defined', () => {
        try {
          defineSqlSchemaGeneratorCodeForDomainObject({
            metadata: new DomainObjectMetadata({
              name: 'Carriage',
              extends: DomainObjectVariant.DOMAIN_ENTITY,
              properties: {
                id: {
                  type: DomainObjectPropertyType.NUMBER,
                  required: false,
                },
                uuid: {
                  type: DomainObjectPropertyType.STRING,
                  required: false,
                },
                cin: {
                  type: DomainObjectPropertyType.STRING,
                  required: true,
                },
                carries: {
                  type: DomainObjectPropertyType.ENUM,
                  of: ['PASSENGER', 'FREIGHT'],
                  required: true,
                },
                capacity: {
                  type: DomainObjectPropertyType.NUMBER,
                  nullable: true,
                },
              },
              decorations: {
                unique: ['cin'],
                updatable: null,
              },
            }),
            allMetadatas: [],
          });
          throw new Error('should not reach here');
        } catch (error) {
          expect(error.message).toContain(
            "domain entities must have their 'updatable' properties defined in order for a schema to be generated.",
          );
        }
      });
      it('should create a correct looking sql-schema-generator object for a domain-entity', () => {
        const code = defineSqlSchemaGeneratorCodeForDomainObject({
          metadata: new DomainObjectMetadata({
            name: 'Carriage',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
            properties: {
              id: {
                type: DomainObjectPropertyType.NUMBER,
                required: false,
              },
              uuid: {
                type: DomainObjectPropertyType.STRING,
                required: false,
              },
              cin: {
                type: DomainObjectPropertyType.STRING,
                required: true,
              },
              carries: {
                type: DomainObjectPropertyType.ENUM,
                of: ['PASSENGER', 'FREIGHT'],
                required: true,
              },
              capacity: {
                type: DomainObjectPropertyType.NUMBER,
                nullable: true,
              },
            },
            decorations: {
              unique: ['cin'],
              updatable: [],
            },
          }),
          allMetadatas: [],
        });
        expect(code).toContain("import { Entity, prop } from 'sql-schema-generator'");
        expect(code).toContain('export const carriage = new Entity({');
        expect(code).toContain("name: 'carriage'");
        expect(code).not.toContain('id:'); // should be filtered out
        expect(code).not.toContain('uuid:'); // should be filtered out
        expect(code).toContain('cin: prop.VARCHAR(),');
        expect(code).toContain("carries: prop.ENUM(['PASSENGER', 'FREIGHT']),");
        expect(code).toContain('capacity: { ...prop.NUMERIC(), nullable: true },');
        expect(code).toContain("unique: ['cin'],");
        expect(code).toMatchSnapshot();
      });
    });
    describe('domain event', () => {
      it('should throw an error if unique properties are not defined for a domain-event', () => {
        try {
          defineSqlSchemaGeneratorCodeForDomainObject({
            metadata: new DomainObjectMetadata({
              name: 'TrainLocatedEvent',
              extends: DomainObjectVariant.DOMAIN_EVENT,
              properties: {
                id: {
                  type: DomainObjectPropertyType.NUMBER,
                  required: false,
                },
                trainUuid: {
                  type: DomainObjectPropertyType.STRING,
                  required: true,
                },
                occurredAt: {
                  type: DomainObjectPropertyType.DATE,
                  required: true,
                },
                geocode: {
                  type: DomainObjectPropertyType.REFERENCE,
                  of: {
                    name: 'Geocode',
                    extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
                  },
                  required: true,
                },
              },
              decorations: {
                unique: null,
                updatable: [],
              },
            }),
            allMetadatas: [],
          });
          throw new Error('should not reach here');
        } catch (error) {
          expect(error.message).toContain(
            "domain events must have at least one 'unique' property defined in order for a schema to be generated.",
          );
        }
      });
      it('should create a correct looking sql-schema-generator object for a domain-event', () => {
        const code = defineSqlSchemaGeneratorCodeForDomainObject({
          metadata: new DomainObjectMetadata({
            name: 'TrainLocatedEvent',
            extends: DomainObjectVariant.DOMAIN_EVENT,
            properties: {
              id: {
                type: DomainObjectPropertyType.NUMBER,
                required: false,
              },
              trainUuid: {
                type: DomainObjectPropertyType.STRING,
                required: true,
              },
              occurredAt: {
                type: DomainObjectPropertyType.DATE,
                required: true,
              },
              geocode: {
                type: DomainObjectPropertyType.REFERENCE,
                of: {
                  name: 'Geocode',
                  extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
                },
                required: true,
              },
            },
            decorations: {
              unique: ['trainUuid', 'occurredAt'],
              updatable: [],
            },
          }),
          allMetadatas: [],
        });
        expect(code).toContain("import { Event, prop } from 'sql-schema-generator'");
        expect(code).toContain('export const trainLocatedEvent = new Event({');
        expect(code).toContain("name: 'train_located_event'");
        expect(code).not.toContain(' id:'); // should be filtered out
        expect(code).not.toContain(' uuid:'); // should be filtered out
        expect(code).toContain('train_uuid: prop.VARCHAR(),');
        expect(code).toContain('occurred_at: prop.TIMESTAMPTZ(),');
        expect(code).toContain('geocode_id: prop.REFERENCES(geocode),');
        expect(code).toContain("unique: ['train_uuid', 'occurred_at'],");
        expect(code).toMatchSnapshot();
      });
    });
  });
  describe('unique', () => {
    // should be correct for null
    // should be correct for explicit one
    // should be correct for explicit more than one
    // should be correct for only on uuid
  });
});
