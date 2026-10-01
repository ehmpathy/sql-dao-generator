# inventory: fulcrums — `v2026_08_02.fix-truthful-runtime-types`

the forks this drive best-guessed rather than halted on (`rule.always.defer-fulcrums-to-last`). each
row has an entry beside it: the fork, the call, the rework grade, the confidence.

## .the axes

- **case** — `F$n`, in the order caught
- **rework** — `clean` (no ripple) or `dirty` (callers or later work built upon it)
- **status** — `open` · `ruled` (the wisher decided) · `reversed` (the drive retook its own call; the
  row stays so the council sees the defer that was wrong) · `closed`
- **confidence** — a percentage; its reason is in the entry. below 93% is itself a trigger

## .the rows

| case | title | rework | status | confidence |
| --- | --- | --- | --- | --- |
| F1 | defer the `depcheck` path scope rather than edit `.depcheckrc.yml` now | dirty → clean | closed — option A shipped | 88% |
| F2 | defer the declaration-ref unused-import derivation | dirty → clean | reversed — fixed | 92% |
| F3 | defer the fixture-freshness race rather than pick one of three redesigns | dirty → clean | reversed — fixed | 85% |
| F4 | defer a glossary-fed forbid-terms hook | dirty | open | 93% |
| F5 | defer the 67-file `import type` sweep of extant generated output | dirty | open | 91% |
| F6 | defer the cleave of the two dao definers mid-convergence | dirty → clean | reversed — cleaved | 90% |
| F7 | defer the nullable `string[]` null guard | dirty → clean | reversed — fixed | 87% |
| F8 | defer the declared-ref key cast at its three residual sites | dirty → clean | closed — 3 of 3 fixed | 89% |
| F9 | defer the narrow of the json input type for an un-nested literal | dirty | open | 92% |
| F10 | defer the split of the dao-utils definer into one definer per artifact | dirty → clean | closed — taken at i026 | taken |
| F11 | keep the probe-table collision detector | dirty | open — r011 agrees | 90% |
| F12a | keep the dao-utils runtime as generated code, not a runtime package | dirty | open — r011: extract | 58% |
| F12b | keep the pg-wire verification engine in a sql→dao codegen repo at all | dirty | open — r011: extract | 62% |
| F13 | leave the new surface untracked until the route closes | clean | ruled by the wisher | n/a |
| F14 | defer the `..` collapse in `saveCode`'s printed path | dirty → clean | closed — repaired 2026-09-17 | 94% |
| F15 | keep the two post-run banners as noun phrases, off the participle header convention | clean | open | 91% |

## .the gaps — what the council owes

- **open: F4, F5, F9, F11, F12a, F12b, F15.** the council sits at the end of the drive, which is
  correct
- 🔴 **F12a and F12b are one decision.** reviewer r011 asks for one versioned package that carries
  both the casts and the verification engine, with F12a gated on F12b. each needs a new npm package,
  which sits outside the wish's `.scope`, so no `.taken` can close either
  - F12a is the lowest row: the drive's own measurement favors the alternative. a generated dao
    already imports seven runtime packages, so an eighth adds a row to an extant list rather than a
    new class of cost. the keep now rests on version skew and release scope alone
  - F12b asks a bounded-context question independent of F12a: that this generator picks the oids
    establishes ownership of the **fact**, never of the **engine** that verifies it
- **F15 is `clean` and still a row**: the reviewer's repair is barred by a blocker-severity org rule,
  so the fix is unavailable rather than costly. only a council that may amend a rule changes that
- **F11 is the one row that is not a deferral** — a call to keep, against a named alternative. it
  owes no dream
- the vision's five fulcrums are ruled and recorded in `1.vision.yield.md` under `## the fulcrum`

## 🔴 .the lesson — eight of fourteen `dirty` grades measured `clean`

F1, F2, F3, F6, F7, F8, F10, F14. each grade was written in good faith; each asserted a cost that was
never measured. they failed in distinct ways, and each adds a move to the defer discipline:

| row | what the defer got wrong | the move it adds |
| --- | --- | --- |
| F2 | the hazard cleared and SAFE was not re-asked | re-test SAFE when its condition changes |
| F3 | the defect was misdiagnosed: the guards were deterministically vacuous, not racy | re-read the mechanism, never only the remedy |
| F6 | the row named its own clearance date, then was re-deferred three rounds past it — four peer raises spent reviewer budget on it | re-test when a clearance condition comes due |
| F1, F8, F9 | a structural claim inside CLEAN was wrong — a check that guarded no source file (F1), a file path (F8), a signature count off by one (F9) | verify every path and count a defer cites, when it is cited |
| F14 | the block was an expired credential: a measurement with an age | a credential-grade block is re-probed every round |

⇒ an itemized fulcrum is re-raised as a review blocker anyway: a reviewer reads the code, not the
inventory. the row decides **who** answers the question, never whether it is asked.

## .the close-of-stone re-test

| row | result |
| --- | --- |
| F4 | 2026-09-09: 90% → 93%. a word-boundary grep cannot see a term inside a camelCase identifier, which strengthens the case for the hook; the defer holds |
| F5 | 2026-09-13: still 67 matches across 67 files. CLEAN does not clear on its own; it waits on a wisher who judges a consumer compile failure worth a 67-file diff |
| F9 | i022: the cost was one signature, not two; 18 call sites, 16 of them fixtures. CLEAN stays 🔴 as a chore. the 8% doubt is that the fix may become permanently unavailable |
| F11, F12a, F12b | no SAFE/CLEAN half — each waits on a decision, not a hazard |

⇒ no open row flipped. every reversal above came from a row nobody re-tested until a reviewer forced
it, so a re-test that moves no row is still the re-test at work.
