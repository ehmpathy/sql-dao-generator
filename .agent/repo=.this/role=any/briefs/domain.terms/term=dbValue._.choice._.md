# domain.term: dbValue

term.chosen   = dbValue
term.kind     = noun
term.synonyms.forbidden:
- raw
- rawValue
- field
- cell
- column
- datum

## .what
**one scalar** as it arrives from the database, before any cast — the unit a cast takes. its
container is the **databaseObject**.

| term | grain | the operation that takes it |
| --- | --- | --- |
| databaseObject | the whole row or json bag | `castFromDatabaseObject(dbObject)` |
| dbValue | one scalar inside it | `asDateFromDbValue(value)` |

## .why it earns a word
`databaseObject` names a union of three serialization profiles, so **one column type yields more
than one `dbValue` type**: a `timestamptz` is a `Date` raw and a `string` in json; a `bigserial` is
a `string` or a `number` per the installed pg type parsers.

⇒ `dbValue` names *a value whose type you may not assume*. the `as*` casts settle it.

## .note — `db`, not `database`
`asDateFromDbValue`, never `asDateFromDatabaseValue` — the same contraction `dbObject` takes. one
term, short in a name, long in prose.

## .the name is on the implementation, not the call
a generated dao calls `asFromDatabase.date(...)`; `asDateFromDbValue` is the implementation behind
that member. a stack trace names the implementation, so the term reaches a consumer when a cast
throws.

## .refs
- the generated `.generated/casts.ts` — `asDateFromDbValue`, `asNumberFromDbValue`,
  `DbValueCastError`, and `setDbTypeParsers`
- `defineDaoCastsCodeFile.ts` — the composer
- `defineDaoCastsSection{AsDateFromDbValue,AsNumberFromDbValue,DbValueCastError,SetDbTypeParsers}.ts`

## .reason
- `term=dbValue._.choice.reason.md` — etymology, dispute, invariants
