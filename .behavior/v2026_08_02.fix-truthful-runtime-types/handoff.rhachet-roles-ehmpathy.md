# handoff -> `ehmpathy/rhachet-roles-ehmpathy`

## .what

an org-scope rule for a foundational domain-model constraint:

> **a domain entity is referenced, never nested. only a domain literal may be nested.**

- home: `role=mechanic/briefs/practices/code.prod/evolvable.domain.objects/`, beside `rule.require.immutable-refs`
- name: `rule.forbid.nested-entities.md` — a `forbid`, so blocker

## .why this is a law, not a generator quirk

today one place enforces it: `ehmpathy/sql-dao-generator` throws
`DirectlyNestedNonDomainObjectReferenceForbiddenError` on a nested entity. that placement makes it
look like a persistence detail. the reason is upstream of any tool:

**an entity is mutable, so a nested copy cannot know whether it is current.**

| | identity | mutates? | what a copy means |
| --- | --- | --- | --- |
| **entity** | its own (uuid / unique key) | yes | a snapshot with no staleness signal and no way to invalidate it |
| **literal** | none — it *is* its values | no — a new value is a new literal | exact, forever |

- **reference an entity** — carry its identity, read current state on lookup. a nested copy is
  **unknowably** stale: no version, no signal, so no correct code can be written against it
- **nest a literal** — it has no life to diverge from; its values are its identity

the argument holds in any medium — a json payload, a cache entry, an event, a document. that is why
it belongs at org scope.

## .the edgecase the rule must address

> an invoice line item records the price **as of** the sale, not the price today.

that is a **literal** that carries copied values, named for its snapshot semantics — `PriceAtSale`,
not a nested `Price` entity. a snapshot literal says *"this is what it was then, and never changes"*;
a nested entity says *"this is what it is now"*, and lies.

## .scope sketch (advisory — the HOW is yours)

- the table above, and the two directives
- the snapshot-literal edgecase, so the rule reads as a guide rather than a bare ban
- `sql-dao-generator`'s throw, named as one enforcement of the law rather than its source
- `.examples`: `agent: Agent` (bad) · `agentUuid: string` or `agent: Ref<typeof Agent>` (good) ·
  `media: SmsMedia[]` as the licensed nested case

🟡 the architect role may want a `domain.discovery` companion: whether a concept is an entity or a
literal is a discovery output — it depends on whether it has a life of its own.

## .context

- origin: `ehmpathy/sql-dao-generator`, route `.behavior/v2026_08_02.fix-truthful-runtime-types`,
  where the constraint bounded a runtime-type defect — only nested literals reach json, so only they
  diverge
- that repo's glossary holds it (`term=nest`, `term=reference`); a repo glossary is the wrong
  altitude, since every repo that models a domain needs it

---

dispatched by beaver 🦫 on behalf of the sql-dao-generator route —
`ehmpathy/rhachet-roles-ehmpathy#669`, QUEUED 2026-09-09
