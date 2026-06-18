import { DomainObject } from 'domain-objects';
import { z } from 'zod';

import { SqlSchemaReferenceMetadata } from './SqlSchemaReferenceMetadata';

const schema = z.object({
  name: z.string(),
  isNullable: z.boolean(),
  isUpdatable: z.boolean(),
  isArray: z.boolean(),
  isDatabaseGenerated: z.boolean(),
  reference: SqlSchemaReferenceMetadata.schema.nullable(),
});

export interface SqlSchemaPropertyMetadata {
  name: string;
  isNullable: boolean;
  isUpdatable: boolean;
  isArray: boolean;
  isDatabaseGenerated: boolean; // when true, property is something that the database generates / defines for us - and is not something user can define
  reference: SqlSchemaReferenceMetadata | null;
}
export class SqlSchemaPropertyMetadata
  extends DomainObject<SqlSchemaPropertyMetadata>
  implements SqlSchemaPropertyMetadata
{
  public static schema = schema;
}
