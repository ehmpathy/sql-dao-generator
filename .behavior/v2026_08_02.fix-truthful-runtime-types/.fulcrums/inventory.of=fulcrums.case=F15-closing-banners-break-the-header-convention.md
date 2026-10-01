# fulcrum F15: keep the two post-run banners as noun phrases, off the participle header convention

- caught = 2026-09-17, i003 — `enroll-verif-snapshot-blemishes` (r011), nitpick 1, `[nitpick][better]`
- rework = clean
- status = open
- confidence = 91%

## .the fork

every stage header `generate` prints is a progress participle (`🔎 Loading domain objects…`). the two
banners this diff adds are not:

```
🔌 One opt-in remains: your hand-written queries still read numeric and bigint as strings.
📦 One dependency is required: the generated casts throw a DbValueCastError, which …
```

| candidate | cost |
| --- | --- |
| a progress participle | it would claim a present act; these lines state what is true after the run ends |
| keep the noun phrase ✅ | the shape diverges from its neighbours |
| the reviewer's `Wiring pg type parsers is optional:` | an `-ing` form in the subject slot — a gerund-as-noun, which `rule.forbid.gerunds` (ehmpathy/mechanic) bars at blocker over log output, and the write hook refuses |

⇒ the extant headers pass that rule because they are progress participles. the banners cannot be
one without a false claim, so the only wording that matches the convention is the barred one.

## .what was taken

keep the noun phrases. the shape difference carries the content difference; the reviewer confirms
they *read clearly on their own*.

## .why clean, and still a row

two string literals and their acceptance snapshot. the row exists because the repair is barred, not
costly — only a council that may amend the rule changes it.

## .the 9%

an imperative — `Wire the pg type parsers — optional:` — obeys both rules and matches neither
register. it was not taken and no second eye weighed it.

## .where

- `src/contract/commands/__snapshots__/generate.acceptance.test.ts.snap` — both banners, and their
  `[t4]` re-run capture
- `.reviews/peer/5.3.verification._.review.i003.3cb58a56cc7391dab4.r011._.taken.by_self.enroll-verif-snapshot-blemishes.md`

no dream owed — the call keeps what shipped.
