# fulcrum F4: defer a glossary-fed forbid-terms hook rather than wire one now

- caught = 2026-09-09
- rework = dirty
- status = open
- confidence = 93% (raised from 90% by r4)

## .the fork

this repo's forbidden synonyms are enforced by **review**; the org's by a **hook**. the review pass
measurably fails:

| term | its state | what a grep found |
| --- | --- | --- |
| `caster` | settled, dated, in the glossary | 24 uses in 6 files, one in cli stdout |
| `emit` | the above, plus a completed sweep | 4 more, in new files, days later |
| `caster`, after the r3 sweep | 24 of 25 repaired | the survivor is `getOneCasterNameForProperty` — an exported operation name, the one tier the rule grades a blocker |
| `dbRow` | declared forbidden | `AsJsonFromDbRow<T>`, a type generated into every consumer's repo |

⇒ the mechanism: a word-boundary grep finds a term in prose and misses it inside a camelCase
identifier. **a human sweep is blind to exactly the position the rule cares most about.** so an
identifier-only hook complements the review pass rather than rivals it. rate: 2 of the 11 names this
route introduced (18%) were forbidden synonyms, both caught by review, neither by a tool.

🟡 not the whole remedy: two authors on this branch renamed a symbol out of each other's sight, and a
per-write hook cannot see that.

| option | cost |
| --- | --- |
| A. block on identifier positions only | misses prose — which the human pass catches |
| B. block identifiers, tally prose as advisory | more output per write |
| C. block every literal hit | 🔴 refuted — the rule tolerates a synonym in a comment, so it would block conformant prose |
| D. defer, catch a dream ✅ | the gap persists; the known violations are repaired |

## .what was taken

**D.** SAFE 🔴: it changes what blocks a write repo-wide, with a concurrent writer live on the branch.
CLEAN 🔴: the hook lives in vendored `.agent/`, owned by `rhachet-roles-ehmpathy`; a local edit is
overwritten by the next `roles boot`. a wrong bound is an upstream release cycle.

## .the confidence — 93%

the residual is the grade: the A/B bound decides what a writer may write, which is the wisher's
boundary. the prior doubt — a sample of one author — is discharged: the blindness belongs to the
instrument, not the author.

## .where

- reseed: `ehmpathy/rhachet-roles-ehmpathy#773`
- evidence: `review/self/for.5.1.execution.from_vision._.r3.has-consistent-conventions.md`
- the source a hook would read: `.agent/repo=.this/role=any/briefs/domain.terms/term=*._.choice._.md`
- the mechanism it would extend: `claude.hooks/pretooluse.forbid-terms.blocklist`
