# fulcrum F7 — defer the nullable `string[]` null guard

case       = F7
title      = defer the nullable `string[]` null guard rather than repair it beside its neighbour
rework     = dirty → clean, measured
status     = reversed — repaired 2026-09-11, i011
confidence = 87% at the defer
caught     = 2026-09-09, stone `5.1.execution.from_vision`, i004
dream      = `.dream/v2026_09_09.fix.nullable-string-array-asserts-non-null.md` — discharged

## .the fork

r010 caught an absent null guard on the cast array branch; it was repaired at once. the native
`string[]` branch beside it asserted `as string[]` with no consult of `isNullable`, so a nullable
`string[]` was asserted non-null.

**taken: repair the reported branch, defer the neighbour.** the reasons: the cast branch crashed and
this route introduced it; the string branch passed null through under a false type, predates the
route, and its `as` satisfies what `sql-code-generator` declares. the rework was graded dirty on a
ripple estimate — every consumer with a nullable `string[]` would see a changed cast.

the 13% named the weak point: the severity grade came from a read, not a run.

## .the widen ask, declined on evidence

i005 r011 asked to fold in the `IMPLICIT_BY_UUID` array arm. the arms differ in the sql, not the cast:

| arm | selected as | a zero-row read arrives |
| --- | --- | --- |
| native `string[]` | a raw array column | `null`, if nullable |
| reference `_uuids` | `COALESCE(array_agg(...), array[]::uuid[])` | `[]`, never `null` |

⇒ on the reference arm the `as string[]` is true by construction. a clamp now pins it: a nullable
reference array carries **no** null guard, and a guard added by false symmetry goes red.

## .the reversal

i011 r011 escalated to blocker, and it was right: `null` declared as `string[]` fails wish acceptance
#2 on its own terms, so the defect is in scope by the wish.

- **the ripple was zero**: no snapshot churned across all 28 suites, because `ARRAY_OF` cannot yet
  express a nullable native array. a ripple estimate is checkable, and cheaper to check than to defer
- shipped: the guard in `getOneCastExpressionForProperty.ts`, mirrored from the elementwise branch;
  the `_uuids` note restated as the invariant *"guard the null, or prove it cannot arrive"*; a clamp
  proven to bite (reverted → red, restored → green)

⇒ the two arms now differ in code exactly as they differ in sql, and a test holds each.
