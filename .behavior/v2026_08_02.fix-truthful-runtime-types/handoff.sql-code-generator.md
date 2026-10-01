## .what

`json_build_object(...)` and `json_agg(json_build_object(...))` are typed as an opaque bag:

```ts
export type SqlFunctionJsonBuildObjectOutput = Record<string, any> | null;
```

so a hydrated view column lands as:

```ts
home_station_geocode: SqlFunctionJsonBuildObjectOutput;  // solo
certificates: SqlFunctionJsonBuildObjectOutput;          // json_agg — an ARRAY, typed as an object
```

this asks for those expressions to be typed by the shape they select.

## .why

`Record<string, any>` is assignable to every type, so it silently defeats the compiler on every
nested read. sql-dao-generator once asserted over it per read — and the array form asserted the
wrong **cardinality** as well as the wrong element type (`ahbode/svc-notifications`,
`src/access/daos/smsDao/castFromDatabaseObject.ts:25,32,36`).

sql-dao-generator now derives the shape instead, so a nested read inside a cast is compiler-checked:

```ts
export type SqlQueryFindInvoiceByIdOutputStrict = Omit<
  import('../.generated/types').SqlQueryFindInvoiceByIdOutput,   // the raw row, reached inline
  'items' | 'total_price'
> & { items: SqlQueryFindInvoiceLineItemByIdOutputJsoned[]; total_price: SqlQueryFindPriceByIdOutputJsoned };
```

⇒ one assertion remains, at each `findBy*` call site, because the raw row is not assignable to the
derived shape:

```ts
return castFromDatabaseObject(dbObject as SqlQueryFindInvoiceByIdOutputStrict);
```

with a real type here, that `as` is deleted.

### 🔴 .what may be deleted when this lands, and what may NOT

| artifact | what it is | disposition |
| --- | --- | --- |
| the `as ...OutputStrict` at each `findBy*` | the last assertion | ✅ delete |
| `...OutputStrict` | the dobj as selected directly | keep. the `Omit & {...}` form collapses to a re-export |
| `...OutputJsoned` | the dobj as selected inside `json_build_object` | keep, as an alias — this issue generates that shape |
| `...Output` | the union `Strict \| Jsoned` | keep as a real declaration, never an alias |

- the types are exported from a generated dao that consumers import from, so a removal is a break;
  an alias costs one line per dao
- the raw row is reached inline and never named, so there is no alias to clean up
- the union states that one cast is reached from a direct select and a nested one — a fact about
  call sites no query type sees. only sql-dao-generator can declare it
- the union exists only for a domain literal; an entity is never nested, so its cast takes
  `...OutputStrict` alone (`.agent/repo=.this/role=any/briefs/rule.require.jsoned-shape-only-for-literals.md`)

## .note — no dependency, and no rush

sql-dao-generator ships its half without this issue: the derived `...OutputJsoned` shapes, plus
runtime casts (`asFromDatabase.date`, `asFromDatabase.number`) that make the declared type true.
this issue adds what sql-dao-generator cannot reach: compile-time enforcement at the query.

## .scope sketch (advisory — the HOW is yours)

| expression | today | desired |
| --- | --- | --- |
| `json_build_object(k, v, ...)` | `Record<string, any> \| null` | an object type of the selected keys |
| `json_agg(json_build_object(...))` | `Record<string, any> \| null` | an **array** of that object type |

a faithful type reflects the json serialization, not the table: a `timestamptz` inside
`json_build_object` is an ISO-8601 string, a `bigint`/`numeric` a json number.

🟡 that transform exists and may be worth a lift: `AsJsonFromDbObject<T>`, a recursive mapped type
that restates each column in its json form, idempotent on a column already jsoned.
`src/domain.operations/define/databaseAccessObjects/defineDaoCastsSectionAsJsonFromDbObject.ts`.

## .context

- origin: `ehmpathy/sql-dao-generator` issue #61, route `.behavior/v2026_08_02.fix-truthful-runtime-types`
- `Record<string, any>` is honest about what is not yet known; this closes the gap

---

dispatched by beaver 🦫 on behalf of the sql-dao-generator route —
`ehmpathy/sql-code-generator#95`, QUEUED 2026-08-03
