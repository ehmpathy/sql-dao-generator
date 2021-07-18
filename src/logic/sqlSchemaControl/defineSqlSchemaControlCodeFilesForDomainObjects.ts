import { snakeCase } from 'change-case';
import { DomainObjectMetadata } from 'domain-objects-metadata';
import { isPresent } from 'simple-type-guards';
import { GeneratedCodeFile } from '../../domain/objects/GeneratedCodeFile';
import { SqlSchemaToDomainObjectRelationship } from '../../domain/objects/SqlSchemaToDomainObjectRelationship';
import { defineSqlSchemaControlCodeForDomainObject } from './defineSqlSchemaControlCodeForDomainObject';

export const defineSqlSchemaControlCodeFilesForDomainObjects = ({
  sqlSchemaRelationships,
}: {
  domainObjects: DomainObjectMetadata[];
  sqlSchemaRelationships: SqlSchemaToDomainObjectRelationship[];
}) => {
  // grab code per domain object
  const codePerDomainObject = sqlSchemaRelationships.map((sqlSchemaRelationship) => ({
    sqlSchemaRelationship,
    code: defineSqlSchemaControlCodeForDomainObject({ sqlSchemaRelationship }),
  }));

  // sort them by references; go through them alphabetically over and over until each has its references defined
  const sortedCodePerDomainObject: string[] = [];
  let timesLooped = 0; // for infi loop prevention
  while (sortedCodePerDomainObject.length < codePerDomainObject.length) {
    for (const { code: thisCode, sqlSchemaRelationship: thisRelationship } of codePerDomainObject) {
      if (sortedCodePerDomainObject.includes(thisCode)) continue; // if its already in there, no need to re-evaluate
      const domainObjectsThisSchemaReferences = thisRelationship.properties
        .map((propertyRelationship) => propertyRelationship.sqlSchema.reference?.of.name)
        .filter(isPresent);
      const someReferencedDomainObjectIsNotAlreadyIncluded = domainObjectsThisSchemaReferences.some(
        (domainObjectName) =>
          !sortedCodePerDomainObject.some((code) => code.includes(`# ${snakeCase(domainObjectName)}`)), // probably not the best way of checking, but if this breaks tests will catch it and we can fix it then
      );
      if (someReferencedDomainObjectIsNotAlreadyIncluded) continue; // cant include it yet
      sortedCodePerDomainObject.push(thisCode);
    }
    timesLooped += 1;
    if (timesLooped > codePerDomainObject.length * 20)
      throw new Error('infinite loop prevention error. this indicates that there is a bug in sql-dao-generator'); // fail fast
  }

  // define the content of the config file
  const content = sortedCodePerDomainObject.join('\n\n');

  // define the domain config file
  return new GeneratedCodeFile({
    relpath: './domain.control.yml',
    content,
  });
};
