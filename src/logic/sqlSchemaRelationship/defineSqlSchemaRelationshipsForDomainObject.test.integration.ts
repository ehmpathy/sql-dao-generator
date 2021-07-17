import { introspect } from 'domain-objects-metadata';
import { defineSqlSchemaRelationshipsForDomainObjects } from './defineSqlSchemaRelationshipsForDomainObjects';

describe('defineSqlSchemaRelationshipsForDomainObjects', () => {
  it('should work on the example project', () => {
    const domainObjects = introspect(`${__dirname}/../__test_assets__/exampleProject/src/domain/objects/index.ts`);
    const relationships = defineSqlSchemaRelationshipsForDomainObjects({ domainObjects });
    expect(relationships.length).toEqual(domainObjects.length);
    expect(relationships).toMatchSnapshot(); // log an example
  });
});
