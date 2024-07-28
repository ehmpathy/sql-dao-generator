import { DomainObjectMetadata } from 'domain-objects-metadata';

import { defineOutputTypeOfFoundDomainObject } from './defineOutputTypeOfFoundDomainObject';

export const defineDaoFindByRefMethodCodeForDomainObject = ({
  domainObject,
}: {
  domainObject: DomainObjectMetadata;
}) => {
  // define the imports
  const imports = [
    ...new Set([
      // always present imports
      `import { UnexpectedCodePathError } from '@ehmpathy/error-fns';`,
      `import { Ref, isPrimaryKeyRef, isUniqueKeyRef } from 'domain-objects';`,
      `import { HasMetadata } from 'type-fns';`,

      '', // split module from relative imports
      `import { ${domainObject.name} } from '$PATH_TO_DOMAIN_OBJECT';`,
      "import { DatabaseConnection } from '$PATH_TO_DATABASE_CONNECTION';",
      `import { findByUnique } from './findByUnique';`,
      `import { findByUuid } from './findByUuid';`,
    ]),
  ];

  // define the output type
  const outputType = defineOutputTypeOfFoundDomainObject(domainObject);

  // define the content
  const code = `
${imports.join('\n')}

export const findByRef = async (
  input: { ref: Ref<typeof ${domainObject.name}> },
  context: { dbConnection: DatabaseConnection },
): Promise<${outputType} | null> => {
  if (isPrimaryKeyRef({ of: ${domainObject.name} })(input.ref))
    return await findByUuid(input.ref, context);
  if (isUniqueKeyRef({ of: ${domainObject.name} })(input.ref))
    return await findByUnique(input.ref, context);
  throw new UnexpectedCodePathError('invalid ref for ${
    domainObject.name
  }', { input });
};

`.trim();

  // return the code
  return code;
};
