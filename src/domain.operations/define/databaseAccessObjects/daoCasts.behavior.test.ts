import { getError, given, then, when } from 'test-fns';

import type { AsJsonFromDbObject } from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/.generated/casts';
import {
  asFromDatabase,
  DbValueCastError,
} from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/.generated/casts';

/**
 * .what = the behavior of the cast operations this generator defines
 * .why  = it exercises the GENERATED module, the code a consumer receives, not a copy of it
 * .note  = the fixture is fresh by construction: `test:unit` regenerates it before jest runs
 */
describe('the dao casts this generator defines', () => {
  given('[case1] a value that arrived from a raw column select', () => {
    when('[t0] it is a Date', () => {
      then('the SAME Date is returned, by reference', () => {
        // .why = raw-path consumers see no change. `new Date(value)` would pass `toEqual` and fail this
        const value = new Date('2026-08-02T12:34:56.789Z');
        expect(asFromDatabase.date(value)).toBe(value);
      });
    });

    when('[t1] it is a number', () => {
      then('the same number is returned, zero and fractions included', () => {
        expect(asFromDatabase.number(42)).toEqual(42);
        expect(asFromDatabase.number(30.1234)).toEqual(30.1234);
        expect(asFromDatabase.number(0)).toEqual(0);
      });
    });

    when(
      '[t2] a numeric or bigserial arrived as a string, per the pg default',
      () => {
        then('it is cast to the number the domain declares', () => {
          expect(asFromDatabase.number('30.1234')).toEqual(30.1234);
          expect(asFromDatabase.number('7')).toEqual(7);
          expect(asFromDatabase.number('-7')).toEqual(-7);
          expect(asFromDatabase.number('1.5e+2')).toEqual(150);
        });
      },
    );
  });

  given('[case2] a value that arrived from inside json_build_object', () => {
    when('[t0] a timestamptz arrived as an iso-8601 string', () => {
      then('it is cast to the Date the domain declares', () => {
        const cast = asFromDatabase.date('2026-08-02T12:34:56.789Z');
        expect(cast).toBeInstanceOf(Date);
        expect(cast.toISOString()).toEqual('2026-08-02T12:34:56.789Z');
      });

      then('the two serializations land on one runtime value', () => {
        // .why = the wish's acceptance at one value: raw and json paths converge
        const fromRaw = asFromDatabase.date(
          new Date('2026-08-02T12:34:56.789Z'),
        );
        const fromJson = asFromDatabase.date('2026-08-02T12:34:56.789Z');
        expect(fromJson.getTime()).toEqual(fromRaw.getTime());
      });

      then('a numeric offset keeps its instant', () => {
        // .why = pg renders a timestamptz into json with an offset, not a `Z`
        expect(
          asFromDatabase.date('2026-08-02T12:34:56.789-07:00').toISOString(),
        ).toEqual('2026-08-02T19:34:56.789Z');
      });
    });

    when('[t1] a numeric arrived as a json number', () => {
      then('it is returned unchanged, so both paths agree', () => {
        expect(asFromDatabase.number(30.1234)).toEqual(
          asFromDatabase.number('30.1234'),
        );
      });
    });
  });

  given('[case3] a value the cast can not honor', () => {
    when('[t0] a date string this runtime can not parse', () => {
      then('it throws, and never returns an Invalid Date', () => {
        // .why = an Invalid Date would satisfy the declared type and poison every read downstream
        const error = getError(() => asFromDatabase.date('not-a-date'));
        expect(error).toBeInstanceOf(DbValueCastError);
        expect(getError(() => asFromDatabase.date(''))).toBeInstanceOf(
          DbValueCastError,
        );
      });

      then(
        'the rejected value is reachable as metadata, and redactable',
        () => {
          // .why = the value is consumer data; `.redact(['metadata'])` drops it and keeps the diagnosis
          const error = getError(() =>
            asFromDatabase.date('not-a-date'),
          ) as DbValueCastError;
          expect(error.metadata.value).toEqual('not-a-date');
          expect(error.metadata.valueTypeof).toEqual('string');
          expect(error.redact(['metadata']).message).not.toContain(
            'not-a-date',
          );
        },
      );

      then('it classifies as a CALLER fault, so a cli and an api agree', () => {
        // .why = the caller declared a type their column can not honor
        const error = getError(() =>
          asFromDatabase.date('not-a-date'),
        ) as DbValueCastError;
        expect(error.code).toEqual({ http: 400, exit: 2 });
      });
    });

    when('[t1] a number string that is not a finite number', () => {
      // .why = `Infinity` poisons every sum downstream, and `Number('')` is 0, not NaN
      then('text, blank, and non-finite strings all throw', () => {
        ['abc', '', '   ', 'Infinity', '-Infinity', '1e999'].forEach((value) =>
          expect(getError(() => asFromDatabase.number(value))).toBeInstanceOf(
            DbValueCastError,
          ),
        );
      });

      then('an already-Infinity number throws too, so both arms agree', () => {
        const error = getError(() =>
          asFromDatabase.number(Number.POSITIVE_INFINITY),
        );
        expect(error).toBeInstanceOf(DbValueCastError);
      });
    });

    when(
      '[t2] a value of neither declared type, which typescript can not stop',
      () => {
        // .why = a hand-written query typed `any` bypasses the declared input type, and
        //        `Number(null)` / `Number(true)` would return a plausible 0 / 1
        // .note = `as never` pins what the runtime does when the compiler is not the caller
        then('the number cast throws on null, boolean, and array', () => {
          [null, true, []].forEach((value) =>
            expect(
              getError(() => asFromDatabase.number(value as never)),
            ).toBeInstanceOf(DbValueCastError),
          );
        });

        then(
          'the date cast throws a DbValueCastError, never a TypeError',
          () => {
            [null, 1757376000000].forEach((value) =>
              expect(
                getError(() => asFromDatabase.date(value as never)),
              ).toBeInstanceOf(DbValueCastError),
            );
          },
        );
      },
    );

    when('[t3] an integer past Number.MAX_SAFE_INTEGER', () => {
      // .why = a bigserial past 2^53 can not be held by a js number; a return is a wrong id
      then('it throws, however it is written', () => {
        [
          '9007199254740993',
          '9007199254740993.0',
          '9007199254740993.5',
          '1e+21',
          Number('9007199254740993'),
        ].forEach((value) =>
          expect(getError(() => asFromDatabase.number(value))).toBeInstanceOf(
            DbValueCastError,
          ),
        );
      });

      then(
        'the value AT the bound is returned, since it is held without loss',
        () => {
          expect(
            asFromDatabase.number(String(Number.MAX_SAFE_INTEGER)),
          ).toEqual(Number.MAX_SAFE_INTEGER);
        },
      );

      then('the error names the fix the consumer can take', () => {
        const error = getError(() => asFromDatabase.number('9007199254740993'));
        expect(error.message).toContain('declare the property as a string');
      });
    });
  });

  given('[case4] the json shape type this generator defines', () => {
    /**
     * .what = the type-level cases for `AsJsonFromDbObject`
     * .note  = `Expect<Equals<…>>` fails `npm run test:types`, never jest (swc strips types). each
     *          case also feeds a value of the mapped type through a real cast
     */

    /**
     * .what = `Expect<Equals<A, B>>` errors unless A and B are the SAME type, not merely assignable
     * .why  = a pair of assignments does not bite: control flow narrows each `const`, so it stayed
     *         green on a non-distributive `AsJsonFromDbObject`. this form goes red
     * .note  = hand-rolled; neither `type-fns` nor `test-fns` ships one
     */
    type Equals<A, B> =
      (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
        ? true
        : false;
    type Expect<T extends true> = T;

    when('[t0] a Date crosses into json', () => {
      then('it becomes a string, which the date cast then accepts', () => {
        type _case = Expect<Equals<AsJsonFromDbObject<Date>, string>>;
        const fromJson: AsJsonFromDbObject<Date> = '2026-08-02T12:34:56.789Z';
        expect(asFromDatabase.date(fromJson)).toEqual(
          new Date('2026-08-02T12:34:56.789Z'),
        );
      });
    });

    when('[t1] a NULLABLE Date crosses into json', () => {
      then('null survives beside the string', () => {
        // .why = the conditional distributes, so `Date | null` maps to `string | null`. a
        //        non-distributive form would leave `Date | null` untouched as a whole
        type _case = Expect<
          Equals<AsJsonFromDbObject<Date | null>, string | null>
        >;
        const fromJson: AsJsonFromDbObject<Date | null> = null;
        expect(fromJson).toBeNull();
      });
    });

    when('[t2] an array of Dates crosses into json', () => {
      then('it maps elementwise, and each element casts back', () => {
        type _case = Expect<Equals<AsJsonFromDbObject<Date[]>, string[]>>;
        const fromJson: AsJsonFromDbObject<Date[]> = [
          '2026-08-02T12:34:56.789Z',
        ];
        expect(fromJson.map((value) => asFromDatabase.date(value))).toEqual([
          new Date('2026-08-02T12:34:56.789Z'),
        ]);
      });
    });

    when('[t3] a row of mixed primitives crosses into json', () => {
      then('only the Date moves; every other primitive is untouched', () => {
        // .why = pins the blast radius: only a Date column changes type
        type _case = Expect<
          Equals<
            AsJsonFromDbObject<{
              created_at: Date;
              uuid: string;
              latitude: number;
              is_active: boolean;
            }>,
            {
              created_at: string;
              uuid: string;
              latitude: number;
              is_active: boolean;
            }
          >
        >;
        const fromJson: AsJsonFromDbObject<{
          created_at: Date;
          uuid: string;
          latitude: number;
          is_active: boolean;
        }> = {
          created_at: '2026-08-02T12:34:56.789Z',
          uuid: 'a-uuid',
          latitude: 30.1,
          is_active: true,
        };
        expect(asFromDatabase.date(fromJson.created_at)).toEqual(
          new Date('2026-08-02T12:34:56.789Z'),
        );
        expect(fromJson.uuid).toEqual('a-uuid');
        expect(fromJson.latitude).toEqual(30.1);
        expect(fromJson.is_active).toEqual(true);
      });
    });

    when('[t4] a literal nested inside a literal crosses into json', () => {
      then(
        'the Date moves at EVERY depth, and the recursion terminates',
        () => {
          // .why = only a deep case catches (1) a non-recursive map that moves the outer `Date` alone,
          //        and (2) a depth limit that surfaces as `any`, which `Equals` refuses
          // .note = `items[].price` is the shape a `json_agg(json_build_object(...))` column takes
          type _case = Expect<
            Equals<
              AsJsonFromDbObject<{
                created_at: Date;
                price: { created_at: Date; amount: number };
                items: { created_at: Date; price: { created_at: Date } }[];
              }>,
              {
                created_at: string;
                price: { created_at: string; amount: number };
                items: { created_at: string; price: { created_at: string } }[];
              }
            >
          >;
          const fromJson: AsJsonFromDbObject<{
            created_at: Date;
            price: { created_at: Date; amount: number };
            items: { created_at: Date; price: { created_at: Date } }[];
          }> = {
            created_at: '2026-08-02T12:34:56.789Z',
            price: { created_at: '2026-08-03T00:00:00.000Z', amount: 30.1 },
            items: [
              {
                created_at: '2026-08-04T00:00:00.000Z',
                price: { created_at: '2026-08-05T00:00:00.000Z' },
              },
            ],
          };

          expect(asFromDatabase.date(fromJson.price.created_at)).toEqual(
            new Date('2026-08-03T00:00:00.000Z'),
          );
          expect(
            asFromDatabase.date(fromJson.items[0]!.price.created_at),
          ).toEqual(new Date('2026-08-05T00:00:00.000Z'));
          expect(fromJson.price.amount).toEqual(30.1);
        },
      );
    });
  });

  given('[case5] the full message of every arm a consumer can hit', () => {
    // .why = these messages are what a consumer reads in their logs. the snapshots show a phrase
    //        change in a pr diff
    when('[t0] asDateFromDbValue refuses a value', () => {
      then('a value this runtime can not parse', () => {
        expect(
          getError(() => asFromDatabase.date('not-a-date')).message,
        ).toMatchSnapshot();
      });

      then('a value of neither declared type', () => {
        expect(
          getError(() => asFromDatabase.date(null as never)).message,
        ).toMatchSnapshot();
      });
    });

    when('[t1] asNumberFromDbValue refuses a value', () => {
      then('a value of neither declared type', () => {
        expect(
          getError(() => asFromDatabase.number(null as never)).message,
        ).toMatchSnapshot();
      });

      then('a value that is not a finite number', () => {
        expect(
          getError(() => asFromDatabase.number('abc')).message,
        ).toMatchSnapshot();
      });

      then('an integer past Number.MAX_SAFE_INTEGER', () => {
        expect(
          getError(() => asFromDatabase.number('9007199254740993')).message,
        ).toMatchSnapshot();
      });
    });
  });
});
