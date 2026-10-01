# domain.term.choice.reason: define

## .etymology

`define` is the repo's extant verb for every operation in `src/domain.operations/define/`. to
*define* a thing is to say what it **is**, not to move it — which matches: a `define*` returns a
string and opens no file. delivery to disk is `generate`'s.

| rejected | why it says the wrong thing |
| --- | --- |
| `emit` | implies release outward — a write, a side effect. a `define*` returns a value, so `emit` blurs the one split the pair exists for |
| `produce` | generic; reads as manufacture, not specification |
| `render` | implies a target format or surface |
| `build` | taken by the toolchain (`npm run build`) |
| `compose` | names arrangement of extant parts; a `define*` computes content from metadata |
| `write` | the opposite — writes are `generate`'s |

## .disputes

### dispute: emit — raised 2026-08-09 — status: RESOLVED (keep `define`; prose takes `generated`)
- raised.by  = beaver, by habit, 31 uses in `1.vision.yield.md`
- claim      = none argued
- counter    = a third word for a concept the pair covers, with the wrong sense: "the type this
               repo emits" names the output of a `define*`, which emits naught — it returns a
               string that `generate` later writes. a reader would look for a write where there is
               a `return`
- resolution = keep `define` for the operation; prose about the artifact says **generated**,
               already canonical (`.generated/`, the `generate` command). `emit` is forbidden in
               contracts
- note       = unlike the `convert` drift (`term=cast`), no grammar forced this one — pure habit
               from how code generators are discussed. unforced drift is what a glossary sweep
               exists to catch; no single use looked wrong, only the count did

## .evidence
- ~22 `define*` operations, in a directory named `define`
- `defineDaoCodeFilesForDomainObjects.ts` is a `flatMap` that returns `CodeFile` values — no
  filesystem call. the write lives in the `generate` command

## .invariants
- a `define*` **returns** and performs no i/o
- a `define*` is **pure** — same metadata in, same content out. this is why the generator is
  tested by string comparison, without a database
- `defineXForY` computes X for one Y; `defineXsForYs` fans out over it, never reimplements it
- **asymmetric** — every `generate` calls many `define*`; no `define*` calls `generate`
