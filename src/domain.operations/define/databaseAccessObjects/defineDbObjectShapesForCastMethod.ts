import {
  type DomainObjectMetadata,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { DAO_CASTS_IMPORT_PATH, DAO_UTIL_JSON_TYPE_NAME } from './constants';

/**
 * .what = the shapes a domain object arrives in, declared by name, and the one the cast takes
 * .why  = one cast is reached from two selections:
 *           STRICT — selected directly, so a `timestamptz` is the `Date` node-postgres parsed
 *           JSONED — selected inside `json_build_object`, so it is an iso-8601 string
 *         ⇒ `Output = Strict | Jsoned`, declared once
 * .note = `...Strict` is a re-export of the upstream row, renamed until `sql-code-generator#95`
 * .note = upstream states a nested column as `Record<string, any> | null`; the cast narrows it,
 *         so `findBy*` sites hand their row over with no assertion
 * .note = only a literal owes a jsoned shape: `rule.require.jsoned-shape-only-for-literals.md`
 * .note = consumers import these names, so `#95` supersedes them as aliases rather than deletes
 */
export const defineDbObjectShapesForCastMethod = (input: {
  domainObject: DomainObjectMetadata;
}): {
  imports: string[];
  declarations: string;
  inputType: string;
} => {
  const name = input.domainObject.name;

  // import the upstream row as the strict shape; the alias frees `...ByIdOutput` for the union
  const importsOfUpstreamType = [
    `import { SqlQueryFind${name}ByIdOutput as SqlQueryFind${name}ByIdOutputStrict } from '$PATH_TO_GENERATED_SQL_TYPES';`,
  ];

  const declarationOfStrict = `
export type { SqlQueryFind${name}ByIdOutputStrict };
`;

  // an entity is never nested, so it has no json form and its cast takes the strict shape alone
  if (input.domainObject.extends !== DomainObjectVariant.DOMAIN_LITERAL)
    return {
      imports: importsOfUpstreamType,
      declarations: declarationOfStrict,
      inputType: `
  dbObject: SqlQueryFind${name}ByIdOutputStrict,`,
    };

  // a literal nests, so it also arrives jsoned, over the same keys the strict row carries
  return {
    imports: [
      ...importsOfUpstreamType,
      `import type { ${DAO_UTIL_JSON_TYPE_NAME} } from '${DAO_CASTS_IMPORT_PATH}';`,
    ],
    declarations: `${declarationOfStrict}
export type SqlQueryFind${name}ByIdOutputJsoned =
  ${DAO_UTIL_JSON_TYPE_NAME}<SqlQueryFind${name}ByIdOutputStrict>;

export type SqlQueryFind${name}ByIdOutput =
  | SqlQueryFind${name}ByIdOutputStrict
  | SqlQueryFind${name}ByIdOutputJsoned;
`,
    inputType: `
  dbObject: SqlQueryFind${name}ByIdOutput,`,
  };
};
