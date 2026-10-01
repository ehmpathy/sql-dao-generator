# domain.term: cast

term.chosen   = cast
term.kind     = verb | noun   # "the dao casts the value" / "the generated cast"
term.synonyms.forbidden:
- normalize
- coerce
- convert
- transform
- parse
- map

## .what
to restate a value in a different shape, at a boundary, without a change to what it means.

## .note — `cast` is the concept, `as` is the prefix
`rule.require.get-set-gen-verbs` makes `as*` the sanctioned prefix for a cast and deprecates `cast*`.

- in prose and in this glossary → `cast`
- in an operation name → `as` (`asDateFromDbValue`, `as$Noun1From$Noun2`)
- extant `cast*` names predate that canon; they stay until disturbed

## .the shipped casts sit behind a namespace
a generated dao calls `asFromDatabase.date(value)`. the implementations are not exported:

```ts
export const asFromDatabase = { date: asDateFromDbValue, number: asNumberFromDbValue };
```

- the namespace states that the casts are one family, where a shared suffix only implied it
- a new cast adds a member, never an import

`asFromDatabase` composes two extant words (`as`, `database`), so it earns no cluster of its own.

## .refs
- `defineDaoUtilCastMethodCodeForDomainObject.ts` — the per-dao cast body
- `castDomainObjectNameToDaoName.ts`
- `defineDaoCastsCodeFile.ts` — composes the generated `.generated/casts.ts`
- the generated `castFromDatabaseObject.ts` and `.generated/casts.ts`, in every consumer's dao dir

## .reason
- `term=cast._.choice.reason.md` — etymology, disputes, evidence
