# domain.term.choice.reason: reference

## .etymology

to refer to an object is to name it, not reproduce it. the object stays; you hold a way to find it.
that is what a `uuid` column does.

| rejected | why it carries the wrong sense |
| --- | --- |
| `link` | a ui/web word; a navigational sense persistence lacks |
| `pointer` | a memory-model word; an address in a process, not an identity in a domain |
| `relate` / `associate` | empty — every property relates its object to a value |
| `foreign-key` / `fk` | the sql mechanism, which exists *because* of the reference |

## .disputes

### dispute: is `nest` the contrast of `reference`, or a kind of it? — raised 2026-08-13 — status: RESOLVED (the contrast)
- raised.by  = beaver
- claim      = `DIRECT_BY_NESTING` is a member of `SqlSchemaReferenceMethod`, so nest looked like a
               species of reference. `term=nest` was edited on that basis
- counter    = the wisher: an entity is mutable, so it cannot be nested as a matter of logic, not
               policy. **carry identity** versus **carry the value** are genuine opposites at the
               domain altitude
- resolution = contrasts. the enum's wider sense sits one altitude below. `term=nest` was reverted
- lesson     = the claim reasoned from an enum name — a map — to overrule a domain law
               (`def.domain-discovery`: *the schema is not the domain*). it treated the throw as
               the whole reason. before a declared relation is revised, ask what makes it true
               outside the code that implements it

## .evidence
- an entity has identity and a lifecycle; a literal is defined by its values. a copy is lossless
  for a literal and unknowably stale for an entity
- `defineSqlSchemaReferenceForDomainObjectProperty.ts:171-188` enforces the law downstream
- `SqlSchemaReferenceMetadata.ts:5-20`'s own doc comments call nest *"directly nested"* and only
  the other two *"referenced"*
- only nested literals reach json, so a consumer whose references are all entities feels none of
  the runtime-type divergence

## .invariants
- an **entity** is referenced, always
- a **literal** is nested, not referenced — it has no identity to point at
- the choice is **derived** from the variant
- a reference is **directional** — the referenced object holds no back-link
- a reference stays correct as the referenced entity changes
- a deliberate snapshot (an invoice's price *as of* the sale) is **a literal** named for its
  snapshot semantics, not a nested entity
