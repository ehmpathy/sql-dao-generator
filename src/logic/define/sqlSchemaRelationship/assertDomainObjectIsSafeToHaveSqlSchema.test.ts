import {
  DomainObjectMetadata,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { assertDomainObjectIsSafeToHaveSqlSchema } from './assertDomainObjectIsSafeToHaveSqlSchema';

describe('assertDomainObjectIsSafeToHaveSqlSchema', () => {
  describe('domain literal', () => {
    it('should throw an error if unique properties are attempted to be defined for domain-literal', () => {
      try {
        assertDomainObjectIsSafeToHaveSqlSchema({
          domainObject: new DomainObjectMetadata({
            name: 'Geocode',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
            properties: {},
            decorations: {
              alias: null,
              primary: null,
              unique: ['latitude'],
              updatable: null,
            },
          }),
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error.message).toContain(
          "domain literals must _not_ have their 'unique' properties specified",
        );
      }
    });
    it('should throw an error if updatable properties are attempted to be defined for domain-literal', () => {
      try {
        assertDomainObjectIsSafeToHaveSqlSchema({
          domainObject: new DomainObjectMetadata({
            name: 'Geocode',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
            properties: {},
            decorations: {
              alias: null,
              primary: null,
              unique: null,
              updatable: ['latitude'],
            },
          }),
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error.message).toContain(
          "domain literals must _not_ have any 'updatable' properties specified",
        );
      }
    });
  });
  describe('domain entity', () => {
    it('should throw an error if domain-entity does not have unique properties defined', () => {
      try {
        assertDomainObjectIsSafeToHaveSqlSchema({
          domainObject: new DomainObjectMetadata({
            name: 'Carriage',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
            properties: {},
            decorations: {
              alias: null,
              primary: null,
              unique: null,
              updatable: [],
            },
          }),
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error.message).toContain(
          "domain entities must have at least one 'unique' property defined in order for a schema to be generated",
        );
      }
    });
    it('should throw an error if domain-entity does not have updatable properties defined', () => {
      try {
        assertDomainObjectIsSafeToHaveSqlSchema({
          domainObject: new DomainObjectMetadata({
            name: 'Carriage',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
            properties: {},
            decorations: {
              alias: null,
              primary: null,
              unique: ['cin'],
              updatable: null,
            },
          }),
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error.message).toContain(
          "domain entities must have their 'updatable' properties defined in order for a schema to be generated.",
        );
      }
    });
  });
  describe('domain event', () => {
    it('should throw an error if unique properties are not defined for a domain-event', () => {
      try {
        assertDomainObjectIsSafeToHaveSqlSchema({
          domainObject: new DomainObjectMetadata({
            name: 'TrainLocatedEvent',
            extends: DomainObjectVariant.DOMAIN_EVENT,
            properties: {},
            decorations: {
              alias: null,
              primary: null,
              unique: null,
              updatable: [],
            },
          }),
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error.message).toContain(
          "domain events must have at least one 'unique' property defined in order for a schema to be generated.",
        );
      }
    });
  });
});
