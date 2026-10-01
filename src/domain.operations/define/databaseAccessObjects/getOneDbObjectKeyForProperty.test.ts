import { given, then, when } from 'test-fns';

import { SqlSchemaPropertyMetadata } from '@src/domain.objects/SqlSchemaPropertyMetadata';
import {
  SqlSchemaReferenceMetadata,
  SqlSchemaReferenceMethod,
} from '@src/domain.objects/SqlSchemaReferenceMetadata';
import { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';

import { defineQuerySelectExpressionForSqlSchemaProperty } from './defineQuerySelectExpressionForSqlSchemaProperty';
import { getOneDbObjectKeyForProperty } from './getOneDbObjectKeyForProperty';

/**
 * .what = builds the sql-schema half of the input, with sane defaults per case
 * .why  = each case varies one axis (reference method, array-ness); the rest is noise
 */
const asSqlSchemaProperty = (input: {
  name: string;
  reference?: SqlSchemaReferenceMetadata | null;
  isArray?: boolean;
}) =>
  new SqlSchemaPropertyMetadata({
    name: input.name,
    isUpdatable: false,
    isNullable: false,
    isArray: input.isArray ?? false,
    isDatabaseGenerated: false,
    reference: input.reference ?? null,
  });

describe('getOneDbObjectKeyForProperty', () => {
  given('[case1] a property with NO domain-object counterpart', () => {
    when('[t0] the key is asked for', () => {
      then('it returns null, so both callers drop the property', () => {
        const key = getOneDbObjectKeyForProperty({
          sqlSchemaProperty: asSqlSchemaProperty({ name: 'internal_hash' }),
          domainObjectProperty: null,
        });
        expect(key).toEqual(null);
      });
    });
  });

  given('[case2] a NON-reference property', () => {
    when('[t0] the key is asked for', () => {
      then(
        'it is read by the sql column name, never by the domain name',
        () => {
          const key = getOneDbObjectKeyForProperty({
            sqlSchemaProperty: asSqlSchemaProperty({ name: 'created_at' }),
            domainObjectProperty: { name: 'createdAt' } as any,
          });
          expect(key).toEqual('created_at');
        },
      );
    });
  });

  given(
    '[case3] a DIRECT_BY_NESTING reference, i.e. a nested domain literal',
    () => {
      const reference = new SqlSchemaReferenceMetadata({
        method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
        of: { name: 'Geocode', extends: 'DomainLiteral' } as any,
      });

      when('[t0] the key is asked for', () => {
        then('it is read by the DOMAIN property name, snake-cased', () => {
          const key = getOneDbObjectKeyForProperty({
            sqlSchemaProperty: asSqlSchemaProperty({
              name: 'home_station_geocode_id',
              reference,
            }),
            domainObjectProperty: { name: 'homeStationGeocode' } as any,
          });
          // .why = a nested select is aliased to the domain property's name, never to the fk column
          expect(key).toEqual('home_station_geocode');
        });
      });
    },
  );

  given(
    '[case4] an IMPLICIT_BY_UUID reference, i.e. the `xUuid` convention',
    () => {
      const reference = new SqlSchemaReferenceMetadata({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: { name: 'Carriage', extends: 'DomainEntity' } as any,
      });

      when('[t0] the key is asked for', () => {
        then('it is read by the DOMAIN property name, snake-cased', () => {
          const key = getOneDbObjectKeyForProperty({
            sqlSchemaProperty: asSqlSchemaProperty({
              name: 'carriage_id',
              reference,
            }),
            domainObjectProperty: { name: 'carriageUuid' } as any,
          });
          expect(key).toEqual('carriage_uuid');
        });
      });
    },
  );

  given(
    '[case5] a DIRECT_BY_DECLARATION reference, i.e. `Ref<typeof X>`',
    () => {
      const reference = new SqlSchemaReferenceMetadata({
        method: SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION,
        of: { name: 'Carriage', extends: 'DomainEntity' } as any,
      });

      when('[t0] it is a SOLO reference', () => {
        then('the `_ref` suffix is swapped for `_uuid`', () => {
          const key = getOneDbObjectKeyForProperty({
            sqlSchemaProperty: asSqlSchemaProperty({
              name: 'carriage_id',
              reference,
            }),
            domainObjectProperty: { name: 'carriageRef' } as any,
          });
          // .why = the column is named for what it HOLDS (a uuid), never for how it was declared
          expect(key).toEqual('carriage_uuid');
        });
      });

      when('[t1] it is an ARRAY reference', () => {
        then('both halves pluralize at once — `_refs` becomes `_uuids`', () => {
          const key = getOneDbObjectKeyForProperty({
            sqlSchemaProperty: asSqlSchemaProperty({
              name: 'carriage_ids',
              reference,
              isArray: true,
            }),
            domainObjectProperty: { name: 'carriageRefs' } as any,
          });
          expect(key).toEqual('carriage_uuids');
        });
      });
    },
  );

  given('[case6] the two callers that must name ONE key', () => {
    when(
      '[t0] a declared ref is read by both the json `Pick` and the cast',
      () => {
        then(
          'they ask this one function, so they agree by construction',
          () => {
            // .why = the guard and the value must read one key; a guard on `carriage_ref` never fires
            const input = {
              sqlSchemaProperty: asSqlSchemaProperty({
                name: 'carriage_id',
                reference: new SqlSchemaReferenceMetadata({
                  method: SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION,
                  of: { name: 'Carriage', extends: 'DomainEntity' } as any,
                }),
              }),
              domainObjectProperty: { name: 'carriageRef' } as any,
            };
            expect(getOneDbObjectKeyForProperty(input)).toEqual(
              getOneDbObjectKeyForProperty(input),
            );
            expect(getOneDbObjectKeyForProperty(input)).toEqual(
              'carriage_uuid',
            );
          },
        );
      },
    );
  });

  given(
    '[case7] the QUERY definer and the CAST, which must name one key across definers',
    () => {
      when(
        '[t0] a declared-ref ARRAY is aliased by the query and read by the cast',
        () => {
          then(
            'the query alias equals the cast key, so the read cannot miss',
            () => {
              // .why = the query and the cast derive this name in different definers; this clamp holds
              //   them together. the array case pluralizes both halves, which a single-suffix regex misses
              const domainObjectProperty = { name: 'carriageRefs' } as any;
              const sqlSchemaProperty = asSqlSchemaProperty({
                name: 'carriage_ids',
                isArray: true,
                reference: new SqlSchemaReferenceMetadata({
                  method: SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION,
                  of: { name: 'Carriage', extends: 'DomainEntity' } as any,
                }),
              });

              const expression =
                defineQuerySelectExpressionForSqlSchemaProperty({
                  sqlSchemaName: 'train',
                  sqlSchemaProperty,
                  domainObjectProperty,
                  allSqlSchemaRelationships: [
                    new SqlSchemaToDomainObjectRelationship({
                      name: { domainObject: 'Carriage', sqlSchema: 'carriage' },
                      properties: [],
                      decorations: {
                        alias: { domainObject: null },
                        unique: { sqlSchema: null, domainObject: null },
                      },
                    }),
                  ],
                });
              const keyFromCast = getOneDbObjectKeyForProperty({
                sqlSchemaProperty,
                domainObjectProperty,
              });

              expect(keyFromCast).toEqual('carriage_uuids');
              expect(expression).toContain(` AS ${keyFromCast}`);
            },
          );
        },
      );
    },
  );
});
