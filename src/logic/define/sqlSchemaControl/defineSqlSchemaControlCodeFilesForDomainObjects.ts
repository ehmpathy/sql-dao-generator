import { UnexpectedCodePathError } from '@ehmpathy/error-fns';
import { DomainObjectMetadata } from 'domain-objects-metadata';

import { GeneratedCodeFile } from '../../../domain/objects/GeneratedCodeFile';
import { SqlSchemaToDomainObjectRelationship } from '../../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { defineDependentReferenceAvailableProvisionOrder } from './defineDependentReferenceAvailableProvisionOrder';
import { defineSqlSchemaControlCodeForDomainObject } from './defineSqlSchemaControlCodeForDomainObject';

export const defineSqlSchemaControlCodeFilesForDomainObjects = ({
  sqlSchemaRelationships,
}: {
  domainObjects: DomainObjectMetadata[];
  sqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}) => {
  // grab code per domain object
  const dobjToCodeMap: Record<string, string> = Object.fromEntries(
    sqlSchemaRelationships.map((sqlSchemaRelationship) => [
      // dobj name
      sqlSchemaRelationship.name.domainObject,

      // code
      defineSqlSchemaControlCodeForDomainObject({
        sqlSchemaRelationship,
      }),
    ]),
  );

  // determine the order in which we should declare them
  const { order } = defineDependentReferenceAvailableProvisionOrder({
    sqlSchemaRelationships,
  });

  // declare them in that order
  const sortedCodePerDomainObject: string[] = order.map(
    (dobjName) =>
      dobjToCodeMap[dobjName] ??
      (() => {
        throw new UnexpectedCodePathError(
          'could not find code for dobj. how is that possible?',
          { dobjName },
        );
      })(),
  );

  // define the content of the config file
  const content = sortedCodePerDomainObject.join('\n\n');

  // define the domain config file
  return new GeneratedCodeFile({
    relpath: './domain.control.yml',
    content,
  });
};
