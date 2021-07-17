import { DomainObjectMetadata } from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from './defineSqlSchemaRelationshipForDomainObject';

/**
 * uses the full list of domain objects to define a relationship between its DomainObject representation and its SqlSchema representation
 */
export const defineSqlSchemaRelationshipsForDomainObjects = ({
  domainObjects,
}: {
  domainObjects: DomainObjectMetadata[];
}) =>
  domainObjects.map((domainObject) =>
    defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: domainObjects,
    }),
  );
