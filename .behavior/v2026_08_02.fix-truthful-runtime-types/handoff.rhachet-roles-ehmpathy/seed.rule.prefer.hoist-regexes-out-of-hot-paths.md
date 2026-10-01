# seed: rule.prefer.hoist-regexes-out-of-hot-paths

**dispatch to:** `ehmpathy/rhachet-roles-ehmpathy`
**home:** `src/domain.roles/mechanic/briefs/practices/code.prod/readable.narrative/`, or a new
`performance/` cluster — the librarian's call

---

# rule.prefer.hoist-regexes-out-of-hot-paths

## .what

a regex literal inside a function body is re-compiled on every call. where the function runs once
per value of a row set, hoist the literal to module scope.

```ts
// 👎 compiled per value
const asDecimal = (rendered: string) => /^[+-]?\d+(\.0+)?$/.test(rendered);

// 👍 compiled once
const AS_DECIMAL = /^[+-]?\d+(\.0+)?$/;
const asDecimal = (rendered: string) => AS_DECIMAL.test(rendered);
```

## .why

identical semantics, no guard removed — a speedup with no correctness or legibility cost.

measured in `ehmpathy/sql-dao-generator`, a cast that reads one numeric db value (median of 7 reps ×
500k values, variants interleaved, semantic equivalence proven on 6 accepts + 6 refusals first):

| variant | ns / value | vs baseline |
| --- | --- | --- |
| `parseFloat` alone (no validation) | 193 | 1.00x |
| the cast, regexes inline | 626 | 3.25x |
| the cast, regexes hoisted | 510 | 2.64x |

⇒ 1.23x of the cost was per-call regex construction plus repeated `.trim()`s. the residual 2.64x
buys six real guards, under a database round trip's noise floor.

## .the bound — hoist only a regex with no `g` and no `y` flag

a global or sticky regex carries a mutable `lastIndex` between calls. hoisted, two callers share it,
so `.test()` can return `false` on a match.

```ts
// 👎 a shared-state defect the hoist introduces
const HAS_DIGIT = /\d/g;
HAS_DIGIT.test('a1'); // true  — lastIndex now 2
HAS_DIGIT.test('a1'); // false — resumes at index 2
```

⇒ note the flag bound beside the hoisted consts. an author who later adds a `g` gets no error.

## .the test

> **does this function run once per value of a result set, or once per request?**

- per value → hoist, and note the flag bound
- per request → leave it inline; the compile sits under every other cost of the request

this is a `prefer`. a codebase-wide hoist trades locality for a speedup nobody can measure.

## .enforcement

- a regex literal inside a function that runs per value of a row set = **nitpick**
- a hoisted regex with a `g` or `y` flag, shared across calls = **blocker**
- a hoist with no note of the flag bound = **nitpick**

## .see also

- `rule.require.what-why-headers` — the hoist's `.why` carries the measurement
- `rule.require.timeless-comments` — state the bound as a durable fact

---

dispatched as `ehmpathy/rhachet-roles-ehmpathy#778`, QUEUED 2026-09-20
