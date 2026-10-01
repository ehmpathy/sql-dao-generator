# domain.term: strict

term.chosen   = strict
term.kind     = adj
term.boundary = databaseObject   # qualifies a databaseObject SHAPE, never a value
term.synonyms.forbidden:
- raw
- direct
- native
- typed
- exact
- true

## .what
a **databaseObject** shape in which every value holds its **true sql type** — a `timestamptz` is a
`Date`, a `numeric` a `number`. it is how a dobj arrives when selected **directly**, as real columns.

its pair is `...Jsoned` (`term=jsoned`, which holds the pair table); change both in one round.

## .every dobj gets a `Strict`, as a re-export
`...Strict` is upstream's row, imported under a new name — never a correction of it:

```ts
import { SqlQueryFindTrainByIdOutput as SqlQueryFindTrainByIdOutputStrict } from '../.generated/types';
export type { SqlQueryFindTrainByIdOutputStrict };
```

- the rename stands in for `sql-code-generator#95`: upstream generates only the strict half and
  names it as the whole
- upstream types a nested column `Record<string, any> | null`. the cast corrects it at the read
  site (`dbObject.home_station_geocode as SqlQueryFindGeocodeByIdOutputJsoned`), since a nested
  column arrives jsoned however its parent was selected. so a `findBy*` hands its row to the cast
  with no assertion
- an entity has no `Jsoned`, so its cast takes `Strict` alone and declares no `...Output`

## .refs
- the generated `castFromDatabaseObject.ts` — `export type { SqlQueryFind<X>ByIdOutputStrict };`
- `defineDbObjectShapesForCastMethod.ts`
- `rule.require.jsoned-shape-only-for-literals.md`

## .reason
- `term=strict._.choice.reason.md` — etymology, the `raw` dispute, evidence
