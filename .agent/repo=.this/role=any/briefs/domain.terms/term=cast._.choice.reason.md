# domain.term.choice.reason: cast

## .etymology

`cast` carries the type-system sense a typescript reader already holds: the value stays; only the
shape it is read through changes. this repo's boundary does exactly that — a database row in, a
domain object out, meaning untouched.

| rejected | why it says the wrong thing |
| --- | --- |
| `normalize` | conflates format, canonical form, sanitize, scale, case, encode. blocked org-wide; `as*` replaces it |
| `coerce` | implies the value is bent to fit — the defect this repo forbids (`z.coerce.*` in a domain schema) |
| `convert` | generic; no boundary sense; collides with unit conversion |
| `transform` | the architect canon reserves it for the pure-computation grain, which is wider |
| `parse` | narrows to text → structure; a cast may go structure → structure |
| `map` | array semantics, already load-carrying in javascript |

## .why `as`, on domain grounds
a `dbValue` arrives with a type no caller can predict — the union of three serialization profiles
and whichever pg type parsers the process carries. so there is no known source shape to convert
**from**.

- `convert` and `transform` presume a known input shape
- `as` asserts what the value IS — *"read this as a Date"*
- ⇒ the prefix follows from the domain, independent of the org canon

## .disputes

### dispute: caster — raised 2026-08-02 — status: RESOLVED (keep `cast`)
- raised.by  = beaver, in `1.vision.yield.md`
- claim      = an agent noun for "the small `as*` functions" reads naturally in prose
- counter    = a fourth word for a concept that has `cast`, the `as*` prefix, and the architect
               grain noun `transformer` (`rule.require.named-transformers`)
- resolution = keep `cast` as the verb, `transformer` as the agent noun. `caster` is tolerated in
               prose, forbidden in contracts

### dispute: normalize — raised 2026-08-02 — status: RESOLVED (keep `cast`)
- raised.by  = beaver, by habit, twice
- counter    = the word hides the design's key property: a cast fails loud, never absorbs. "cast
               the value" prompts the right question — what if it will not cast?
- resolution = keep `cast`; `normalize` is a forbidden synonym

### dispute: convert in prose — raised 2026-08-02 — status: RESOLVED (declare the noun sense)
- raised.by  = beaver, 14 uses in `1.vision.yield.md`; all contracts used `as*`
- claim      = none argued. `cast` is also a noun ("the generated cast"), and "the cast casts it"
               does not parse, so prose reached for `convert`
- resolution = `term.kind = verb | noun`. the conformant prose verb for the noun is `restates`,
               from this term's own `.what`. `convert` stays forbidden in contracts

## .evidence
- `castDomainObjectNameToDaoName.ts` and `defineDaoUtilCastMethodCodeForDomainObject.ts` use the
  word for one concept: same meaning, different shape
- every generated dao carries `castFromDatabaseObject(dbObject) => HasMetadata<X>` — one shape in,
  one shape out
- `rule.require.get-set-gen-verbs` names `as*` the cast prefix; the declastruct demo records the
  same migration (`asDeclaredStripeCustomer`)

## .invariants
- a cast **may throw**; it never silently absorbs. a wrong-but-plausible return is a coercion
- a cast is **idempotent** on a value already in the target shape — `asDateFromDbValue(aDate)`
  returns that `Date`. this lets one cast serve two serializations
- a cast holds **no i/o** — the boundary is a type boundary, not a network one
