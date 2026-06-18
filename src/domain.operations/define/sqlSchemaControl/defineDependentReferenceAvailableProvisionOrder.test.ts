import { introspect } from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipsForDomainObjects } from '@src/domain.operations/define/sqlSchemaRelationship/defineSqlSchemaRelationshipsForDomainObjects';

import { defineDependentReferenceAvailableProvisionOrder } from './defineDependentReferenceAvailableProvisionOrder';

describe('defineDependentReferenceAvailableProvisionOrder', () => {
  it('should work on the example project', () => {
    const domainObjects = introspect(
      `${__dirname}/../../__test_assets__/exampleProject/src/domain.objects/index.ts`,
    );
    const sqlSchemaRelationships = defineSqlSchemaRelationshipsForDomainObjects(
      { domainObjects },
    );

    const { order, reason, depth } =
      defineDependentReferenceAvailableProvisionOrder({
        sqlSchemaRelationships,
      });
    // console.log({ order, reason, depth });

    expect({ order, reason, depth }).toMatchSnapshot();
  });
});
