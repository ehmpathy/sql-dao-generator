# fulcrum F5: defer the 67-file `import type` sweep of extant generated output

- caught = 2026-09-09
- rework = dirty
- status = open
- confidence = 91%

## .the fork

generated code imports type-only symbols in value form, so a consumer with
`verbatimModuleSyntax: true` cannot compile it (TS1484). the finds split in two:

| instance | files | verdict |
| --- | --- | --- |
| `AsJsonFromDbObject` — introduced by this route | 5 | ✅ fixed in-round |
| `HasMetadata` — predates the route | 67 | 🌙 deferred — SAFE, not CLEAN |

| option | cost |
| --- | --- |
| A. sweep all 67 now | one `sedreplace`; a 67-file churn of output this route never touched |
| B. sweep, plus a `verbatimModuleSyntax` clamp | the whole fix. the clamp is a second tsc pass over the example project — new test infrastructure, its own design call |
| C. defer both | the hazard persists, unchanged from before the route |
| D. fix the route's own instance, defer the 67 ✅ | the line is the measurement |

## .what was taken

**D.** `rule.always.fix-forward-under-scouts-honor` grades SAFE-not-CLEAN as *defer and raise a
fulcrum*. B is why it is a fulcrum rather than a plain dream: a sweep without the clamp regresses on
the next type-only import, and a new gate on generated output is a scope call the wisher owns.

## .why dirty

67 fixture files, the definer templates, every snapshot that pins the line, and under B a new tsc
pass. a consumer who regenerates sees all 67 lines move, which needs a release note either way.

## .the 9%

the hazard is real downstream and invisible here: this repo's tsconfig carries
`importsNotUsedAsValues: "remove"`, which rules out `verbatimModuleSyntax`, so our gates are green. a
wisher who weighs *"a consumer cannot compile our output"* above *"the diff is large"* is right to
overrule.

the counter: no consumer is worse off than before the route, and a 67-file churn inside a
runtime-type route makes both changes harder to review.

re-test 2026-09-13: still 67 matches across 67 files.

## .where

- dream: `.behavior/v2026_08_02.fix-truthful-runtime-types/dreams/v2026_09_09.fix.generated-code-imports-a-type-in-value-form.md`
- type-only evidence: `node_modules/type-fns/dist/checks/hasMetadata.d.ts:26` (`export type`) vs `:54` (runtime `hasMetadata`)
