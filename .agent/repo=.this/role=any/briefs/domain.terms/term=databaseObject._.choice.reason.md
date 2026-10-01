# domain.term.choice.reason: databaseObject

## .etymology

a compound of the two halves of the boundary: an **object** (the domain's word for a declared
shape) as the **database** hands it over — *your object, not yet in your shape*.

| rejected | why it says the wrong thing |
| --- | --- |
| `dbRow` / `row` | a table concept. two of three profiles are json parsed out of one column, so the nested case becomes unsayable |
| `record` | collides with `Record<string, any>`, the type `sql-code-generator` generates for a json column |
| `dbo` | no reader intuition; a sql-server schema name |
| `raw` | names one profile, so it cannot name the union. kept as that profile's label |
| `payload` | implies transport and a request/response sense the boundary lacks |

## .disputes
no dispute raised.

## .why it is ours, not imported
`castFromDatabaseObject` looks like dependency vocabulary, which `.readme.md` puts out of scope. a
grep settles it: the name is a literal in `defineDaoUtilCastMethodCodeForDomainObject`, and every
consumer inherits it. a name generated into another repo is the strongest declaration available
here — the consumer reads it and cannot rename it.

## .evidence
- **three profiles, one file** — `view_invoice_hydrated.sql` in the example project selects
  `invoice.id` raw, `price` via `json_build_object`, and the same inside a `json_agg`
- **the union is live** — `priceDao/castFromDatabaseObject.ts` is reached from three call sites
  across those profiles; one receives a `numeric` as a `string`, the others as a `number`

## .invariants
- **per-query, not per-table** — two queries on one table may yield two profiles
- keys are **snake_case**; the domain object's are **camelCase**. the cast is the only licensed
  translation
- **never handed to a consumer** — it dies in the cast. one that escapes a dao is a leaked boundary
- **read-only** — the write path takes a domain object and its own upsert contract
