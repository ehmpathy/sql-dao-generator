# F12 — the cast runtime ships as generated code rather than a package

| field | value |
| --- | --- |
| **case** | F12, split at i024 into F12a and F12b |
| **title** | keep the cast runtime as generated code · keep the pg-wire verification engine in this repo |
| **rework** | dirty |
| **status** | open — reviewer r011 ruled `extract` on both halves at i025 |
| **confidence** | F12a 58% · F12b 62% |
| **caught** | 2026-09-13, i022, `enroll-impl-arch-defects` r011, nitpick 2 |
| **dream** | `.dream/v2026_09_20.feat.ship-dao-utils-as-a-runtime-package.md` |

## .the fork

vision assumption #3: *"casters ship as a generated file, not a new runtime dependency … to add a
runtime package to every consumer is a larger cost than one more generated file."*

the trade was priced at **one more generated file** that holds two small casts. what ships is
`.generated/casts.ts`, 645 lines: the two casts, their namespace, `AsJsonFromDbObject`, the error
classes, and `setDbTypeParsers` — the largest section, a probe-and-compare engine.

| | the question | the axis |
| --- | --- | --- |
| **F12a** | does the cast runtime ship as generated code, or as a published package? | distribution |
| **F12b** | does a sql→dao generator own a pg-wire-behavior verification engine at all? | bounded context |

⇒ the two are independent: F12b can be answered `no` while F12a is answered `keep`.

## .the decisive fact — the definer takes no input

```ts
export const defineDaoCastsCodeFile = (): GeneratedCodeFile => { … }   // defineDaoCastsCodeFile.ts:64
```

every section definer is `(): DaoCastsSection`. so every byte of `casts.ts` is identical in every
consumer's repo, under every schema. a generator that writes the same bytes regardless of input
distributes a package by copy.

🟡 the seam is clean: `findById.ts`, `upsert.ts`, `castFromDatabaseObject.ts` are schema-shaped and
could never be a package. `casts.ts` is the one generated file that is not. the reviewer's model for
the right shape is `defineDbObjectShapesForCastMethod.ts`: schema-derived, so it stays in codegen.

## .the case for each side

| argument | holds? |
| --- | --- |
| keep: **no new dependency** on every consumer | 🔴 spent. a generated dao already imports seven runtime packages (`type-fns`, `visualogic`, `helpful-errors`, `domain-objects`, `procedure-fns`, `yesql`, `pg`), and the org's `declapract-typescript-ehmpathy` mandates six of them as production dependencies. an eighth adds a row to an extant list |
| keep: **version skew** — a generated file is pinned to its generator; a package can drift from the daos that import it | holds. the strongest argument for keep |
| keep: **auditability** — the code sits in the consumer's tree | weak. 645 lines of guard logic in a regeneration diff is a review nobody performs |
| extract: **propagation** — a fix needs every consumer to regenerate, not `npm update` | holds. this route repairs a silent wrong value — the defect class most likely to need a fast fix later |
| extract: **the template-string blind spot** — tsc and eslint cannot see inside a string, so a dropped backslash in a regex changes cast behavior silently | holds, and the drive's own `.note` already conceded it. real `.ts` source closes it by construction |
| F12b: **ownership** — this generator picks the column types, so it knows which oids its schema produces | establishes ownership of the **fact**, never of the **engine** that verifies it. the engine reads no metadata; it probes a foreign library's process-global registry |

## .the vehicles, measured

- **no bundle exists.** `package.json` `main` is `dist/contract/index.js`; `src/contract/` holds no
  `index.ts`. this package is cli-only, so extract means a new published package at full cost
- **`sql-code-generator` is refused as the vehicle.** it is a `devDependency` in the org's
  `persist-with-rds` practice, so `npm ci --omit=dev` drops it; its `dist/contract/` holds only a
  cli; and it reads sql text rather than runtime values
- 🟡 **a middle path**: condition the emission on whether any domain object needs a cast. a schema of
  only string/boolean/uuid/enum properties receives the whole module and can never reach it. cheaper
  than either side; answers neither question; retired by an `extract` verdict
- 🟡 side defect surfaced here: `procedure-fns` is imported by every generated dao `index.ts` and
  declared by no practice — it resolves by npm hoist alone

## .rework — dirty

publish a package, add a dependency to every consumer, rewrite the definer into an import emitter,
re-cut every snapshot. a consumer who regenerates sees 645 lines deleted and an import added. and it
is a different route: the wish's `.scope` is this repo, and no stone asks for a new package.

## .confidence

| | i022 | i025 | i031 | why |
| --- | --- | --- | --- | --- |
| F12a | 82% | 71% | 58% | i025: the template-string blind spot. i031: the seven-package count spends the vision's stated reason |
| F12b | 78% | 62% | 62% | r011 settled against `keep` the category error this row named and left open |

⇒ the drive defends neither half on the merits — only on scope. F11 refutes its alternatives on
mechanism; F12 defers to appetite, and says so.

## .reviewer r011, i025 — one argued opinion, not the council's

- **F12b: extract it** — *"a verification engine that reads no metadata and instead probes
  `node-postgres`'s live process-global registry is a different problem someone else should own as
  a real package (e.g. `pg-type-parser-guard`)"*
- **F12a: extract, once F12b resolves** — one package carries both, so the council rules on one
  follow-on route

## .where

- `src/domain.operations/define/databaseAccessObjects/defineDaoCastsCodeFile.ts:64` + the six
  `defineDaoCastsSection*.ts`
- output: `…/exampleProject/src/access/daos/.generated/casts.ts`
- the assumption this re-opens: `1.vision.yield.md`, assumption #3

## .the verdict

_unruled by the council — the first row it should sit for. `keep` now rests on scope and appetite
alone; `extract` is a follow-on route, scoped in the dream._
