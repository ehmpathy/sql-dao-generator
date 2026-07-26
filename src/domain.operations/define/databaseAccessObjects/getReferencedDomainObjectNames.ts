import {
  isReferenceArrayProperty,
  isReferenceProperty,
} from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';

export const getReferencedDomainObjectNames = (input: {
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
}): string[] => {
  const referencedDomainObjectNames = input.sqlSchemaRelationship.properties
    .map(
      ({
        domainObject: domainObjectProperty,
        sqlSchema: sqlSchemaProperty,
      }) => {
        // if its not explicitly defined property, then not needed in imports
        if (!domainObjectProperty) return null;

        // if its not part of the unique key, then its not needed in imports
        if (
          !input.sqlSchemaRelationship.decorations.unique.sqlSchema?.includes(
            sqlSchemaProperty.name,
          )
        )
          return null;

        // if its a solo reference to a domain literal, then its needed
        if (isReferenceProperty(domainObjectProperty))
          return domainObjectProperty.of.name;

        // if its a array reference to a domain literal, then its needed
        if (
          isReferenceArrayProperty(domainObjectProperty) &&
          isReferenceProperty(domainObjectProperty.of)
        )
          return domainObjectProperty.of.of.name;

        // otherwise, we dont care about it
        return null;
      },
    )
    .filter(isPresent);
  return referencedDomainObjectNames;
};
