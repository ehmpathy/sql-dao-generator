# seed: rule.forbid.negative-assertions-on-stale-needles

**dispatch to:** `ehmpathy/rhachet-roles-ehmpathy`
**home:** `src/domain.roles/mechanic/briefs/practices/code.test/pitofsuccess.errors/`
**peer:** a species of `rule.forbid.failhide` — the shape that hides no failure loudly, and
hides a regression instead

---

# rule.forbid.negative-assertions-on-stale-needles

## .what

a `not.toContain` / `not.toMatch` assertion is only as strong as the string it looks for. rename
the symbol it guards and the assertion **stays green while it guards naught** — it would now
pass against the exact defect it was written to catch.

so: when you rename a symbol, **grep the negative assertions for its old name** and move them
with it. and when you write one, choose a needle a rename cannot orphan in silence.

## .why — a stale negative needle is a failhide that stays green

```ts
// the clamp, as written: prove the parser supply holds no private copy of the predicate
expect(supply.content).not.toContain('const asDecimal');
```

the rename lands (`asDecimal` → `AS_DECIMAL`), the positive assertions fail loudly and get
updated, and **this one stays green** — because the file holds no `const asDecimal` and never
will again.

the clamp is now vacuous. a future edit that re-introduces a private copy under the **new** name
sails past it, green.

| | a positive assertion | a negative assertion |
| --- | --- | --- |
| needle goes stale | **fails loudly** — the rename is caught | **stays green** — the clamp is lost |
| you learn about it | at once, from a red suite | never |

## .the test

> **if the defect this assertion refuses came back today, would it still fail?**

- yes → the needle is live
- no → the clamp is vacuous, and the suite is a false witness

the mechanical check: grep the codebase for the needle. a `not.toContain` whose
string appears **nowhere else** is a candidate — either the symbol was renamed, or the clamp
never matched reality in the first place.

## .how to write one that survives

- pair it with a positive. assert the symbol lives in file A **and** is absent from file B,
  in the same test. the positive goes red on a rename, so it drags the negative's needle along
- name the invariant in a comment, not only the string — a future author who reads *"the
  supply must import this, never copy it"* knows what to re-aim
- prefer a structural needle where one exists — a count, an import statement, an exported
  name — over a fragment that a formatter or a rename can dissolve

## .enforcement

- a `not.toContain` / `not.toMatch` whose needle appears nowhere in the repo = **blocker** (it is
  vacuous, and reads as protection)
- a rename that leaves a negative assertion on the old name = **blocker**
- a negative assertion with no paired positive and no comment on the invariant = **nitpick**

## .see also

- `rule.forbid.failhide` — the parent class of defect; this is the test-side species
- `rule.require.clamp-edge-cases` — *prove the clamp bites*; this is what a clamp looks like once
  it has ceased to bite
- `rule.require.test-covered-repairs` — the clamp that survives a rename is the one that lasts

## .provenance

found 2026-09-20 in `ehmpathy/sql-dao-generator` @ `beav/fix-truthful-runtime-types`. two
regexes were hoisted to module scope and renamed `asDecimal` → `AS_DECIMAL`. the positive
assertion failed and was repaired; the two `not.toContain('const asDecimal')` clamps stayed
green. they were caught only because their positive peer sat in the same test block.

---

dispatched as `ehmpathy/rhachet-roles-ehmpathy#777`, QUEUED 2026-09-20
