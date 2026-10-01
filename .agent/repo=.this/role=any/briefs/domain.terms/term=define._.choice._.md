# domain.term: define

term.chosen   = define
term.kind     = verb
term.synonyms.forbidden:
- emit
- produce
- render
- build
- compose
- write

## .what
to compute the **content** of one artifact this generator hands a consumer — a code string, a sql
statement, a `CodeFile` — and return it. a `define*` touches no disk.

## .the pair — `define` computes, `generate` delivers

| verb | does | leaves |
| --- | --- | --- |
| **define** | computes one artifact's content | a string or a `CodeFile` |
| **generate** | runs the whole pass and writes | files in `.generated/` |

the artifact as it lands in a consumer's repo is **generated** — "the generated cast", never "the
emitted cast". the two terms are a family: reshape both in one round, never one alone.

## .note — outside the org's sanctioned verbs
by `rule.require.get-set-gen-verbs`, `defineX` would read `genX`. `define` stays until disturbed:
it serves ~22 operations and names their directory. new names here take `define` to match.

## .refs
- `src/domain.operations/define/` — every operation beneath it is a `define*`
- `defineDaoUtilCastMethodCodeForDomainObject.ts` · `defineQuerySelectExpressionForSqlSchemaProperty.ts`
  · `defineSqlSchemaViewDomainObjectHydrated.ts` · `defineSqlSchemaReferenceForDomainObjectProperty.ts`
- `src/domain.operations/commands/generate*` — the counterpart that writes

## .reason
- `term=define._.choice.reason.md` — etymology, the `emit` dispute, evidence
