# domain.term: generate

term.chosen   = generate
term.kind     = verb | adj   # "the cli generates the daos" / "the generated cast"
term.synonyms.forbidden:
- emit
- output
- produce
- write
- scaffold
- codegen

## .what
to run a whole codegen pass and **write** its result to disk — every `define*` the pass composes,
then the files that land in the consumer's repo. its contrast is **define**, which computes one
artifact and performs no i/o (the pair table lives in `term=define`).

## .the adjective is the reader's word
the artifact in a consumer's repo is **generated** — "the generated dao". this is the conformant
prose word, and why `emit` is forbidden: it names the same concept with a write sense applied to
the half that writes naught.

## .note — `codegen` is a noun here
`codegen.sql.dao.yml` and `sql-code-generator` use `codegen` for the practice and its config. that
is legitimate. `codegen` as a verb ("we codegen the parsers") is the forbidden synonym.

## .refs
- `src/contract/commands/generate.ts` — the cli command, this repo's one public entrypoint
- `src/domain.operations/commands/generate.ts` — runs the pass and writes
- `src/domain.operations/save/saveGeneratedSqlSchemaGeneratorCodeFiles.ts` — the write half
- `src/domain.objects/GeneratedCodeFile.ts`
- `.generated/` — the output dir every consumer imports from

## .reason
- `term=generate._.choice.reason.md` — etymology, the flat-name dispute, invariants
