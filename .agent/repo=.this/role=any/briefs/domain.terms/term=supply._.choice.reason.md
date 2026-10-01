# domain.term.choice.reason: supply

## .etymology

`supply` carries the trade sense: goods are made available, and the recipient decides whether to
take them. that is this generator's posture toward the pg type parsers. the word's value is the
contrast — without it, "should the generator ship the parsers?" could not separate *inert* from
*self-applied*.

| rejected | why it says the wrong thing |
| --- | --- |
| `provide` | a synonym with no extra sense |
| `expose` | reads as visibility; an exposed artifact can still self-apply |
| `install` | the *apply* side — to install is to have taken effect |
| `inject` | in dependency injection the injector acts on the recipient; inverts agency |
| `register` | names the mechanism (`setTypeParser` writes a registry) — what the consumer does once they take the supply |

## .disputes
no dispute raised. `apply` was extant (`--mode apply` across every ehmpathy skill), so the pair
cost one new word.

## .evidence
- **the decision it settled, 2026-08-02** — should the parser module call `setTypeParser` at
  import? no: `pg.types` is process-global, so an applied module would change how every query in
  the consumer's process parses bigints, related to the daos or not
- **both postures ship in one module** — the casts are applied (the generated daos call them, or
  the declared types stay false); `setDbTypeParsers` is supplied

## .invariants
- a supplied artifact holds **no import-time side effect**
- it is **complete** — one call applies it
- the posture is **stated**, never implicit
- **blast radius decides** — an effect bounded to what the generator owns may be applied; one that
  reaches process-global or consumer-owned state must be supplied
