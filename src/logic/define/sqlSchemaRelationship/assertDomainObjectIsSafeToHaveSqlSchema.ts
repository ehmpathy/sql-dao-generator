import { DomainObjectMetadata, DomainObjectVariant } from 'domain-objects-metadata';
import { UserInputError } from '../../UserInputError';

export const assertDomainObjectIsSafeToHaveSqlSchema = ({ domainObject }: { domainObject: DomainObjectMetadata }) => {
  // make sure that entities have "unique" and "updatable" defined
  if (domainObject.extends === DomainObjectVariant.DOMAIN_ENTITY) {
    if (!domainObject.decorations.unique?.length)
      throw new UserInputError({
        reason:
          "domain entities must have at least one 'unique' property defined in order for a schema to be generated.",
        domainObjectName: domainObject.name,
        potentialSolution:
          "(note: if its not unique on any natural keys, please specify the 'uuid' as it's only unique property. e.g., `['uuid']`) ",
      });
    if (!Array.isArray(domainObject.decorations.updatable))
      throw new UserInputError({
        reason:
          "domain entities must have their 'updatable' properties defined in order for a schema to be generated. ",
        domainObjectName: domainObject.name,
        potentialSolution:
          '(note: if it has no updatable properties, please specify this with an empty array. e.g., `[]`) ',
      });
  }

  // make sure that value objects do not have unique or updatable defined
  if (domainObject.extends === DomainObjectVariant.DOMAIN_VALUE_OBJECT) {
    if (domainObject.decorations.unique)
      throw new UserInputError({
        reason:
          "domain value objects must _not_ have their 'unique' properties specified. value objects are unique on all of their properties by definition.",
        domainObjectName: domainObject.name,
      });
    if (domainObject.decorations.updatable)
      throw new UserInputError({
        reason:
          "domain value objects must _not_ have any 'updatable' properties specified. value objects do not have any updatable properties by definition.",
        domainObjectName: domainObject.name,
      });
  }

  // make sure that events have "unique" defined
  if (domainObject.extends === DomainObjectVariant.DOMAIN_EVENT) {
    if (!domainObject.decorations.unique?.length)
      throw new UserInputError({
        reason: "domain events must have at least one 'unique' property defined in order for a schema to be generated",
        domainObjectName: domainObject.name,
      });
  }
};
