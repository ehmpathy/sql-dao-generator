# fulcrum F11: keep the probe-table collision detector rather than narrow it

- caught = 2026-09-13, i021 — `enroll-impl-arch-defects` (r011), nitpick 2
- rework = dirty
- status = open — r011 agrees with the keep
- confidence = 90%

## .the fork

the vision settled the supply in one sentence: *read the extant parser for each oid, and fail loud
when one is already registered and differs.* what shipped is larger — a `DbTypeParserReadout` union,
`isSameShape` / `isSameReadout` comparison with NaN-aware and array-recursive arms, a
`DbTypeParserCollisionError`, and a per-oid probe-sample table, all generated into every consumer's
repo.

| candidate | what it answers | cost |
| --- | --- | --- |
| identity / sentinel | *is a parser registered, and is it ours?* | smallest. fires on every equivalent hand-rolled parser, and on a second copy of this module against one shared `pg` |
| one safe probe + warn | *do the two agree on a typical value?* | small. **reads the most likely collision as agreement** — see below |
| the probe table ✅ | *do the two agree where a wrong parser would be wrong?* | the bulk of a 397-line section this generator owns |

## .why the middle row fails

`setTypeParser(20, parseInt)` — the registration this supply exists to replace — agrees on every safe
sample and truncates past `MAX_SAFE_INTEGER`. a consumer, `ahbode/svc-notifications`, registers
`setTypeParser(1700, parseFloat)` today, which truncates and reads `'1e999'` as `Infinity`. probed on
safe samples alone, each reads as equivalent and is left in place, and the supply reports success
while the absorption stays live — a failhide with a green check.

⇒ the vision's own word forces the depth: to know a parser **differs**, you must read what it does.
the six reasons the probe is the size it is are recorded where the probe lives:
`defineDaoCastsSectionSetDbTypeParsers.ts:25-55`.

## .what was taken

keep the probe table. both narrower candidates fail the settled sentence; the middle one fails it
toward a false green.

## .why dirty

to narrow it later removes generated code and an error class from every consumer's repo — a teardown,
not a re-scope, and the cost compounds per downstream repo.

## .the 10%

the argument defends the **depth**, never the **size**. whether a generator should own a
behavioral-equivalence framework at all — versus a supply that documents the hazard and registers
unconditionally — was never weighed, because the vision's sentence presumed a detector. that is an
appetite call, the wisher's. no independent lane priced it: `arch-opport-decomposition`
malfunctioned from i014 through i021.

no dream is owed — the call keeps what shipped. a reversal is the council's act.
