# rule.require.jsoned-shape-only-for-literals

> **only a domain literal gets a `...Jsoned` shape. an entity's cast takes `...Strict` alone.**

```ts
// a LITERAL — nestable, so it arrives two ways; the union is declared by name
import { SqlQueryFindPriceByIdOutput as SqlQueryFindPriceByIdOutputStrict } from '../.generated/types';

export type { SqlQueryFindPriceByIdOutputStrict };
export type SqlQueryFindPriceByIdOutputJsoned = AsJsonFromDbObject<SqlQueryFindPriceByIdOutputStrict>;
export type SqlQueryFindPriceByIdOutput =
  | SqlQueryFindPriceByIdOutputStrict
  | SqlQueryFindPriceByIdOutputJsoned;

export const castFromDatabaseObject = (dbObject: SqlQueryFindPriceByIdOutput) => ...

// an ENTITY — never nested, so it arrives one way
import { SqlQueryFindCarriageByIdOutput as SqlQueryFindCarriageByIdOutputStrict } from '../.generated/types';

export type { SqlQueryFindCarriageByIdOutputStrict };

export const castFromDatabaseObject = (dbObject: SqlQueryFindCarriageByIdOutputStrict) => ...
```

## .the vocabulary

| shape | states | who gets one |
|---|---|---|
| **`...Strict`** | selected directly — true sql types; a re-export of upstream's row | every dobj |
| **`...Jsoned`** | selected inside `json_build_object` — json forms | only a literal |
| **`...Output`** | the union the cast takes | only a literal |

the union is **declared** as `...Output`, never spelled out at the cast's parameter. the name
deliberately shadows the upstream export of that name, which states only the strict half.

## .why an entity has none
an entity is referenced, never nested (`term=reference`), so it never reaches
`json_build_object`. a `Jsoned` for one would type a row that never exists. the nested-entity throw
enforces this; mutability is the reason, which is why it cannot be relaxed.

`Jsoned = never` for symmetry was refused: it gives a reader a symbol with no referent, where the
absence already states the truth about the variant.

## .the test
> **is this dobj a domain literal?**

yes → a `Jsoned`, and the cast takes `...Output` · no → `Strict` alone.

| when… | then… |
|---|---|
| you would define a `Jsoned` | check `extends === DOMAIN_LITERAL` first |
| an entity's cast reads `Strict \| Jsoned` | a defect — the second arm cannot exist |
| you would declare `...Output` for an entity | it would alias `Strict`; the cast takes `Strict` directly |
| you would correct upstream's row in the `Strict` declaration (`Omit & {...}`) | correct the nested column at its read site in the cast instead |
| the nested-entity throw is cited as the reason | it is the enforcement; the reason is mutability |

## .the clamp
`defineDaoUtilCastMethodCodeForDomainObject.test.ts`: the `Carriage` case asserts
`SqlQueryFindCarriageByIdOutputJsoned` and `AsJsonFromDbObject` absent; the `Geocode` case asserts
both present — so a rename cannot silence the negatives unnoticed.

## .the boundary
governs the shape vocabulary a generated cast declares. not which columns a query selects, nor the
value casts that run once the shape is settled.

blocker: a `Jsoned` for a non-literal · an entity cast whose input is a union · `Jsoned = never` ·
an omitted `Strict` · a union spelled out at a parameter.
false positive: an entity cast on `Strict` alone.

⇒ see also: `term=reference` · `term=strict` · `term=jsoned` · `term=databaseObject` ·
`defineDbObjectShapesForCastMethod.ts`.
