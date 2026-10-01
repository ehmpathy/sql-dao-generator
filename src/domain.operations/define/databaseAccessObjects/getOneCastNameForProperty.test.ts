import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';
import { given, then, when } from 'test-fns';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import {
  DAO_CAST_IMPL_DATE,
  DAO_CAST_IMPL_NUMBER,
  DAO_CAST_NAME_DATE,
  DAO_CAST_NAME_NUMBER,
  DAO_CASTS_MODULE_NAME,
  DAO_CASTS_NAMESPACE,
  DAO_GENERATED_DIR,
} from './constants';
import { defineDaoCastsCodeFile } from './defineDaoCastsCodeFile';
import { getOneCastNameForProperty } from './getOneCastNameForProperty';

/**
 * .what = the cast name this definer answers for one named property
 * .why  = the answer is reached only through the relationship, which pairs property and column
 */
const getOneCastNameFor = (input: {
  domainObject: DomainObjectMetadata;
  allDomainObjects?: DomainObjectMetadata[];
  property: string;
}): string | null => {
  const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
    domainObject: input.domainObject,
    allDomainObjects: input.allDomainObjects ?? [input.domainObject],
  });
  const pair = sqlSchemaRelationship.properties.find(
    (each) => each.domainObject?.name === input.property,
  );
  return getOneCastNameForProperty({
    sqlSchemaProperty: pair!.sqlSchema,
    domainObjectProperty: pair!.domainObject,
  });
};

const asGeocode = (): DomainObjectMetadata =>
  new DomainObjectMetadata({
    name: 'Geocode',
    extends: DomainObjectVariant.DOMAIN_LITERAL,
    properties: {
      latitude: { name: 'latitude', type: DomainObjectPropertyType.NUMBER },
    },
    decorations: {
      origin: null,
      alias: null,
      primary: null,
      unique: null,
      updatable: null,
    },
  });

const asDomainObjectWithEveryPropertyType = (): DomainObjectMetadata =>
  new DomainObjectMetadata({
    name: 'Station',
    extends: DomainObjectVariant.DOMAIN_ENTITY,
    properties: {
      id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
      uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
      openedAt: { name: 'openedAt', type: DomainObjectPropertyType.DATE },
      capacity: { name: 'capacity', type: DomainObjectPropertyType.NUMBER },
      name: { name: 'name', type: DomainObjectPropertyType.STRING },
      staffed: { name: 'staffed', type: DomainObjectPropertyType.BOOLEAN },
      geocode: {
        name: 'geocode',
        type: DomainObjectPropertyType.REFERENCE,
        of: {
          name: 'Geocode',
          extends: DomainObjectVariant.DOMAIN_LITERAL,
        },
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

describe('getOneCastNameForProperty', () => {
  given(
    '[case1] a domain object that declares one property of each kind',
    () => {
      const domainObject = asDomainObjectWithEveryPropertyType();
      const allDomainObjects = [domainObject, asGeocode()];
      const getCastNameFor = (property: string) =>
        getOneCastNameFor({ domainObject, allDomainObjects, property });

      when(
        '[t0] the property type DIVERGES across the two serializations',
        () => {
          then('a DATE gets the date cast', () => {
            // .why = a `timestamptz` arrives as a `Date` raw and an iso string inside json
            expect(getCastNameFor('openedAt')).toEqual(DAO_CAST_NAME_DATE);
          });

          then('a NUMBER gets the number cast', () => {
            // .why = a raw `numeric` is a `number` or a `string`, per the consumer's pg type parsers
            expect(getCastNameFor('capacity')).toEqual(DAO_CAST_NAME_NUMBER);
          });
        },
      );

      when('[t1] the property type AGREES across both serializations', () => {
        then('a STRING gets no cast', () => {
          // .why = a cast on a type that never diverges is cost with no defect behind it
          expect(getCastNameFor('name')).toEqual(null);
        });

        then('a BOOLEAN gets no cast', () => {
          expect(getCastNameFor('staffed')).toEqual(null);
        });
      });

      when('[t2] the property is a REFERENCE', () => {
        then('it gets no cast, whatever the referenced object holds', () => {
          // .why = the nested dao runs its own cast over the whole bag
          expect(getCastNameFor('geocode')).toEqual(null);
        });
      });
    },
  );

  given('[case2] a sql column with no domain-object counterpart', () => {
    when('[t0] the cast name is asked for', () => {
      then('it yields null, for the caller to drop', () => {
        expect(
          getOneCastNameForProperty({
            sqlSchemaProperty: { name: 'orphaned' } as never,
            domainObjectProperty: null as never,
          }),
        ).toEqual(null);
      });
    });
  });

  given('[case3] the generated casts these names must match', () => {
    // .why = the drift clamp: the template literal and this definer's answer hold one string, and
    //        no compiler relates them
    // .note = the composer is read, since the composed module is what a dao imports from
    const content = defineDaoCastsCodeFile().content;

    /**
     * .what = walks one cast's full chain — call name -> member -> implementation -> declaration
     * .why  = a break at any link ships a dao whose import succeeds and whose call is `undefined`
     */
    const expectCastChain = (input: {
      callName: string;
      implName: string;
    }): void => {
      const [namespace, member, ...rest] = input.callName.split('.');
      expect([namespace, rest.length]).toEqual([DAO_CASTS_NAMESPACE, 0]);
      expect(content).toContain(`export const ${DAO_CASTS_NAMESPACE} = {`);
      expect(content).toContain(`  ${member}: ${input.implName},`);
      expect(content).toContain(`const ${input.implName} = (value: `);
    };

    when('[t0] each cast name is walked to its implementation', () => {
      then('the date cast is reachable at the name the definer answers', () => {
        expectCastChain({
          callName: DAO_CAST_NAME_DATE,
          implName: DAO_CAST_IMPL_DATE,
        });
      });

      then(
        'the number cast is reachable at the name the definer answers',
        () => {
          expectCastChain({
            callName: DAO_CAST_NAME_NUMBER,
            implName: DAO_CAST_IMPL_NUMBER,
          });
        },
      );

      then('each implementation is declared, never exported', () => {
        // .why = the namespace is the one public surface; an export would add a second name
        expect(content).not.toContain(`export const ${DAO_CAST_IMPL_DATE}`);
        expect(content).not.toContain(`export const ${DAO_CAST_IMPL_NUMBER}`);
      });

      then('that module is the one the generated daos import from', () => {
        // .why = a cast in a module no dao points at is a cast nobody can call
        expect(defineDaoCastsCodeFile().relpath).toEqual(
          `${DAO_GENERATED_DIR}/${DAO_CASTS_MODULE_NAME}.ts`,
        );
      });
    });
  });
});
