import { pascalCase, snakeCase } from 'change-case';
import {
  DomainObjectMetadata,
  DomainObjectMetadataReference,
  DomainObjectProperty,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

export enum DomainObjectReferenceMethod {
  DIRECTLY_NESTED = 'DIRECTLY_NESTED',
  INFERRED_BY_UUID = 'INFERRED_BY_UUID',
}
export interface DomainObjectReference {
  method: DomainObjectReferenceMethod;
  isArray: boolean;
  of: DomainObjectMetadataReference;
}
export const getDomainObjectReferenceFromProperty = ({
  propertyName,
  propertyDefinition,
  allMetadatas,
}: {
  propertyName: string;
  propertyDefinition: DomainObjectProperty;
  allMetadatas: DomainObjectMetadata[];
}): DomainObjectReference | null => {
  // handle direct nested references
  if (propertyDefinition.type === DomainObjectPropertyType.REFERENCE)
    return {
      method: DomainObjectReferenceMethod.DIRECTLY_NESTED,
      isArray: false,
      of: propertyDefinition.of as DomainObjectMetadataReference,
    };

  // handle direct nested array references
  if (
    propertyDefinition.type === DomainObjectPropertyType.ARRAY &&
    (propertyDefinition.of as DomainObjectProperty)?.type === DomainObjectPropertyType.REFERENCE
  )
    return {
      method: DomainObjectReferenceMethod.DIRECTLY_NESTED,
      isArray: true,
      of: (propertyDefinition.of as DomainObjectProperty).of as DomainObjectMetadataReference,
    };

  // handle inferred uuid references
  const { isUuidReference, referenceOfUuidReference } = (() => {
    const isCandidate =
      propertyDefinition.type === DomainObjectPropertyType.STRING && new RegExp(/Uuid$/).test(propertyName);
    if (!isCandidate) return { isUuidReference: false, referenceOfUuidReference: null }; // if not a candidate, bail here, dont search
    const foundReference =
      allMetadatas.find((metadata) => {
        const nameMatchesReferencePattern =
          `${snakeCase(metadata.name)}Uuid` === propertyName || // it either is exactly the camel case key we're looking for
          new RegExp(`${pascalCase(metadata.name)}Uuid$`).test(propertyName); // or it is the suffix of the camel case key we're looking for
        if (!nameMatchesReferencePattern) return false; // if the property name does not look like it references this domain object, then do nothing
        return metadata.extends === DomainObjectVariant.DOMAIN_ENTITY; // if property name looks like it references this domain object && this domain object is a domain entity, then its safe to assume its a domain-entity reference
      }) ?? null;
    return { isUuidReference: !!foundReference, referenceOfUuidReference: foundReference };
  })();
  if (isUuidReference)
    return {
      method: DomainObjectReferenceMethod.INFERRED_BY_UUID,
      isArray: false,
      of: referenceOfUuidReference!,
    };

  // handled inferred uuid array references
  const { isUuidReferenceArray, referenceOfUuidReferenceArray } = (() => {
    const isCandidate =
      propertyDefinition.type === DomainObjectPropertyType.ARRAY &&
      (propertyDefinition.of as DomainObjectProperty).type === DomainObjectPropertyType.STRING &&
      new RegExp(/Uuids$/).test(propertyName);
    if (!isCandidate) return { isUuidReferenceArray: false, referenceOfUuidReferenceArray: null }; // if not a candidate, bail here, dont search
    const foundReference =
      allMetadatas.find((metadata) => {
        const nameMatchesReferencePattern =
          `${snakeCase(metadata.name)}Uuids` === propertyName || // it either is exactly the camel case key we're looking for
          new RegExp(`${pascalCase(metadata.name)}Uuids$`).test(propertyName); // or it is the suffix of they camel case key we're looking for
        if (!nameMatchesReferencePattern) return false; // if the property name does not look like it references this domain object, then do nothing
        return metadata.extends === DomainObjectVariant.DOMAIN_ENTITY; // if property name looks like it references this domain object && this domain object is a domain entity, then its safe to assume its a domain-entity reference
      }) ?? null;
    return { isUuidReferenceArray: !!foundReference, referenceOfUuidReferenceArray: foundReference };
  })();
  if (isUuidReferenceArray)
    return {
      method: DomainObjectReferenceMethod.INFERRED_BY_UUID,
      isArray: true,
      of: referenceOfUuidReferenceArray!,
    };

  // otherwise, no reference
  return null;
};
