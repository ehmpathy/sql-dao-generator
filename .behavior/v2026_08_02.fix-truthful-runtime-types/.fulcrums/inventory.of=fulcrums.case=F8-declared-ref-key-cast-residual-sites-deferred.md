# fulcrum F8: defer the declared-ref key cast at its three residual sites

- caught = 2026-09-10
- rework = dirty → **clean** — the dirt was a wrong file path
- status = **closed 2026-09-13** — all three sites repaired
- confidence = 89%, and the 11% is what fell

## .the fork

peer `mech-decode-friction` (i006 r003) named the `_ref` → `_uuid` derivation as positional
extraction. it moved into `asDbObjectKeyForDeclaredRef` and was adopted at the three in-diff sites.
three more raw copies remained:

| file | line |
| --- | --- |
| `defineDaoFindByMethodCodeForDomainObject.ts` | 384-385 |
| `defineQuerySelectExpressionForSqlSchemaProperty.ts` | 110, 123 |

**taken: adopt in-diff, defer the residual.** SAFE ✅ (every site snapshot-pinned). CLEAN 🔴: the
query-select file was believed to sit under `sqlSchemaRelationship/`, so the swap would force an
unexamined sideways import. the 11% named the risk: *"I have not verified that the sideways import
is genuinely forbidden."*

## .what the defer got wrong

- **the find-by site** never carried the import question — it sits in the cast's own directory.
  repaired at i011, when `enroll-impl-arch-defects` sorted the three sites
- **the query-select sites**: the file has always lived in `databaseAccessObjects/`, the cast's own
  directory. one `Glob` settles it. and it already imports from `sqlSchemaRelationship/` three times
  (lines 8-10), so even the recorded direction had precedent. repaired at i016

## .the hazard was live, not future

the row argued four copies of one rule **could** disagree after a future edit. they already did:

| input | the hand-rolled chain | the cast |
| --- | --- | --- |
| `carriageRef`, `isArray: true` | `carriage_uuid` | `carriage_ref` |

the chain ignored cardinality. the query and the cast would name different columns, and no type
check sees it — both sides are strings.

## .what shipped

- all three sites call `asDbObjectKeyForDeclaredRef({ propertyName, isArray })`
- a cross-definer clamp in `getOneDbObjectKeyForProperty.test.ts`: the query alias must equal the
  cast key, `carriage_ref` refused on both sides
- zero snapshot churn without `--resnap`, so the generated sql is byte-identical
- teeth: `isArray` forced `false` → 7 passed / 1 failed, the clamp. restored → 8 passed, suite 346

## .the lesson

the check that would have settled the defer was filed under *"belongs to the fix."* it cost one
`Glob`. **a structural unknown that gates a deferral belongs to the DEFER, never to the fix.**
