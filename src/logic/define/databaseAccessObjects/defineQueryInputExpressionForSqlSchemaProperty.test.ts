import {
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { defineQueryInputExpressionForSqlSchemaProperty } from './defineQueryInputExpressionForSqlSchemaProperty';

describe('defineQueryInputExpressionForSqlSchemaProperty', () => {
  it('should define the input expression correctly for a standard column-lookup property', () => {
    const expression = defineQueryInputExpressionForSqlSchemaProperty({
      sqlSchemaName: 'train_engineer',
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
    });
    expect(expression).toEqual(':socialSecurityNumberHash');
  });
  it('should define the input expression correctly for a solo IMPLICIT_BY_UUID reference', () => {
    const expression = defineQueryInputExpressionForSqlSchemaProperty({
      sqlSchemaName: 'train',
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
          name: { domainObject: 'TrainEngineer', sqlSchema: 'train_engineer' },
          properties: [],
          decorations: { unique: { sqlSchema: null, domainObject: null } },
        }),
      ], // not needed for this one
    });
    expect(expression).toEqual(
      '(SELECT id FROM train_engineer WHERE train_engineer.uuid = :leadEngineerUuid)',
    );
  });
  it('should define the input expression correctly for a solo DIRECT_BY_NESTING reference', () => {
    const expression = defineQueryInputExpressionForSqlSchemaProperty({
      sqlSchemaName: 'train_located_event',
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
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
          },
        },
      },
      domainObjectProperty: {
        name: 'geocode',
        type: DomainObjectPropertyType.REFERENCE,
        of: {
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          decorations: { unique: { sqlSchema: null, domainObject: null } },
        }),
      ],
    });
    expect(expression).toEqual(':geocodeId');
  });
  it('should define the input expression correctly for an array of IMPLICIT_BY_UUID references', () => {
    const expression = defineQueryInputExpressionForSqlSchemaProperty({
      sqlSchemaName: 'train',
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
          name: { domainObject: 'TrainEngineer', sqlSchema: 'train_engineer' },
          properties: [],
          decorations: { unique: { sqlSchema: null, domainObject: null } },
        }),
      ], // not needed for this one
    });
    expect(expression).toContain('COALESCE(array_agg(train_engineer.id'); // should select an array of ids, with coalesce to treat empty array
    expect(expression).toContain(
      'array_agg(train_engineer.id ORDER BY train_engineer_ref.array_order_index)',
    ); // should select them by persisted array order
    expect(expression).toContain('FROM train_engineer'); // from the right table
    expect(expression).toContain(
      'JOIN unnest(:assignedEngineerUuids::uuid[]) WITH ORDINALITY',
    ); // using 'unnest' for performance gains,  using "ordinality" so that we can preserve persisted array_order_index
    expect(expression).toContain(
      'train_engineer_ref (uuid, array_order_index)',
    ); // name the unnested w/ ordinality table well
    expect(expression).toContain(
      'ON train_engineer.uuid = train_engineer_ref.uuid',
    ); // filtered on the right id
    expect(expression).toMatchSnapshot();
  });
  it('should define the input expression correctly for an array of DIRECT_BY_NESTING reference', () => {
    const expression = defineQueryInputExpressionForSqlSchemaProperty({
      sqlSchemaName: 'train_located_event',
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
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
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
          decorations: { unique: { sqlSchema: null, domainObject: null } },
        }),
      ],
    });
    expect(expression).toEqual(':geocodeIds');
  });
});
