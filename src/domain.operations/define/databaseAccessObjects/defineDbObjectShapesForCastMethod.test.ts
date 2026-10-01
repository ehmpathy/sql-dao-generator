import { DomainObjectVariant } from 'domain-objects-metadata';
import { given, then, when } from 'test-fns';

import { defineDbObjectShapesForCastMethod } from './defineDbObjectShapesForCastMethod';

describe('defineDbObjectShapesForCastMethod', () => {
  given('[case1] a domain ENTITY', () => {
    const domainObject = {
      name: 'Carriage',
      extends: DomainObjectVariant.DOMAIN_ENTITY,
    } as any;

    when('[t0] its shapes are asked for', () => {
      const shapes = defineDbObjectShapesForCastMethod({ domainObject });

      then('it owes NO jsoned shape, since it can never arrive as json', () => {
        // .why = an entity is referenced, never nested, so the json path is unreachable for it
        expect(shapes.declarations).not.toContain('Jsoned');
        expect(shapes.inputType).not.toContain('Jsoned');
        expect(shapes.imports).not.toContain('AsJsonFromDbObject');
      });

      then('the upstream type is imported UNDER the strict name', () => {
        // .why = the upstream row IS the strict shape; renamed until `sql-code-generator#95`
        expect(shapes.imports).toEqual([
          "import { SqlQueryFindCarriageByIdOutput as SqlQueryFindCarriageByIdOutputStrict } from '$PATH_TO_GENERATED_SQL_TYPES';",
        ]);
      });

      then('its strict shape is re-exported, never re-declared', () => {
        expect(shapes.declarations).toContain(
          'export type { SqlQueryFindCarriageByIdOutputStrict };',
        );
      });

      then('the cast takes the strict shape alone', () => {
        expect(shapes.inputType).toContain(
          'dbObject: SqlQueryFindCarriageByIdOutputStrict,',
        );
      });
    });
  });

  given('[case2] a domain LITERAL', () => {
    const domainObject = {
      name: 'Geocode',
      extends: DomainObjectVariant.DOMAIN_LITERAL,
    } as any;

    when('[t0] its shapes are asked for', () => {
      const shapes = defineDbObjectShapesForCastMethod({ domainObject });

      then('the jsoned shape is the strict shape, jsoned', () => {
        expect(shapes.declarations).toContain(
          'AsJsonFromDbObject<SqlQueryFindGeocodeByIdOutputStrict>',
        );
      });

      then('the union is DECLARED by name, never spelled out inline', () => {
        expect(shapes.declarations).toContain(
          'export type SqlQueryFindGeocodeByIdOutput =',
        );
        expect(shapes.declarations).toContain(
          '| SqlQueryFindGeocodeByIdOutputStrict',
        );
        expect(shapes.declarations).toContain(
          '| SqlQueryFindGeocodeByIdOutputJsoned',
        );
      });

      then('the cast takes that declared union', () => {
        expect(shapes.inputType).toContain(
          'dbObject: SqlQueryFindGeocodeByIdOutput,',
        );
      });
    });
  });
});
