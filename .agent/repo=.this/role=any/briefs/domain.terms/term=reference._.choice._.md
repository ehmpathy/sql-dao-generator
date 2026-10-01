# domain.term: reference

term.chosen   = reference
term.kind     = verb | noun   # "the row references the agent" / "a reference to the agent"
term.synonyms.forbidden:
- link
- pointer
- relate
- associate
- foreign-key
- fk

## .what
to carry a **pointer** to another domain object — its identity, as a `uuid` — and leave its state
where it lives, read on lookup. its contrast is **nest** (`term=nest`), which holds the method table.

## .an entity is referenced, never nested — a law, not a policy
an entity is mutable, so a nested copy could never know whether it is current: no version, no
invalidation, no staleness signal. it is *unknowably* stale, and no correct code can be written
against that. a literal has no independent life to diverge from, so a copy is exact forever.

⇒ the choice is derived from the variant, never made. the generator enforces it
(`DirectlyNestedNonDomainObjectReferenceForbiddenError`), but the enforcement is not the source.
`handoff.rhachet-roles-ehmpathy.md` dispatches the law to org scope.

## .note — the enum uses a wider sense
`SqlSchemaReferenceMethod` includes `DIRECT_BY_NESTING`. that is the sql-schema layer's word for
"a property that points at another domain object", one altitude down. it does not make nest a kind
of reference in the domain sense.

## .refs
- `src/domain.objects/SqlSchemaReferenceMetadata.ts`
- `src/domain.operations/define/sqlSchemaRelationship/defineSqlSchemaReferenceForDomainObjectProperty.ts`
- `Ref<typeof X>` — the `domain-objects` vocabulary this term wraps

## .reason
- `term=reference._.choice.reason.md` — etymology, the genus/species dispute, evidence
