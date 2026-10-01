import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';
import { getError, given, then, when } from 'test-fns';

import {
  asFromDatabase,
  DbValueCastError,
} from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/.generated/casts';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import { getOneCastExpressionForProperty } from './getOneCastExpressionForProperty';

/**
 * .what = builds the one cast expression this definer yields for one named property
 * .why  = two of the three inputs are reached only through the relationship
 */
const getOneExpressionFor = (input: {
  domainObject: DomainObjectMetadata;
  property: string;
}): string | null => {
  const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
    domainObject: input.domainObject,
    allDomainObjects: [input.domainObject],
  });
  const pair = sqlSchemaRelationship.properties.find(
    (each) => each.domainObject?.name === input.property,
  );
  return getOneCastExpressionForProperty({
    sqlSchemaProperty: pair!.sqlSchema,
    domainObjectProperty: pair!.domainObject,
    domainObject: input.domainObject,
  });
};

/**
 * .what = declares an entity that carries one native `number[]` column
 * .why  = the one arm whose output is executable: its elements pass through a real cast
 */
const asDomainObjectWithNumberArray = (input: {
  nullable: boolean;
}): DomainObjectMetadata =>
  new DomainObjectMetadata({
    name: 'Region',
    extends: DomainObjectVariant.DOMAIN_ENTITY,
    properties: {
      id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
      uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
      latitudes: {
        name: 'latitudes',
        type: DomainObjectPropertyType.ARRAY,
        of: { type: DomainObjectPropertyType.NUMBER },
        nullable: input.nullable,
      },
    },
    decorations: {
      origin: null,
      alias: null,
      primary: null,
      unique: ['uuid'],
      updatable: [],
    },
  });

describe('getOneCastExpressionForProperty', () => {
  given(
    '[case1] a divergence-prone primitive array (a native `numeric[]` column)',
    () => {
      // .note = unreachable end-to-end until `sql-schema-generator`'s `ARRAY_OF` accepts native
      //         arrays; the definer is reachable, so it is proven here

      when('[t0] the generated expression is read as source', () => {
        const expression = getOneExpressionFor({
          domainObject: asDomainObjectWithNumberArray({ nullable: false }),
          property: 'latitudes',
        });

        then('it converts elementwise, via the cast itself', () => {
          expect(expression).toContain(
            'dbObject.latitudes.map(asFromDatabase.number)',
          );
        });

        then('it carries NO per-element null guard', () => {
          // .why = a per-element guard would make `number[]` hold nulls — an untruthful declaration
          expect(expression).not.toContain('value === null');
        });
      });

      when(
        '[t1] that generated expression is RUN against the generated cast',
        () => {
          // .why = the blast radius is a property of the definer's `.map` and the cast's refusal
          //        composed, so it is run rather than string-matched
          const evaluate = (input: { latitudes: unknown }): unknown => {
            const expression = getOneExpressionFor({
              domainObject: asDomainObjectWithNumberArray({ nullable: false }),
              property: 'latitudes',
            });
            // eslint-disable-next-line no-new-func -- the string under test IS generated code
            const run = new Function(
              'dbObject',
              'asFromDatabase',
              `return ({ ${expression} });`,
            ) as (
              dbObject: unknown,
              casts: typeof asFromDatabase,
            ) => { latitudes: unknown };
            return run(input, asFromDatabase).latitudes;
          };

          then('a clean array converts every element', () => {
            expect(evaluate({ latitudes: [1, '2', 3] })).toEqual([1, 2, 3]);
          });

          then('ONE null element refuses the WHOLE array', () => {
            // .why = `[1, null, 3]` is not a `number[]`, so the refusal is correct; its scope is the read
            // .note = the parser supply yields `null` for a NULL `int8[]` element: it holds no declared
            //         type, so it matches the node-postgres default. this cast holds one, and enforces it
            const error = getError(() => evaluate({ latitudes: [1, null, 3] }));
            expect(error).toBeInstanceOf(DbValueCastError);
            expect(error.message).toContain('neither a number nor a string');
          });
        },
      );

      when('[t2] the column is NULLABLE', () => {
        then(
          'the whole array short-circuits, rather than `.map` on null',
          () => {
            // .why = an unguarded `.map` on null raises a bare `TypeError`
            const expression = getOneExpressionFor({
              domainObject: asDomainObjectWithNumberArray({ nullable: true }),
              property: 'latitudes',
            });
            expect(expression).toContain(
              'dbObject.latitudes === null ? null :',
            );
          },
        );
      });
    },
  );

  given('[case2] a property with no domain-object counterpart', () => {
    when('[t0] the expression is defined', () => {
      then('it yields null, for the caller to drop', () => {
        // .why = a sql column may exist with no domain property
        expect(
          getOneCastExpressionForProperty({
            sqlSchemaProperty: { name: 'orphaned' } as never,
            domainObjectProperty: null as never,
            domainObject: asDomainObjectWithNumberArray({ nullable: false }),
          }),
        ).toEqual(null);
      });
    });
  });
});
