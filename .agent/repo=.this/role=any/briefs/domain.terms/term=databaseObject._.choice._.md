# domain.term: databaseObject

term.chosen   = databaseObject
term.kind     = noun
term.synonyms.forbidden:
- dbRow
- row
- record
- dbo
- raw
- payload

## .what
the shape a value arrives in **from** the database, before any cast — the input side of this
generator's boundary. its contrast is the **domain object**, the shape the cast must return.

## .it names a UNION, not one shape
one domain object has three profiles, per how the query selected it:

| profile | selected as | a `timestamptz` arrives as |
| --- | --- | --- |
| raw | `table.column` | `Date` (node-postgres parses it) |
| nested solo | `json_build_object(...)` | `string` (json has no date) |
| nested array | `json_agg(json_build_object(...))` | `string`, inside a json array |

the profiles collapse to two type shapes, each a term with `term.boundary = databaseObject`:

| shape | profiles |
| --- | --- |
| `...Strict` (`term=strict`) | raw |
| `...Jsoned` (`term=jsoned`) | nested solo, nested array |

⇒ `...Output = ...Strict | ...Jsoned` is the union the generated cast declares. the singular
read of the word is what hid the runtime-type divergence.

## .the pair — the bag and the item
a `dbValue` (`term=dbValue`) is one scalar read off a databaseObject. they are arguments to
different operations: `castFromDatabaseObject(dbObject)` takes the bag;
`asFromDatabase.date(value)` takes one scalar.

## .note — `dbObject` is the sanctioned short form
`dbObject` is the parameter name; `databaseObject` is the word in operation names and prose. one
term, contracted — as `id` is to `identifier`.

## .refs
- the generated `castFromDatabaseObject.ts` — `castFromDatabaseObject(dbObject) => HasMetadata<X>`
- `defineDaoUtilCastMethodCodeForDomainObject.ts` — defines that cast's body
- the `dbObject.` prefix on every property read inside a generated cast

## .reason
- `term=databaseObject._.choice.reason.md` — etymology, evidence, invariants
