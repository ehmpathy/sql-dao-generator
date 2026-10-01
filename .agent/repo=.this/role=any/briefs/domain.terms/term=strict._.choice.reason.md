# domain.term.choice.reason: strict

## .etymology

`strict` names what is true **of the types**: a strict shape's declared types hold without
qualification. that is the one property a consumer reads it for. each rejected word names an
adjacent property instead:

| rejected | why it names the wrong property |
| --- | --- |
| `raw` | names the serialization profile, not type-truth — and is false about its own case, since node-postgres already parsed the `Date`. forbidden on `term=dbValue` too |
| `direct` | names how it was selected; says naught about what a `timestamptz` arrives as |
| `native` | native to postgres or to javascript? the word does not say |
| `typed` | every shape here is typed; it discriminates no case |
| `exact` | invites a precision claim a `numeric` → `number` cast cannot honor |
| `true` | asserts rather than names, and implies the other arm is false |

## .disputes

### dispute: raw — raised 2026-09-11 — status: RESOLVED (keep `strict`)
- raised.by  = beaver; the first generated output declared `SqlQueryFind<X>ByIdOutputRaw`, and it
               reached fixtures and snapshots
- claim      = none argued; it mirrored the vision's prose about "the raw path"
- counter    = the wisher struck it. a *path* is a fact about the query; a *shape* is a fact about
               types. one raw path yields a `number` or a `string` per the installed type parsers,
               so `raw` does not fix the types it would name
- resolution = keep `strict`; the `...OutputRaw` declarations were removed before they left this
               repo. `raw` is a forbidden synonym
- lesson     = a name this repo generates into another repo is settled **before** the fixture is
               regenerated. one more release and the rename would have been a consumer break

### dispute: boundary-qualified filenames? — raised 2026-09-11 — status: RESOLVED (flat, as a family)
same resolution as `term=generate`: `rule.require.boundary-qualified-terms` qualifies a family
together, and this dir is flat. `term.boundary` in the header carries the answer without a rename.

## .evidence
- **published** — `SqlQueryFindGeocodeByIdOutputStrict` is exported from
  `geocodeDao/castFromDatabaseObject.ts`, a file consumers import from directly, so a rename would
  break at a site that looks hand-written
- **one derivation for every dobj** — `geocodeDao` and `trainDao` both re-export upstream's row;
  `trainDao`'s nested `home_station_geocode` is corrected at its read site in the cast

## .invariants
- defined for **every** dobj
- its types are true **only under the pg type-parser convention** for `int8` and `numeric` — which
  is why `setDbTypeParsers` ships beside the casts
- it types a cast's input and is **never handed to a consumer**
- `Strict` and `Jsoned` are disjoint in type, not provenance — one column can arrive through both
  in one query, so one cast must accept either
