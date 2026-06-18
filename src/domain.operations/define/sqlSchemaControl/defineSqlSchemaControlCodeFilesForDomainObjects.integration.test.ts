import { introspect } from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipsForDomainObjects } from '@src/domain.operations/define/sqlSchemaRelationship/defineSqlSchemaRelationshipsForDomainObjects';

import { defineSqlSchemaControlCodeFilesForDomainObjects } from './defineSqlSchemaControlCodeFilesForDomainObjects';

describe('defineSqlSchemaControlCodeFilesForDomainObjects', () => {
  it('should work on the example project', () => {
    const domainObjects = introspect(
      `${__dirname}/../../.test.assets/exampleProject/src/domain.objects/index.ts`,
    );
    const sqlSchemaRelationships = defineSqlSchemaRelationshipsForDomainObjects(
      { domainObjects },
    );

    const file = defineSqlSchemaControlCodeFilesForDomainObjects({
      domainObjects,
      sqlSchemaRelationships,
    });
    expect(file).toMatchSnapshot(); // and save example
  });
});
