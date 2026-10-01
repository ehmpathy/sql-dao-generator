# domain.term: jsoned

term.chosen   = jsoned
term.kind     = adj
term.boundary = databaseObject   # qualifies a databaseObject SHAPE, never a value
term.synonyms.forbidden:
- json
- nested
- serialized
- stringified
- encoded
- wrapped

## .what
a **databaseObject** shape in which every value holds its **json form** — a `timestamptz` is an
iso-8601 string, a `bigint` a json number. it is how a dobj arrives when selected **inside
`json_build_object`**.

## .the pair

| shape | selected | a `timestamptz` arrives as |
| --- | --- | --- |
| **`...Strict`** (`term=strict`) | directly — real columns | `Date` |
| **`...Jsoned`** | inside `json_build_object` | `string`, iso-8601 |

⇒ `...Output = ...Strict | ...Jsoned` is what a cast takes. change both halves in one round.

## .only a domain literal owes one
an entity is referenced, never nested (`term=reference`), so it never reaches `json_build_object`.
it declares no `Jsoned`, and its cast takes `Strict` directly. the absence is evidence about the
variant, not a gap. `DirectlyNestedNonDomainObjectReferenceForbiddenError` enforces this; the
reason is that an entity is mutable.

## .it is derived from its strict half

```ts
type ...OutputJsoned = AsJsonFromDbObject<...OutputStrict>;
```

- the nested select carries the same keys as the strict row, so no key subset is declared — both
  take each key from `getOneDbObjectKeyForProperty`
- `AsJsonFromDbObject` applies the serialization; it is idempotent, so a doubly nested dobj passes
  through unchanged

## .refs
- the generated `castFromDatabaseObject.ts` — `export type SqlQueryFind<X>ByIdOutputJsoned = ...`
- the generated `.generated/casts.ts` — `AsJsonFromDbObject`
- `defineDbObjectShapesForCastMethod.ts`
- `rule.require.jsoned-shape-only-for-literals.md`

## .reason
- `term=jsoned._.choice.reason.md` — etymology, the `nested` and `json` disputes
