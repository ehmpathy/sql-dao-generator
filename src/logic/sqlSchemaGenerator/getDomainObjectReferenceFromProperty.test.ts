import { DomainObjectMetadata, DomainObjectPropertyType, DomainObjectVariant } from 'domain-objects-metadata';
import {
  DomainObjectReferenceMethod,
  getDomainObjectReferenceFromProperty,
} from './getDomainObjectReferenceFromProperty';

describe('getDomainObjectReferenceFromProperty', () => {
  it('should get domain object reference from a direct nested reference', () => {
    const reference = getDomainObjectReferenceFromProperty({
      propertyName: 'home_address',
      propertyDefinition: {
        type: DomainObjectPropertyType.REFERENCE,
        of: {
          name: 'Address',
          extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
        },
      },
      allMetadatas: [],
    });
    expect(reference).toEqual({
      method: DomainObjectReferenceMethod.DIRECTLY_NESTED,
      isArray: false,
      of: {
        name: 'Address',
        extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
      },
    });
  });
  it('should get domain object reference from a direct nested array reference', () => {
    const reference = getDomainObjectReferenceFromProperty({
      propertyName: 'external_ids',
      propertyDefinition: {
        type: DomainObjectPropertyType.ARRAY,
        of: {
          type: DomainObjectPropertyType.REFERENCE,
          of: {
            name: 'PlaneExternalId',
            extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
          },
        },
      },
      allMetadatas: [],
    });
    expect(reference).toEqual({
      method: DomainObjectReferenceMethod.DIRECTLY_NESTED,
      isArray: true,
      of: {
        name: 'PlaneExternalId',
        extends: DomainObjectVariant.DOMAIN_VALUE_OBJECT,
      },
    });
  });
  it('should get domain object reference from an inferred uuid reference', () => {
    const reference = getDomainObjectReferenceFromProperty({
      propertyName: 'userUuid',
      propertyDefinition: {
        type: DomainObjectPropertyType.STRING,
      },
      allMetadatas: [
        {
          name: 'User',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      ] as DomainObjectMetadata[],
    });
    expect(reference).toEqual({
      method: DomainObjectReferenceMethod.INFERRED_BY_UUID,
      isArray: false,
      of: {
        name: 'User',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
      },
    });
  });
  it('should get domain object reference from an inferred uuid reference - uuid reference suffix', () => {
    const reference = getDomainObjectReferenceFromProperty({
      propertyName: 'ownerUserUuid',
      propertyDefinition: {
        type: DomainObjectPropertyType.STRING,
      },
      allMetadatas: [
        {
          name: 'User',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      ] as DomainObjectMetadata[],
    });
    expect(reference).toEqual({
      method: DomainObjectReferenceMethod.INFERRED_BY_UUID,
      isArray: false,
      of: {
        name: 'User',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
      },
    });
  });
  it('should get domain object reference from an inferred uuid array reference', () => {
    const reference = getDomainObjectReferenceFromProperty({
      propertyName: 'imageUuids',
      propertyDefinition: {
        type: DomainObjectPropertyType.ARRAY,
        of: {
          type: DomainObjectPropertyType.STRING,
        },
      },
      allMetadatas: [
        {
          name: 'Image',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      ] as DomainObjectMetadata[],
    });
    expect(reference).toEqual({
      method: DomainObjectReferenceMethod.INFERRED_BY_UUID,
      isArray: true,
      of: {
        name: 'Image',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
      },
    });
  });
  it('should get domain object reference from an inferred uuid array reference - uuid reference suffix', () => {
    const reference = getDomainObjectReferenceFromProperty({
      propertyName: 'coverImageUuids',
      propertyDefinition: {
        type: DomainObjectPropertyType.ARRAY,
        of: {
          type: DomainObjectPropertyType.STRING,
        },
      },
      allMetadatas: [
        {
          name: 'Image',
          extends: DomainObjectVariant.DOMAIN_ENTITY,
        },
      ] as DomainObjectMetadata[],
    });
    expect(reference).toEqual({
      method: DomainObjectReferenceMethod.INFERRED_BY_UUID,
      isArray: true,
      of: {
        name: 'Image',
        extends: DomainObjectVariant.DOMAIN_ENTITY,
      },
    });
  });
  it('should return null for a non-reference which _could_ be a reference, had the other domain object been part of the metadatas', () => {
    const reference = getDomainObjectReferenceFromProperty({
      propertyName: 'userUuid',
      propertyDefinition: {
        type: DomainObjectPropertyType.STRING,
      },
      allMetadatas: [] as DomainObjectMetadata[],
    });
    expect(reference).toEqual(null);
  });
  it('should return null for a non-reference which could never have been a reference', () => {
    const reference = getDomainObjectReferenceFromProperty({
      propertyName: 'name',
      propertyDefinition: {
        type: DomainObjectPropertyType.STRING,
      },
      allMetadatas: [] as DomainObjectMetadata[],
    });
    expect(reference).toEqual(null);
  });
});
