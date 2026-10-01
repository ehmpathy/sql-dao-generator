# domain.term: nest

term.chosen   = nest
term.kind     = verb | noun
term.synonyms.forbidden:
- embed
- inline
- denormalize
- flatten
- expand

## .what
to carry a domain **literal**'s full shape inside its parent's persisted row, rather than a
pointer to it. its contrast is **reference** (`term=reference`): carry a `uuid`, leave the shape
where it lives.

## .only a literal may be nested
the choice follows from the variant, enforced by `DirectlyNestedNonDomainObjectReferenceForbiddenError`
(`defineSqlSchemaReferenceForDomainObjectProperty.ts:171-188`):

| the referenced dobj is | the method | what is held |
| --- | --- | --- |
| a domain **literal** | `DIRECT_BY_NESTING` | the whole shape, as json |
| an **entity** | `DIRECT_BY_DECLARATION` / `IMPLICIT_BY_UUID` | a `uuid` |

## .the seam with `jsoned`
a nest serializes a literal to json, so `nest` causes the shape `term=jsoned` names. they are two
concepts, and `nested` is forbidden for that shape:

| term | answers |
| --- | --- |
| **nest** | *where does this dobj sit?* — a fact about the domain model |
| **jsoned** | *what types does this shape hold?* — a fact about serialization |

## .note — the extant gerund
the enum member `DIRECT_BY_NEST…` is a gerund (`rule.forbid.gerunds`). it predates the canon and
spans the generator, sql-schema-control, and consumer output, so it stays until disturbed. new
names take `nest`.

## .refs
- `src/domain.objects/SqlSchemaReferenceMetadata.ts` — `SqlSchemaReferenceMethod`
- `src/domain.operations/define/sqlSchemaRelationship/isADirectlyNestedDomainObjectProperty.ts`
- `defineQuerySelectExpressionForSqlSchemaProperty.ts:128-223` — the json select

## .reason
- `term=nest._.choice.reason.md` — etymology, evidence, invariants
