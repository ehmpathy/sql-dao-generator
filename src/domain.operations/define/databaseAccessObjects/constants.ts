/**
 * .what = the dot-prefixed directory every generated-for-the-consumer artifact lands in
 * .why  = `sql-code-generator` already writes `types.ts` and `queryFunctions.ts` here
 * .why  = a rename must reach three kinds of site: the definer that writes this dir, the definers
 *         that write an import of it into each dao, and the cli banner
 * .note = the dot carries weight: a consumer's `codegen.sql.types.yml` scans `src/access/daos/**`
 *         for sql, fails on a plain `.ts` with none, and skips a dot-prefixed dir
 * .note = safe to share: `sql-code-generator` never cleans the dir, and it runs after we write
 */
export const DAO_GENERATED_DIR = '.generated';

/**
 * .what = the module every shared cast artifact is generated into
 * .why  = named for what the file is FOR, like `types.ts`; the pg type-parser supply lives here too
 */
export const DAO_CASTS_MODULE_NAME = 'casts';

/**
 * .what = the specifier a generated dao uses to import any shared cast artifact
 * .why  = every dao sits one level below the daos root; derived, so the two cannot drift
 */
export const DAO_CASTS_IMPORT_PATH = `../${DAO_GENERATED_DIR}/${DAO_CASTS_MODULE_NAME}`;

/**
 * .what = the one symbol a generated dao imports to reach any cast — `asFromDatabase.date(...)`
 * .why  = the casts are one family; a new cast adds a member rather than an import
 * .note = it hoists the `From$Noun2` half of `as$Noun1From$Noun2`: "as a date, from the database"
 */
export const DAO_CASTS_NAMESPACE = 'asFromDatabase';

/**
 * .what = the name each generated cast is called by — the namespace, and its member
 * .why  = the namespace template and `getOneCastNameForProperty`'s map both hold it, and no
 *         type-checker relates a template string to a lookup table
 */
export const DAO_CAST_NAME_DATE = `${DAO_CASTS_NAMESPACE}.date`;
export const DAO_CAST_NAME_NUMBER = `${DAO_CASTS_NAMESPACE}.number`;

/**
 * .what = the name each cast's implementation is declared under, inside the generated module
 * .why  = a stack trace names the implementation: `asDateFromDbValue` locates a throw; `date` does not
 */
export const DAO_CAST_IMPL_DATE = 'asDateFromDbValue';
export const DAO_CAST_IMPL_NUMBER = 'asNumberFromDbValue';

/**
 * .what = the names of the shared artifacts that are not casts — the error each cast throws, and
 *         the type helper each json shape is built from
 * .why  = the error is declared in one section template and thrown from two others, with no
 *         type-checker between them until a consumer regenerates
 */
export const DAO_UTIL_ERROR_NAME = 'DbValueCastError';
export const DAO_UTIL_JSON_TYPE_NAME = 'AsJsonFromDbObject';
