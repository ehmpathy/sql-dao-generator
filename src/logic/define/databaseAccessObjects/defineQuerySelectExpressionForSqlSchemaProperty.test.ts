import { DomainObjectPropertyType, DomainObjectVariant } from 'domain-objects-metadata';
import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { defineQuerySelectExpressionForSqlSchemaProperty } from './defineQuerySelectExpressionForSqlSchemaProperty';

describe('defineQuerySelectExpressionForSqlSchemaProperty', () => {
  it('should define the select expression correctly for a standard column-lookup property', () => {
    const expression = defineQuerySelectExpressionForSqlSchemaProperty({
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
    expect(expression).toEqual('train_engineer.social_security_number_hash');
  });
  it('should define the select expression correctly for a solo IMPLICIT_BY_UUID reference', () => {
    const expression = defineQuerySelectExpressionForSqlSchemaProperty({
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
    expect(expression).toContain('SELECT train_engineer.uuid'); // should select the uuid
    expect(expression).toContain('FROM train_engineer'); // from the right table
    expect(expression).toContain('WHERE train_engineer.id = train.lead_engineer_id'); // filtered on the right id
    expect(expression).toContain('AS lead_engineer_uuid'); // with the correct output name
    expect(expression).toMatchSnapshot();
  });
  it('should define the select expression correctly for a solo DIRECT_BY_NESTING reference', () => {
    const expression = defineQuerySelectExpressionForSqlSchemaProperty({
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
              domainObject: { name: 'latitude', type: DomainObjectPropertyType.NUMBER },
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
              domainObject: { name: 'longitude', type: DomainObjectPropertyType.NUMBER },
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
    expect(expression).toContain('SELECT json_build_object'); // should grab a json object
    expect(expression).toContain('FROM geocode'); // from the right table
    expect(expression).toContain('WHERE geocode.id = train_located_event.geocode_id'); // filtered on the right id
    expect(expression).toContain('AS geocode'); // with the correct output name
    expect(expression).toMatchSnapshot();
  });
  it('should define the select expression correctly for an array of IMPLICIT_BY_UUID references', () => {
    const expression = defineQuerySelectExpressionForSqlSchemaProperty({
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
    expect(expression).toContain('SELECT COALESCE(array_agg(train_engineer.uuid'); // should select an array of uuids, with coalesce to treat empty array
    expect(expression).toContain('array_agg(train_engineer.uuid ORDER BY train_engineer_ref.array_order_index)'); // should select them by persisted array order
    expect(expression).toContain('FROM train_engineer'); // from the right table
    expect(expression).toContain('JOIN unnest(train.assigned_engineer_ids) WITH ORDINALITY'); // using 'unnest' for performance gains,  using "ordinality" so that we can preserve persisted array_order_index
    expect(expression).toContain('train_engineer_ref (id, array_order_index)'); // name the unnested w/ ordinality table well
    expect(expression).toContain('ON train_engineer.id = train_engineer_ref.id'); // filtered on the right id
    expect(expression).toContain('AS assigned_engineer_uuids'); // with the correct output name
    expect(expression).toMatchSnapshot();
  });
  it('should define the select expression correctly for an array of DIRECT_BY_NESTING reference', () => {
    const expression = defineQuerySelectExpressionForSqlSchemaProperty({
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
              domainObject: { name: 'latitude', type: DomainObjectPropertyType.NUMBER },
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
              domainObject: { name: 'longitude', type: DomainObjectPropertyType.NUMBER },
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
    expect(expression).toContain('SELECT COALESCE('); // with coalesce to treat empty array
    expect(expression).toContain('json_build_object('); // should grab a json object
    expect(expression).toContain('FROM geocode'); // from the right table
    expect(expression).toContain('JOIN unnest(train_located_event.geocode_ids) WITH ORDINALITY'); // using 'unnest' for performance gains,  using "ordinality" so that we can preserve persisted array_order_index
    expect(expression).toContain('geocode_ref (id, array_order_index)'); // name the unnested w/ ordinality table well
    expect(expression).toContain('ON geocode.id = geocode_ref.id'); // filtered on the right id
    expect(expression).toContain('AS geocodes'); // with the correct output name
    expect(expression).toMatchSnapshot();
  });
});
