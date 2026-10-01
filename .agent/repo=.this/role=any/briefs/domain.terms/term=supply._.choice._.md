# domain.term: supply

term.chosen   = supply
term.kind     = verb
term.synonyms.forbidden:
- provide
- expose
- install
- inject
- register

## .what
to generate an artifact a consumer opts into — inert at import, applied only by a call the consumer
writes. its contrast is **apply**: the artifact takes effect on its own, at import.

| posture | the artifact | who triggers the effect |
| --- | --- | --- |
| **supply** | exports a named operation; no import-time effect | the consumer |
| **apply** | takes effect when imported | the generator |

## .refs
- `setDbTypeParsers` in the generated `.generated/casts.ts` — supplied, never applied
- the `asFromDatabase` casts in the same module — applied, by the generated daos that call them

## .reason
- `term=supply._.choice.reason.md` — etymology, evidence, invariants
