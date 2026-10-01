import { camelCase } from 'change-case';
import type { DomainObjectMetadata } from 'domain-objects-metadata';
import { isPresent } from 'type-fns';

import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';

import { DAO_CASTS_IMPORT_PATH, DAO_CASTS_NAMESPACE } from './constants';
import { defineDbObjectShapesForCastMethod } from './defineDbObjectShapesForCastMethod';
import { defineOutputTypeOfFoundDomainObject } from './defineOutputTypeOfFoundDomainObject';
import { getAllNestedDomainObjectNames } from './getAllNestedDomainObjectNames';
import { getOneCastExpressionForProperty } from './getOneCastExpressionForProperty';
import { getOneCastNameForProperty } from './getOneCastNameForProperty';

export const defineDaoUtilCastMethodCodeForDomainObject = ({
  domainObject,
  sqlSchemaRelationship,
}: {
  domainObject: DomainObjectMetadata;
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
}) => {
  // define the two shapes this domain object arrives in — `Output = Strict | Jsoned` — plus the
  // cast input that accepts either
  const dbObjectShapes = defineDbObjectShapesForCastMethod({ domainObject });

  // define the domain objects this one NESTS, whose cast and json shape it therefore reads
  const nestedDomainObjectNames = getAllNestedDomainObjectNames({
    sqlSchemaRelationship,
  });

  // define whether this dao calls any shared cast, so we import the namespace only then
  const hasSomeCast = sqlSchemaRelationship.properties.some(
    ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
      getOneCastNameForProperty({ sqlSchemaProperty, domainObjectProperty }),
  );

  // define the imports
  const imports = [
    ...new Set([
      // always present imports
      "import { HasMetadata } from 'type-fns';",
      '', // split module from relative imports
      `import { ${domainObject.name} } from '$PATH_TO_DOMAIN_OBJECT';`, // import this domain object; note: higher level function will swap out the import path
      // note: the shapes definer owns the upstream sql-types import (aliased `...Strict`); a nested
      //   dobj's shape comes from its own dao's `...ByIdOutputJsoned` export
      ...dbObjectShapes.imports,
      // note: ONE symbol, however many casts — they are members of one namespace, so the import
      //   line is the same whether this dao calls one cast or both
      ...(hasSomeCast
        ? [`import { ${DAO_CASTS_NAMESPACE} } from '${DAO_CASTS_IMPORT_PATH}';`]
        : []),
      ...nestedDomainObjectNames
        .map(
          (domainObjectName) =>
            `import { castFromDatabaseObject as cast${domainObjectName}FromDatabaseObject, SqlQueryFind${domainObjectName}ByIdOutputJsoned } from '../${camelCase(
              domainObjectName,
            )}Dao/castFromDatabaseObject';`,
        )
        .sort(),
    ]),
  ];

  // define the output type
  const outputType = defineOutputTypeOfFoundDomainObject(domainObject);

  // define the properties: one assignment per property, per its reference method, cardinality, and nullability
  const propertiesToInstantiate = sqlSchemaRelationship.properties
    .map(
      ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) =>
        getOneCastExpressionForProperty({
          sqlSchemaProperty,
          domainObjectProperty,
          domainObject,
        }),
    )
    .filter(isPresent);

  // define the content
  const code = `
${imports.join('\n')}
${dbObjectShapes.declarations}
export const castFromDatabaseObject = (${dbObjectShapes.inputType}
): ${outputType} =>
  new ${domainObject.name}({
    ${propertiesToInstantiate.join(',\n    ')},
  }) as ${outputType};
`.trim();

  // return the code
  return code;
};
