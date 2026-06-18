import { introspect } from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipsForDomainObjects } from '@src/domain.operations/define/sqlSchemaRelationship/defineSqlSchemaRelationshipsForDomainObjects';

import { defineDaoCodeFilesForDomainObjects } from './defineDaoCodeFilesForDomainObjects';

describe('defineSqlSchemaControlCodeFilesForDomainObjects', () => {
  it('should work on the example project', () => {
    const domainObjects = introspect(
      `${__dirname}/../../.test.assets/exampleProject/src/domain.objects/index.ts`,
    );
    const sqlSchemaRelationships = defineSqlSchemaRelationshipsForDomainObjects(
      { domainObjects },
    );
    const files = defineDaoCodeFilesForDomainObjects({
      domainObjects,
      sqlSchemaRelationships,
    });
    expect(files).toMatchSnapshot(); // and save example
  });
});
