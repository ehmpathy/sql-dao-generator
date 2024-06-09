import { UnexpectedCodePathError } from '@ehmpathy/error-fns';
import { isPresent } from 'type-fns';

import { SqlSchemaToDomainObjectRelationship } from '../../../domain';

/**
 * .what = defines the order in which schemas must be provisioned to ensure their dependent references are available
 * .why =
 *   - guarantees that if this order is followed, there will be no schema declaration issues
 */
export const defineDependentReferenceAvailableProvisionOrder = ({
  sqlSchemaRelationships,
}: {
  sqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}): { order: string[]; reason: Record<string, string[]>; depth: number } => {
  // create a map of DobjName -> ReferencedDobjName[]
  const dependencyMap = sqlSchemaRelationships.reduce(
    (summary, thisRelationship) => {
      const key = thisRelationship.name.domainObject;
      const value = [
        ...new Set(
          thisRelationship.properties
            .map((property) => property.sqlSchema.reference?.of.name)
            .filter(isPresent),
        ),
      ];
      return {
        ...summary,
        [key]: value,
      };
    },
    {} as Record<string, string[]>,
  );

  // loop through each until its dependencies are in the sorted array
  const dobjNamesToOrder = Object.keys(dependencyMap).sort();
  const order: string[] = [];
  let iterations = 0;
  while (order.length < dobjNamesToOrder.length) {
    // increment the iterations; fail fast if we've iterated more than 21 times. there should not be a reason to have a reference depth of 21+ times, meaning there's probably a cyclical reference
    iterations++;
    if (iterations > 21)
      throw new UnexpectedCodePathError(
        'attempted to resolve reference order for more than 21 iterations. is there a cyclical import?',
        { dependencyMap: dependencyMap },
      );

    // loop through each dobj
    for (const dobjName of dobjNamesToOrder) {
      // if already ordered, no need to try again
      if (order.includes(dobjName)) continue;

      // if a dependency is not found yet, continue until it is
      const dependencies = dependencyMap[dobjName];
      if (!dependencies)
        throw new UnexpectedCodePathError(
          'could not find dependencies for dobj. how is that possible?',
          { dobjName, dependencies },
        );
      const hasSomeDependencyMissed = dependencies.some(
        (dependency) => !order.includes(dependency),
      );
      if (hasSomeDependencyMissed) continue;

      // otherwise, add this dobj to the order
      order.push(dobjName);
    }
  }

  return {
    order: order,
    reason: dependencyMap,
    depth: iterations,
  };
};
