# domain.term.choice.reason: nest

## .etymology

`nest` carries the sense a reader holds from data structures and birds alike: an item sits
**inside** another, whole, and belongs to it. it carries the right asymmetry too — a nest belongs
to its host, never the reverse.

| rejected | why it says the wrong thing |
| --- | --- |
| `embed` | a near-synonym with no extra sense; taken in the industry (embedded documents, embeddings) |
| `inline` | reads as a performance or layout choice, when it is a domain-model decision |
| `denormalize` | frames it as a tradeoff taken for speed. a literal has no identity to split out, so this is the correct shape, not a concession. also blocked org-wide |
| `flatten` | the opposite — the shape gains a level |
| `expand` | a read-time hydration (a rest "expand" param), not a persistence shape |

## .disputes
no dispute raised. the word was the generator's own (`SqlSchemaReferenceMethod`,
`isADirectlyNestedDomainObjectProperty`).

## .evidence
- `SqlSchemaReferenceMetadata.ts:5-20` declares three methods; its doc comment states the limit —
  *"when a domain literal is directly nested in another domain object"*
- `defineSqlSchemaReferenceForDomainObjectProperty.ts:171-188` permits the nest method only for
  `DOMAIN_LITERAL`, and the error body teaches the `Ref<typeof X>` alternative
- a vision draft used "an entity nested inside another" as its central example; that example throws
  at codegen. the constraint does real work
- **it bounds the defect** — only nested literals reach json, so only a nested literal with a
  `DATE` or `NUMBER` property suffers the runtime-type divergence

## .invariants
- a nested dobj is **always** a literal
- a nest is **whole** — every declared property; a subset would be a projection
- a nest is **json on the wire** — no `Date`, no int8, so any read of a nested value must cast
  (`term=cast`)
- a nest **may be an array** (`json_agg`); empty is `[]`, never `null`, via
  `COALESCE(..., '[]'::json)`
