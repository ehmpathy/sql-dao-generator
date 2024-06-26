import {
  DomainObjectMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipForDomainObject } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipForDomainObject';
import { defineDaoCodeFilesForDomainObject } from './defineDaoCodeFilesForDomainObject';

describe('defineDaoCodeFilesForDomainObject', () => {
  it('should have the findByUuid file if property has uuid', () => {
    const domainObject = new DomainObjectMetadata({
      name: 'Geocode',
      extends: DomainObjectVariant.DOMAIN_LITERAL,
      properties: {
        id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
        uuid: { name: 'uuid', type: DomainObjectPropertyType.STRING },
        latitude: { name: 'latitude', type: DomainObjectPropertyType.NUMBER },
        longitude: { name: 'longitude', type: DomainObjectPropertyType.NUMBER },
      },
      decorations: {
        alias: null,
        primary: null,
        unique: null,
        updatable: null,
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });
    const files = defineDaoCodeFilesForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: [sqlSchemaRelationship],
    });
    expect(
      files.filter((file) => file.relpath.includes('findByUuid')).length,
    ).toEqual(1);
    expect(files).toMatchSnapshot();
  });
  it('should not have the findByUuid file if property has uuid', () => {
    const domainObject = new DomainObjectMetadata({
      name: 'Geocode',
      extends: DomainObjectVariant.DOMAIN_LITERAL,
      properties: {
        id: { name: 'id', type: DomainObjectPropertyType.NUMBER },
        latitude: { name: 'latitude', type: DomainObjectPropertyType.NUMBER },
        longitude: { name: 'longitude', type: DomainObjectPropertyType.NUMBER },
      },
      decorations: {
        alias: null,
        primary: null,
        unique: null,
        updatable: null,
      },
    });
    const sqlSchemaRelationship = defineSqlSchemaRelationshipForDomainObject({
      domainObject,
      allDomainObjects: [domainObject],
    });
    const files = defineDaoCodeFilesForDomainObject({
      domainObject,
      sqlSchemaRelationship,
      allSqlSchemaRelationships: [sqlSchemaRelationship],
    });
    expect(
      files.filter((file) => file.relpath.includes('findByUuid')).length,
    ).toEqual(0);
    expect(files).toMatchSnapshot();
  });
});
