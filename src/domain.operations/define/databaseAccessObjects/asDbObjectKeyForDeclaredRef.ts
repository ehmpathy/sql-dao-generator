import { snakeCase } from 'change-case';

/**
 * .what = casts a declared-ref domain property name into the database-object key it is read from
 * .why  = a `Ref<typeof X>` property persists the referenced `uuid`, so its column is named for
 *         what it holds (`owner_uuid`), not how it was declared (`owner_ref`)
 * .note = the array form pluralizes both halves: `ownerRefs` reads from `owner_uuids`
 */
export const asDbObjectKeyForDeclaredRef = (input: {
  propertyName: string;
  isArray: boolean;
}): string =>
  input.isArray
    ? snakeCase(input.propertyName).replace(/_refs$/, '_uuids')
    : snakeCase(input.propertyName).replace(/_ref$/, '_uuid');
