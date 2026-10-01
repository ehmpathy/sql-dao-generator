import { SqlSchemaReferenceMethod } from '@src/domain.objects/SqlSchemaReferenceMetadata';
import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';

/**
 * .what = gets the names of the domain objects this one NESTS, deduped and sorted
 * .why  = a nested dao's cast and jsoned shape are imported by name, so the import list and the
 *         property code must agree
 * .note = asks the sql schema relationship, not the domain metadata: only the relationship tells a
 *         nest from a declaration-ref, which reads `{ uuid: ... }` and imports neither symbol
 * .note = every name is a literal's: an entity is referenced, never nested
 * .note = disjoint from `getReferencedDomainObjectNames`, which answers what the unique key needs
 */
export const getAllNestedDomainObjectNames = (input: {
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
}): string[] =>
  [
    ...new Set(
      input.sqlSchemaRelationship.properties
        .filter(
          ({ sqlSchema: sqlSchemaProperty }) =>
            sqlSchemaProperty.reference?.method ===
            SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
        )
        // biome-ignore lint/style/noNonNullAssertion: the filter above proves the reference is present
        .map(({ sqlSchema }) => sqlSchema.reference!.of.name),
    ),
  ].sort();
