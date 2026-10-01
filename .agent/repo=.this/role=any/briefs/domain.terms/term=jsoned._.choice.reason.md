# domain.term.choice.reason: jsoned

## .etymology

a denominal participle — `json` taken as a verb, past tense: **this went through json**. like a
faxed document, the medium it crossed is what changed it.

the participle beats the bare noun: `...OutputJson` reads *"a shape made of json"*, false — a jsoned
`id` is a javascript `number`. `...OutputJsoned` reads *"the output, after json"*, which is the
claim.

| rejected | why it names the wrong property |
| --- | --- |
| `json` | the format, not the state. `JSON.parse` has already run, so no value in the shape is json |
| `nested` | the cause, not the effect — and `nest` is its own term, about *where a dobj sits* |
| `serialized` | a raw `Date` was serialized too; it discriminates no case |
| `stringified` | false of half the shape: a jsoned `bigint` is a number |
| `encoded` | implies a reversible wrapper; an `int8` past `2^53` does not survive |
| `wrapped` | implies the original is intact inside; postgres flattened it |

## .disputes

### dispute: nested — raised 2026-09-11 — status: RESOLVED (keep `jsoned`)
- raised.by  = beaver
- claim      = the repo already names the case `nested` (`DIRECT_BY_NESTING`, `term=nest`); a
               second word looks like synonym sprawl
- counter    = two concepts with one cause. `nest` answers *where does this dobj sit?*; `jsoned`
               answers *what types does this shape hold?*. they come apart: a literal that nests
               naught still has a `Jsoned` shape, since it is nested *by* someone. to reuse `nested`
               would overload one word (`rule.forbid.domain-term-ambiguity`)
- resolution = keep `jsoned`; `nested` is a forbidden synonym; the clusters cross-reference

### dispute: json — raised 2026-09-11 — status: RESOLVED (keep `jsoned`)
- raised.by  = beaver; the first generated output shipped `SqlQueryFind<X>ByIdOutputJson`
- claim      = none argued; shorter, and it matches the sql function name
- counter    = `...OutputJson` claims a shape of json — the exact untruth this route removes
- resolution = keep `jsoned`; `json` is a forbidden synonym

## .evidence
- **published** — `SqlQueryFindGeocodeByIdOutputJsoned` is exported from
  `geocodeDao/castFromDatabaseObject.ts`, in every consumer's dao dir
- **the asymmetry is visible** — 8 of 12 example-project daos declare no `Jsoned`: their dobjs are
  entities
- **the derivation is checkable** — `certificateDao/castFromDatabaseObject.ts` declares
  `AsJsonFromDbObject<...Strict>`

## .invariants
- defined **only for a domain literal**
- **derived** from `Strict`, never declared beside it — two declarations would drift
- a jsoned `timestamptz` is iso-8601, which `new Date` round-trips; a jsoned `bigint` is lossy past
  `2^53`, so a cast guards it
- `AsJsonFromDbObject` is **idempotent**
- it types a cast's input and is **never handed to a consumer**
