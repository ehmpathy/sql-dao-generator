import { introspect } from 'domain-objects-metadata';
import { defineSqlSchemaRelationshipsForDomainObjects } from '../sqlSchemaRelationship/defineSqlSchemaRelationshipsForDomainObjects';
import { defineSqlSchemaGeneratorCodeFilesForDomainObjects } from './defineSqlSchemaGeneratorCodeFilesForDomainObjects';

describe('defineSqlSchemaGeneratorCodeFilesForDomainObjects', () => {
  it('should work on the example project', () => {
    const domainObjects = introspect(`${__dirname}/../__test_assets__/exampleProject/src/domain/objects/index.ts`);
    const sqlSchemaRelationships = defineSqlSchemaRelationshipsForDomainObjects({ domainObjects });
    const codes = defineSqlSchemaGeneratorCodeFilesForDomainObjects({ domainObjects, sqlSchemaRelationships });
    expect(codes.length).toEqual(domainObjects.length + 1); // sanity check; +1 because of index file
    expect(codes).toMatchSnapshot(); // and save example
  });
});
