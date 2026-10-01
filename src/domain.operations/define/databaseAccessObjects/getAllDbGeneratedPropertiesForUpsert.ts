import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';

import { getOneCastNameForProperty } from './getOneCastNameForProperty';

/**
 * .what = gets the database-generated properties an upsert reads back, with the cast each needs
 * .why  = upsert reads these off its own select, with no `castFromDatabaseObject` between, so a
 *         `bigserial` id arrives as a string absent an int8 parser. each needs the find path's cast
 * .note = a property the domain object does not declare is omitted; it has nowhere to land
 * .note = both names are carried: the select reads `created_at`, the domain takes `createdAt`
 * .note = the domain name is read off the declaration, never re-derived from the column, so an
 *         aliased property cannot silently land `undefined`
 */
export const getAllDbGeneratedPropertiesForUpsert = (input: {
  sqlSchemaRelationship: SqlSchemaToDomainObjectRelationship;
}): {
  sqlSchemaName: string;
  domainObjectName: string;
  castName: string | null;
}[] =>
  input.sqlSchemaRelationship.properties.flatMap(
    ({ sqlSchema: sqlSchemaProperty, domainObject: domainObjectProperty }) => {
      // only the database-generated properties are read back off the upsert's own select
      if (!sqlSchemaProperty.isDatabaseGenerated) return [];

      // a property the domain object does not declare has nowhere to land, so it is omitted
      if (!domainObjectProperty) return [];

      return [
        {
          sqlSchemaName: sqlSchemaProperty.name,
          domainObjectName: domainObjectProperty.name,
          castName: getOneCastNameForProperty({
            sqlSchemaProperty,
            domainObjectProperty,
          }),
        },
      ];
    },
  );
