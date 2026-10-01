# domain.term.choice.reason: generate

## .etymology

`generate` names the cli command, its operation, the output dir, and the package. the sense: run a
pass and leave files behind. the emphasis is **delivery**, which parts it from `define`.

| rejected | why it says the wrong thing |
| --- | --- |
| `emit` | forbidden by `term=define` for the same reason; blurs the two halves |
| `output` | a noun in verb duty; names the artifact, not the act |
| `produce` | generic; no sense of a pass over many artifacts |
| `write` | one step of a generate, which also reads config, introspects, and drives three generators |
| `scaffold` | implies a one-time skeleton the consumer edits. a generate is re-run on every change |
| `codegen` (verb) | a second word for this one; legitimate only as a noun |

## .disputes

### dispute: emit — raised 2026-08-09 — status: RESOLVED
argued in `term=define._.choice.reason.md`. the resolution binds both halves: `emit` is forbidden
in contracts; the prose word for the artifact is **generated**.

### dispute: boundary-qualified filename? — raised 2026-09-09 — status: RESOLVED (flat, as a family)
- raised.by  = beaver
- claim      = `rule.require.boundary-qualified-terms` would name this `term=codegen.generate._.*`
- counter    = that rule settles a family once, never term by term. `define` and `generate` are a
               declared pair; to qualify one splits it
- resolution = flat, matched to every cluster in this dir. qualify the family together, with
               `.readme.md`, or not at all

## .evidence
- the sweep of 40 `emit*` uses from the vision yield could not be a blind replace: the adjective
  (`emitted` → `generated`) was mechanical, but each verb had to be read for which half it named
- the pass has an order: `sql-code-generator` runs after we write (`generate.ts:88` vs `:77`) and
  scans the daos root, so our generated module could not sit there — a hazard only expressible if
  `generate` means *a pass with an order and a write*

## .invariants
- a `generate` **writes**; it is the only half with i/o
- **idempotent** — re-run against an unchanged domain, byte-identical output
- it **does not clean** — a renamed generated file leaves an orphan in the consumer's repo
- **asymmetric** — every `generate` calls many `define*`; no `define*` calls `generate`
