# seed: rule.forbid.helpful-error-constructor-overrides

**dispatch to:** `ehmpathy/rhachet-roles-ehmpathy`
**home:** `src/domain.roles/mechanic/briefs/practices/code.prod/pitofsuccess.errors/rule.forbid.helpful-error-constructor-overrides.md`
**peers:** the negative twin of `rule.prefer.helpful-error-wrap`; sits beside `rule.require.failloud`

---

# rule.forbid.helpful-error-constructor-overrides

## .what

a `helpful-errors` subclass is a **bare extends**. it declares no constructor, no
`this.name = ...`, and no `toJSON` override.

```ts
// 👍 the whole class
export class DbValueCastError extends ConstraintError<{
  expected: string;
  property: string;
  source: 'cast' | 'supply';
  value: unknown;
  valueTypeof: string;
}> {}
```

the generic slot is where a required metadata shape is declared. it is the one extension point
the library offers, and it is enough.

## .why — the override buys a shape the parent already gives

```ts
// 👎 the override
export class DbValueCastError extends ConstraintError {
  public readonly property: string;
  public readonly reason: string;

  constructor(input: { property: string; reason: string; value: unknown }) {
    super(
      `DbValueCastError: could not cast '${input.property}': ${input.reason}`,
    );
    this.name = 'DbValueCastError';
    this.property = input.property;
    this.reason = input.reason;
  }
}
```

every line of it is already done, one level up:

| the override writes | the parent already does |
| --- | --- |
| a message built from the metadata | serializes the metadata into the message |
| `this.name = 'DbValueCastError'` | reads the class name off `new.target` |
| a prefix on the message | prepends the class's `static emoji` and its name |
| public fields for the metadata | a non-enumerable `.metadata` getter, plus `.toJSON()` |

`ConstraintError` is itself a bare extends of `BadRequestError` — it declares a
`static code = { http: 400, exit: 2 }` and a `static emoji`, and not one constructor. the
library's own subclass is the shape this rule asks for.

## .the blocker — the override silently breaks every inherited static

the base class and its helpers **all construct through a two-argument call**. verbatim from
`helpful-errors/dist`:

```ts
static throw(message, ...[metadata]) { throw new this(message, metadata); }
```

```ts
// withHelpfulError
throw new Constructor(options.message, { ...options.metadata, cause: error });
```

```ts
// redact
return new this.constructor(this.original.message, newMetadata);
```

a one-object constructor makes each of those pass a **string** where the subclass expects an
object. the failures are:

- **`.throw()`** — the metadata lands in the message slot; the metadata is dropped
- **`.wrap()`** — the `cause` the wrapper extracted is dropped, so the root error is lost
- **`.redact()`** — returns a malformed instance
- any `code` or `cause` a caller passes is dropped

none of these throw. each returns a wrong-but-plausible error object, which is the exact shape
`rule.require.failloud` exists to refuse.

`.redact(['metadata'])` is the sharpest case: a class whose metadata carries a database value
is both the likeliest to need redaction and the likeliest to get a convenience constructor.

## .the legitimate need, and where it is served

the reason an author reaches for a constructor is real: they want the metadata shape
**required**, so a caller cannot omit a field. the generic slot in `.what` does that — the
compiler demands every field, at every call site:

```ts
throw new DbValueCastError(
  `could not cast db value to number for property '${property}': the value is a blank string, which converts to 0 rather than fails. check the column holds a numeric, or declare this property as a string`,
  { expected: 'number', property, source: 'cast', value, valueTypeof: typeof value },
);
```

the message still names the fix (`rule.require.errors-name-the-fix`). only the mechanism moves:
the call site authors the message, where the constructor assembled it from a `reason` field.

## .enforcement

- a constructor on a `helpful-errors` subclass = **blocker**
- a `this.name = ...` assignment in an error class = **blocker**
- a hand-built message that re-serializes metadata the parent already serializes = **blocker**
- a `toJSON` override on a `helpful-errors` subclass = **blocker**

## .see also

- `rule.prefer.helpful-error-wrap` — the positive peer; `.wrap()` is one of the statics this breaks
- `rule.require.failloud` — a silently malformed error is the defect this prevents
- `rule.require.failfast` — the throw discipline these classes serve

## .provenance

found 2026-09-20 in `ehmpathy/sql-dao-generator` @ `beav/fix-truthful-runtime-types`. a
generated `DbValueCastError` carried the 👎 override above; 15 call sites were migrated to the
two-argument form.

every snapshot stayed byte-identical: the override bought naught observable, and cost every
inherited static.

---

dispatched as `ehmpathy/rhachet-roles-ehmpathy#776`, QUEUED 2026-09-20
