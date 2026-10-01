import pg from 'pg';
import { given, then, when } from 'test-fns';

import { setDbTypeParsers } from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/.generated/casts';

import {
  DAO_CAST_IMPL_DATE,
  DAO_CAST_IMPL_NUMBER,
  DAO_CASTS_MODULE_NAME,
  DAO_CASTS_NAMESPACE,
  DAO_GENERATED_DIR,
} from './constants';
import { defineDaoCastsCodeFile } from './defineDaoCastsCodeFile';

/**
 * .what = the oids the supply registers, and the handles a test needs to restore them
 * .why  = `pg.types` is a process-global with no reset api, so each test restores it
 */
const OIDS = [20, 1700, 1016] as const;

const getParsers = (): ((value: string) => unknown)[] =>
  OIDS.map(
    (oid) =>
      pg.types.getTypeParser(oid as never, 'text') as (
        value: string,
      ) => unknown,
  );

const setParsers = (parsers: ((value: string) => unknown)[]): void =>
  OIDS.forEach((oid, index) =>
    pg.types.setTypeParser(oid as never, parsers[index]!),
  );

describe('defineDaoCastsCodeFile', () => {
  // restore the registry around every case, so each begins from the node-postgres defaults
  const parsersBefore = getParsers();
  afterEach(() => setParsers(parsersBefore));

  given('[case1] the composed module', () => {
    // .note = the fixture is fresh by construction: `test:unit` regenerates it before jest runs
    const file = defineDaoCastsCodeFile();

    when('[t0] read as an artifact', () => {
      then('it is the ONE file, at the path every dao imports from', () => {
        expect(file.relpath).toEqual(
          `${DAO_GENERATED_DIR}/${DAO_CASTS_MODULE_NAME}.ts`,
        );
      });
    });

    when('[t1] read as source', () => {
      then('it exports the parser supply as a named operation', () => {
        expect(file.content).toContain('export const setDbTypeParsers');
      });

      then('it applies no parser at import', () => {
        // .why = supplied, not applied: a module-level `setTypeParser` would change every query in
        //        the consumer's process, not just these daos
        const linesTopLevel = file.content
          .split('\n')
          .filter((line) => line.startsWith('pg.types.setTypeParser'));
        expect(linesTopLevel).toEqual([]);
      });

      then('it registers EXACTLY the oids whose default disagrees', () => {
        // .why = 20/1700/1016 are the only oids whose default returns a string where the domain
        //        declared a number. 114 (json) is absent: the casts already cover the json path
        const oidsRegistered = [
          ...file.content.matchAll(/setTypeParser\((\d+)/g),
        ].map((match) => Number(match[1]));
        expect(oidsRegistered).toEqual([20, 1700, 1016]);
      });

      then('the namespace and the supply follow every cast they name', () => {
        // .why = both read the casts at module init; above them, the module throws at import
        const at = (needle: string): number => file.content.indexOf(needle);
        const atDate = at(`const ${DAO_CAST_IMPL_DATE} = (`);
        const atNumber = at(`const ${DAO_CAST_IMPL_NUMBER} = (`);
        const atNamespace = at(`export const ${DAO_CASTS_NAMESPACE} = {`);
        const atSupply = at('export const setDbTypeParsers');

        // each is present — an absent needle indexes -1 and would read as correctly ordered
        expect(
          [atDate, atNumber, atNamespace, atSupply].some((each) => each < 0),
        ).toEqual(false);
        expect(atDate).toBeLessThan(atNamespace);
        expect(atNumber).toBeLessThan(atNamespace);
        expect(atNumber).toBeLessThan(atSupply);
      });
    });
  });

  given('[case2] a process that carries the node-postgres defaults', () => {
    when('[t0] setDbTypeParsers is applied', () => {
      then('int8 and numeric are read as numbers, rather than strings', () => {
        setDbTypeParsers();
        expect(pg.types.getTypeParser(20 as never, 'text')('42')).toEqual(42);
        expect(pg.types.getTypeParser(1700 as never, 'text')('1.5')).toEqual(
          1.5,
        );
      });

      then('int8[] is read as numbers, empty and NULL elements kept', () => {
        // .why = a slice-and-split parser turns `'{}'` into `[NaN]`, and `Number('NULL')` is NaN;
        //        node-postgres' default yields `[]` and `null`
        setDbTypeParsers();
        const parse = pg.types.getTypeParser(1016 as never, 'text');
        expect(parse('{1,2,3}')).toEqual([1, 2, 3]);
        expect(parse('{}')).toEqual([]);
        expect(parse('{1,NULL,3}')).toEqual([1, null, 3]);
      });

      then(
        'an integer past MAX_SAFE_INTEGER is refused, never truncated',
        () => {
          // .why = a truncated int8 is a reference to the wrong row
          setDbTypeParsers();
          OIDS.forEach((oid) => {
            const parse = pg.types.getTypeParser(oid as never, 'text');
            const wire =
              oid === 1016 ? '{1,9007199254740993}' : '9007199254740993';
            expect(() => parse(wire)).toThrow(/beyond Number.MAX_SAFE_INTEGER/);
          });
        },
      );

      then('a numeric past the exponent range of a double is refused', () => {
        // .why = a `numeric` can hold `'1e999'`, which a js number reads as `Infinity`
        setDbTypeParsers();
        const parse = pg.types.getTypeParser(1700 as never, 'text');
        expect(() => parse('1e999')).toThrow(/not a finite number/);
      });

      then('timestamptz is left alone, since it already yields a Date', () => {
        const parseBefore = pg.types.getTypeParser(1184 as never, 'text');
        setDbTypeParsers();
        expect(pg.types.getTypeParser(1184 as never, 'text')).toBe(parseBefore);
      });
    });

    when('[t1] setDbTypeParsers is applied TWICE', () => {
      then('the second call changes naught, so it is idempotent', () => {
        setDbTypeParsers();
        const parsersAfterFirst = getParsers();

        setDbTypeParsers();
        expect(getParsers()).toEqual(parsersAfterFirst);
      });
    });
  });
});
