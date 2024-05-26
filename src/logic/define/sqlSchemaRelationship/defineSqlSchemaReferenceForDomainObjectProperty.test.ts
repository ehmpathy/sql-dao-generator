import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { SqlSchemaReferenceMethod } from '../../../domain/objects/SqlSchemaReferenceMetadata';
import {
  defineSqlSchemaReferenceForDomainObjectProperty,
  DirectlyNestedNonDomainObjectReferenceForbiddenError,
  PropertyReferencingDomainObjectNotNamedCorrectlyError,
} from './defineSqlSchemaReferenceForDomainObjectProperty';
import { AmbiguouslyNamedDomainObjectReferencePropertyError } from './getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter/getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter';

describe('defineSqlSchemaReferenceForDomainObjectProperty', () => {
  describe('directly nested reference', () => {
    it('should get domain object reference from a direct nested reference', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'homeAddress',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'Address',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
        of: {
          name: 'Address',
          extends: DomainObjectVariant.DOMAIN_LITERAL,
        },
      });
    });
    it('should get domain object reference from a direct nested array reference', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'externalIds',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.REFERENCE,
            of: {
              name: 'PlaneExternalId',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          },
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
        of: {
          name: 'PlaneExternalId',
          extends: DomainObjectVariant.DOMAIN_LITERAL,
        },
      });
    });
    it('should throw an error if the property is not named after the referenced domain object', () => {
      try {
        defineSqlSchemaReferenceForDomainObjectProperty({
          property: {
            name: 'warDogs',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'PlaneExternalId',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
          allDomainObjects: [],
        });
      } catch (error) {
        expect(error).toBeInstanceOf(
          PropertyReferencingDomainObjectNotNamedCorrectlyError,
        );
      }
    });
    it('should throw an error if the property is ambiguously referenced domain object', () => {
      try {
        defineSqlSchemaReferenceForDomainObjectProperty({
          property: {
            name: 'externalId',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'PlaneExternalId',
                extends: DomainObjectVariant.DOMAIN_LITERAL,
              },
            },
          },
          domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
          allDomainObjects: [
            {
              name: 'PlaneExternalId',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
            {
              name: 'CarExternalId',
              extends: DomainObjectVariant.DOMAIN_LITERAL,
            },
          ] as DomainObjectMetadata[],
        });
      } catch (error) {
        expect(error).toBeInstanceOf(
          AmbiguouslyNamedDomainObjectReferencePropertyError,
        );
      }
    });
    it('should throw an error if a domain-entity was directly referenced', () => {
      try {
        defineSqlSchemaReferenceForDomainObjectProperty({
          property: {
            name: 'externalId',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'PlaneExternalId',
                extends: DomainObjectVariant.DOMAIN_ENTITY,
              },
            },
          },
          domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
          allDomainObjects: [] as DomainObjectMetadata[],
        });
      } catch (error) {
        expect(error).toBeInstanceOf(
          DirectlyNestedNonDomainObjectReferenceForbiddenError,
        );
      }
    });
    it('should throw an error if a domain-event was directly referenced', () => {
      try {
        defineSqlSchemaReferenceForDomainObjectProperty({
          property: {
            name: 'externalId',
            type: DomainObjectPropertyType.ARRAY,
            of: {
              type: DomainObjectPropertyType.REFERENCE,
              of: {
                name: 'PlaneExternalId',
                extends: DomainObjectVariant.DOMAIN_EVENT,
              },
            },
          },
          domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
          allDomainObjects: [] as DomainObjectMetadata[],
        });
      } catch (error) {
        expect(error).toBeInstanceOf(
          DirectlyNestedNonDomainObjectReferenceForbiddenError,
        );
      }
    });
  });
  describe('implicit by uuid reference', () => {
    it('should get domain object reference from an inferred uuid reference', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'userUuid',
          type: DomainObjectPropertyType.STRING,
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [
          {
            name: 'User',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: {
          name: 'User',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      });
    });
    it('should get domain object reference from an inferred uuid reference - uuid reference suffix', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'ownerUserUuid',
          type: DomainObjectPropertyType.STRING,
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [
          {
            name: 'User',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: {
          name: 'User',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      });
    });
    it('should get domain object reference from an inferred uuid reference - without qualifier', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'userUuid',
          type: DomainObjectPropertyType.STRING,
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [
          {
            name: 'PowerUser',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: {
          name: 'PowerUser',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      });
    });
    it('should get domain object reference from an inferred uuid reference - without qualifier and with suffix', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'adminUserUuid',
          type: DomainObjectPropertyType.STRING,
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [
          {
            name: 'PowerUser',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: {
          name: 'PowerUser',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      });
    });
    it('should get domain object reference from an inferred uuid array reference', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'imageUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.STRING,
          },
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [
          {
            name: 'Image',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: {
          name: 'Image',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      });
    });
    it('should get domain object reference from an inferred uuid array reference - without qualifier', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'imageUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.STRING,
          },
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [
          {
            name: 'HostedImage',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: {
          name: 'HostedImage',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      });
    });
    it('should get domain object reference from an inferred uuid array reference - without qualifier and with suffix', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'coverImageUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.STRING,
          },
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [
          {
            name: 'HostedImage',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: {
          name: 'HostedImage',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      });
    });
    it('should get domain object reference from an inferred uuid array reference - uuid reference suffix', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'coverImageUuids',
          type: DomainObjectPropertyType.ARRAY,
          of: {
            type: DomainObjectPropertyType.STRING,
          },
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [
          {
            name: 'Image',
            extends: DomainObjectVariant.DOMAIN_ENTITY,
          },
        ] as DomainObjectMetadata[],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
        of: {
          name: 'Image',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      });
    });
  });
  it('should return null for a non-reference which _could_ be a reference, had the other domain object been part of the metadatas', () => {
    const reference = defineSqlSchemaReferenceForDomainObjectProperty({
      property: {
        name: 'userUuid',
        type: DomainObjectPropertyType.STRING,
      },
      domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
      allDomainObjects: [] as DomainObjectMetadata[],
    });
    expect(reference).toEqual(null);
  });
  it('should return null for a non-reference which could never have been a reference', () => {
    const reference = defineSqlSchemaReferenceForDomainObjectProperty({
      property: {
        name: 'name',
        type: DomainObjectPropertyType.STRING,
      },
      domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
      allDomainObjects: [] as DomainObjectMetadata[],
    });
    expect(reference).toEqual(null);
  });
});
