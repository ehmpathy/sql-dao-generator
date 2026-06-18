import { DomainObject } from 'domain-objects';
import type { DomainObjectPropertyMetadata } from 'domain-objects-metadata';
import { z } from 'zod';

import { SqlSchemaPropertyMetadata } from './SqlSchemaPropertyMetadata';

const schema = z.object({
  name: z.object({
    domainObject: z.string(),
    sqlSchema: z.string(),
  }),
  properties: z.array(
    z.object({
      domainObject: (
        z.any() as z.ZodType<DomainObjectPropertyMetadata>
      ).nullable(),
      sqlSchema: SqlSchemaPropertyMetadata.schema,
    }),
  ),
  decorations: z.object({
    alias: z.object({
      domainObject: z.string().nullable(),
    }),
    unique: z.object({
      domainObject: z.array(z.string()).nullable(),
      sqlSchema: z.array(z.string()).nullable(),
    }),
  }),
});

export interface SqlSchemaToDomainObjectRelationship {
  name: {
    sqlSchema: string; // e.g., 'train_engineer';
    domainObject: string; // e.g., 'TrainEngineer';
  };
  properties: {
    sqlSchema: SqlSchemaPropertyMetadata;
    domainObject: DomainObjectPropertyMetadata | null; // may be null, if the sql-schema-property is a db-generated property that was not defined by the user in the domain-object
  }[];
  decorations: {
    alias: {
      domainObject: string | null;
    };
    unique: {
      sqlSchema: string[] | null;
      domainObject: string[] | null;
    };
  };
}

export class SqlSchemaToDomainObjectRelationship
  extends DomainObject<SqlSchemaToDomainObjectRelationship>
  implements SqlSchemaToDomainObjectRelationship
{
  public static schema = schema;
}
