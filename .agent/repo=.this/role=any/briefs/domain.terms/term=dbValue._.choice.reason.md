# domain.term.choice.reason: dbValue

## .etymology

a compound of container and grain: a **value** as the **database** hands it over. its first half
comes from `databaseObject` on purpose — one family.

| rejected | why it says the wrong thing |
| --- | --- |
| `raw` / `rawValue` | names one profile, and reads as *unparsed* — false, since node-postgres already parsed a raw `timestamptz` into a `Date` |
| `field` | a schema slot, not the value in it; already taken in domain-objects |
| `cell` | a table concept; a value inside a json blob sits in no cell |
| `column` | names the source, not the value |
| `datum` | carries no boundary sense, and nobody says it |

## .disputes

### dispute: is this `databaseObject` at a smaller grain? — raised 2026-09-09 — status: RESOLVED (a distinct term)
- raised.by  = beaver
- claim      = record `dbValue` as a note inside `term=databaseObject`, as `dbObject` is
- counter    = `dbObject` contracts one word. `dbValue` and `databaseObject` are different words
               for different shapes, each named in a different published operation with different
               arity. the union is stated at the object grain; the cast that settles it runs at
               the value grain
- resolution = a distinct term; the two clusters cross-reference

## .evidence
- **published** — `asDateFromDbValue`, `asNumberFromDbValue`, and `DbValueCastError` are declared in
  the `.generated/casts.ts` every consumer receives
- **one column, two types** — the example project's `view_train_hydrated.sql` selects
  `geocode.created_at` raw and inside a `json_build_object`

## .invariants
- a `dbValue` is a **scalar**; an array of them is cast elementwise
- its type is **not derivable from the column type alone** — it also depends on the query's
  serialization and the process's pg type parsers
- it is **never handed to a consumer** (inherited from `databaseObject`)
- one that will not cast **throws**; absorption would be a coercion
- at **property grain**, `null` never reaches a cast — the generated cast short-circuits a nullable
  property first
- at **element grain**, it can: `getOneCastExpressionForProperty.ts` maps each element of a native
  array through the cast with no null check, so a NULL element **throws**. that is correct — the
  domain declared `number[]`, and `[1, null, 3]` is not one. the blast radius is the whole read
  - `setDbTypeParsers`' `asInt8ArrayFromDbValue` yields `null` for a NULL element instead. no conflict:
    it is process-global and holds no declared type, so it matches the node-postgres default
  - unreachable end-to-end today: `sql-schema-generator`'s `ARRAY_OF` accepts only
    REFERENCES/UUID
