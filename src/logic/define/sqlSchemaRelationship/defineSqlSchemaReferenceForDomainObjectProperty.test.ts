import { getError } from '@ehmpathy/error-fns';
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
      const error = getError(() =>
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
        }),
      );
      expect(error).toBeInstanceOf(
        PropertyReferencingDomainObjectNotNamedCorrectlyError,
      );
    });
    it('should throw an error if the property is ambiguously referenced domain object', () => {
      const error = getError(() =>
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
        }),
      );
      expect(error).toBeInstanceOf(
        AmbiguouslyNamedDomainObjectReferencePropertyError,
      );
    });
    it('should throw an error if a domain-entity was directly referenced', () => {
      const error = getError(() =>
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
        }),
      );
      expect(error).toBeInstanceOf(
        DirectlyNestedNonDomainObjectReferenceForbiddenError,
      );
    });
    it('should throw an error if a domain-event was directly referenced', () => {
      const error = getError(() =>
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
        }),
      );
      expect(error).toBeInstanceOf(
        DirectlyNestedNonDomainObjectReferenceForbiddenError,
      );
    });
    it('should get domain object reference from a direct nested reference, with prefix name', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'priceCharged',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'Price',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
        domainObject: { name: 'ExampleThing' } as DomainObjectMetadata,
        allDomainObjects: [{ name: 'Price' } as DomainObjectMetadata],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
        of: {
          name: 'Price',
          extends: DomainObjectVariant.DOMAIN_LITERAL,
        },
      });
    });
    it('should get domain object reference from a direct nested reference, with a couple of similar options, but exactly one most specific', () => {
      const reference = defineSqlSchemaReferenceForDomainObjectProperty({
        property: {
          name: 'issuerRef',
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'InvoiceIssuerRef',
            extends: DomainObjectVariant.DOMAIN_LITERAL,
          },
        },
        domainObject: { name: 'InvoiceIssuerRef' } as DomainObjectMetadata,
        allDomainObjects: [
          { name: 'InvoiceIssuerRef' } as DomainObjectMetadata,
          { name: 'InvoiceReceiverRef' } as DomainObjectMetadata,
        ],
      });
      expect(reference).toEqual({
        method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
        of: {
          name: 'InvoiceIssuerRef',
          extends: DomainObjectVariant.DOMAIN_LITERAL,
        },
      });
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
