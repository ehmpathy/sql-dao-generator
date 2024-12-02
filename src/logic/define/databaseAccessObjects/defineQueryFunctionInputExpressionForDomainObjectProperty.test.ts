import {
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import {
  defineQueryFunctionInputExpressionForDomainObjectProperty,
  GetTypescriptCodeForPropertyContext,
} from './defineQueryFunctionInputExpressionForDomainObjectProperty';

describe('defineQueryFunctionInputExpressionForDomainObjectProperty', () => {
  describe('for upsert', () => {
    it('should define the input expression correctly for a standard column-lookup property', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainEngineer',
          dobjInputVarName: 'trainEngineer',
          sqlSchemaProperty: {
            name: 'social_security_number_hash',
            isArray: false,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: null,
          },
          domainObjectProperty: {
            name: 'socialSecurityNumberHash',
            type: DomainObjectPropertyType.STRING,
          },
          allSqlSchemaRelationships: [], // not needed for this one
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        });
      expect(expression).toEqual(
        'socialSecurityNumberHash: trainEngineer.socialSecurityNumberHash',
      );
    });
    it('should define the input expression correctly for a solo IMPLICIT_BY_UUID reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'Train',
          dobjInputVarName: 'train',
          sqlSchemaProperty: {
            name: 'lead_engineer_id',
            isArray: false,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
              of: {
                name: 'TrainEngineer',
                extends: DomainObjectVariant.DOMAIN_ENTITY,
              },
            },
          },
          domainObjectProperty: {
            name: 'leadEngineerUuid',
            type: DomainObjectPropertyType.STRING,
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: {
                domainObject: 'TrainEngineer',
                sqlSchema: 'train_engineer',
              },
              properties: [],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ], // not needed for this one
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        });
      expect(expression).toEqual('leadEngineerUuid: train.leadEngineerUuid');
    });
    it('should define the input expression correctly for a solo DIRECT_BY_NESTING reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainLocatedEvent',
          dobjInputVarName: 'trainLocatedEvent',
          sqlSchemaProperty: {
            name: 'geocode_id',
            isArray: false,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObjectProperty: {
            name: 'geocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Geocode', sqlSchema: 'geocode' },
              properties: [
                {
                  domainObject: {
                    name: 'latitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'latitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
                {
                  domainObject: {
                    name: 'longitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'longitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
              ],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        });
      expect(expression).toEqual(
        'geocodeId: trainLocatedEvent.geocode.id ? trainLocatedEvent.geocode.id : (await geocodeDao.upsert({ geocode: trainLocatedEvent.geocode }, context)).id',
      );
    });
    it('should define the input expression correctly for a solo, aliased, DIRECT_BY_NESTING reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainLocatedEvent',
          dobjInputVarName: 'trainLocatedEvent',
          sqlSchemaProperty: {
            name: 'geocode_id',
            isArray: false,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObjectProperty: {
            name: 'geocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Geocode', sqlSchema: 'geocode' },
              properties: [
                {
                  domainObject: {
                    name: 'latitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'latitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
                {
                  domainObject: {
                    name: 'longitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'longitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
              ],
              decorations: {
                alias: { domainObject: 'geo' },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        });
      expect(expression).toEqual(
        'geocodeId: trainLocatedEvent.geocode.id ? trainLocatedEvent.geocode.id : (await geocodeDao.upsert({ geo: trainLocatedEvent.geocode }, context)).id',
      );
    });
    it('should define the input expression correctly for a solo, nullable, DIRECT_BY_NESTING reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainLocatedEvent',
          dobjInputVarName: 'trainLocatedEvent',
          sqlSchemaProperty: {
            name: 'geocode_id',
            isArray: false,
            isNullable: true,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObjectProperty: {
            name: 'geocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Geocode', sqlSchema: 'geocode' },
              properties: [
                {
                  domainObject: {
                    name: 'latitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'latitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
                {
                  domainObject: {
                    name: 'longitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'longitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
              ],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        });
      expect(expression).toEqual(
        'geocodeId: trainLocatedEvent.geocode === null ? null : trainLocatedEvent.geocode.id ? trainLocatedEvent.geocode.id : (await geocodeDao.upsert({ geocode: trainLocatedEvent.geocode }, context)).id',
      );
    });
    it('should define the input expression correctly for a solo, nullable, DIRECT_BY_DECLARATION reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'CarriageCargo',
          dobjInputVarName: 'carriageCargo',
          sqlSchemaProperty: {
            name: 'carriage_id',
            isArray: false,
            isNullable: true,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION,
              of: {
                name: 'Carriage',
                extends: DomainObjectVariant.DOMAIN_ENTITY,
              },
            },
          },
          domainObjectProperty: {
            name: 'carriageRef',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Carriage',
              extends: DomainObjectVariant.DOMAIN_ENTITY,
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Carriage', sqlSchema: 'carriage' },
              properties: [
                {
                  domainObject: {
                    name: 'uuid',
                    type: DomainObjectPropertyType.STRING,
                  },
                  sqlSchema: {
                    name: 'uuid',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: true,
                    reference: null,
                  },
                },
                // todo: do we need other properties here?
              ],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        });
      expect(expression).toEqual(
        `carriageUuid: carriageCargo.carriageRef === null ? null : isPrimaryKeyRef({ of: Carriage })(carriageCargo.carriageRef) ? carriageCargo.carriageRef.uuid : (await carriageDao.findByRef({ ref: carriageCargo.carriageRef }, context).expect('isPresent')).uuid`,
      );
    });
    it('should define the input expression correctly for an array of IMPLICIT_BY_UUID references', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'Train',
          dobjInputVarName: 'train',
          sqlSchemaProperty: {
            name: 'assigned_engineer_ids',
            isArray: true,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
              of: {
                name: 'TrainEngineer',
                extends: DomainObjectVariant.DOMAIN_ENTITY,
              },
            },
          },
          domainObjectProperty: {
            name: 'assignedEngineerUuids',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.STRING,
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: {
                domainObject: 'TrainEngineer',
                sqlSchema: 'train_engineer',
              },
              properties: [],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ], // not needed for this one
          context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
        });
      expect(expression).toEqual('assignedEngineerUuids');
    });
    it('should define the input expression correctly for an array of DIRECT_BY_NESTING reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainLocatedEvent',
          dobjInputVarName: 'trainLocatedEvent',
          sqlSchemaProperty: {
            name: 'geocode_ids',
            isArray: true,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObjectProperty: {
            name: 'geocodes',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Geocode', sqlSchema: 'geocode' },
              properties: [
                {
                  domainObject: {
                    name: 'latitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'latitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
                {
                  domainObject: {
                    name: 'longitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'longitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
              ],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        });
      expect(expression).toEqual(
        'geocodeIds: await Promise.all(trainLocatedEvent.geocodes.map(async (geocode) => geocode.id ? geocode.id : (await geocodeDao.upsert({ geocode }, context)).id))',
      );
    });
    it('should define the input expression correctly for an array of, aliased, DIRECT_BY_NESTING reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainLocatedEvent',
          dobjInputVarName: 'trainLocatedEvent',
          sqlSchemaProperty: {
            name: 'geocode_ids',
            isArray: true,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObjectProperty: {
            name: 'geocodes',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Geocode', sqlSchema: 'geocode' },
              properties: [
                {
                  domainObject: {
                    name: 'latitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'latitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
                {
                  domainObject: {
                    name: 'longitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'longitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
              ],
              decorations: {
                alias: { domainObject: 'geo' },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_UPSERT_QUERY,
        });
      expect(expression).toEqual(
        'geocodeIds: await Promise.all(trainLocatedEvent.geocodes.map(async (geo) => geo.id ? geo.id : (await geocodeDao.upsert({ geo }, context)).id))',
      );
    });
  });
  describe('for query', () => {
    it('should define the input expression correctly for a standard column-lookup property', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainEngineer',
          dobjInputVarName: 'trainEngineer',
          sqlSchemaProperty: {
            name: 'social_security_number_hash',
            isArray: false,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: null,
          },
          domainObjectProperty: {
            name: 'socialSecurityNumberHash',
            type: DomainObjectPropertyType.STRING,
          },
          allSqlSchemaRelationships: [], // not needed for this one
          context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
        });
      expect(expression).toEqual('socialSecurityNumberHash');
    });
    it('should define the input expression correctly for a solo IMPLICIT_BY_UUID reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'Train',
          dobjInputVarName: 'train',
          sqlSchemaProperty: {
            name: 'lead_engineer_id',
            isArray: false,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
              of: {
                name: 'TrainEngineer',
                extends: DomainObjectVariant.DOMAIN_ENTITY,
              },
            },
          },
          domainObjectProperty: {
            name: 'leadEngineerUuid',
            type: DomainObjectPropertyType.STRING,
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: {
                domainObject: 'TrainEngineer',
                sqlSchema: 'train_engineer',
              },
              properties: [],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ], // not needed for this one
          context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
        });
      expect(expression).toEqual('leadEngineerUuid');
    });
    it('should define the input expression correctly for a solo DIRECT_BY_NESTING reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainLocatedEvent',
          dobjInputVarName: 'trainLocatedEvent',
          sqlSchemaProperty: {
            name: 'geocode_id',
            isArray: false,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObjectProperty: {
            name: 'geocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Geocode', sqlSchema: 'geocode' },
              properties: [
                {
                  domainObject: {
                    name: 'latitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'latitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
                {
                  domainObject: {
                    name: 'longitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'longitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
              ],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
        });
      expect(expression).toEqual(
        'geocodeId: geocode.id ? geocode.id : ((await geocodeDao.findByUnique(geocode, context))?.id ?? -1)',
      );
    });
    it('should define the input expression correctly for a solo, nullable, DIRECT_BY_NESTING reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainLocatedEvent',
          dobjInputVarName: 'trainLocatedEvent',
          sqlSchemaProperty: {
            name: 'geocode_id',
            isArray: false,
            isNullable: true,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObjectProperty: {
            name: 'geocode',
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'Geocode',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Geocode', sqlSchema: 'geocode' },
              properties: [
                {
                  domainObject: {
                    name: 'latitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'latitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
                {
                  domainObject: {
                    name: 'longitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'longitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
              ],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
        });
      expect(expression).toEqual(
        'geocodeId: geocode === null ? null : geocode.id ? geocode.id : ((await geocodeDao.findByUnique(geocode, context))?.id ?? -1)',
      );
    });
    it('should define the input expression correctly for an array of IMPLICIT_BY_UUID references', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'Train',
          dobjInputVarName: 'train',
          sqlSchemaProperty: {
            name: 'assigned_engineer_ids',
            isArray: true,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
              of: {
                name: 'TrainEngineer',
                extends: DomainObjectVariant.DOMAIN_ENTITY,
              },
            },
          },
          domainObjectProperty: {
            name: 'assignedEngineerUuids',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.STRING,
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: {
                domainObject: 'TrainEngineer',
                sqlSchema: 'train_engineer',
              },
              properties: [],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ], // not needed for this one
          context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
        });
      expect(expression).toEqual('assignedEngineerUuids');
    });
    it('should define the input expression correctly for an array of DIRECT_BY_NESTING reference', () => {
      const expression =
        defineQueryFunctionInputExpressionForDomainObjectProperty({
          domainObjectName: 'TrainLocatedEvent',
          dobjInputVarName: 'trailLocatedEvent',
          sqlSchemaProperty: {
            name: 'geocode_ids',
            isArray: true,
            isNullable: false,
            isUpdatable: false,
            isDatabaseGenerated: false,
            reference: {
              method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObjectProperty: {
            name: 'geocodes',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'Geocode',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          allSqlSchemaRelationships: [
            new SqlSchemaToDomainObjectRelationship({
              name: { domainObject: 'Geocode', sqlSchema: 'geocode' },
              properties: [
                {
                  domainObject: {
                    name: 'latitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'latitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
                {
                  domainObject: {
                    name: 'longitude',
                    type: DomainObjectPropertyType.NUMBER,
                  },
                  sqlSchema: {
                    name: 'longitude',
                    isArray: false,
                    isNullable: false,
                    isUpdatable: false,
                    isDatabaseGenerated: false,
                    reference: null,
                  },
                },
              ],
              decorations: {
                alias: { domainObject: null },
                unique: { sqlSchema: null, domainObject: null },
              },
            }),
          ],
          context: GetTypescriptCodeForPropertyContext.FOR_FIND_BY_QUERY,
        });
      expect(expression).toEqual(
        'geocodeIds: await Promise.all(geocodes.map(async (geocode) => geocode.id ? geocode.id : ((await geocodeDao.findByUnique(geocode, context))?.id ?? -1) ))',
      );
    });
  });
});
