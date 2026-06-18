import { DomainObject } from 'domain-objects';
import type { DomainObjectReferenceMetadata } from 'domain-objects-metadata';
import { z } from 'zod';

export enum SqlSchemaReferenceMethod {
  /**
   * .what = when a domain literal is directly nested in another domain object
   */
  DIRECT_BY_NESTING = 'DIRECT_BY_NESTING',

  /**
   * .what = when a domain object is explicitly referenced, via Ref<>, in another domain object
   */
  DIRECT_BY_DECLARATION = 'DIRECT_BY_DECLARATION',

  /**
   * .what = when a domain object is implicitly referenced, via uuid, in another domain object
   */
  IMPLICIT_BY_UUID = 'IMPLICIT_BY_UUID',
}

const schema = z.object({
  method: z.enum([
    SqlSchemaReferenceMethod.DIRECT_BY_NESTING,
    SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION,
    SqlSchemaReferenceMethod.IMPLICIT_BY_UUID,
  ]),
  of: z.any() as z.ZodType<DomainObjectReferenceMetadata>,
});

export interface SqlSchemaReferenceMetadata {
  method: SqlSchemaReferenceMethod;
  of: DomainObjectReferenceMetadata;
}
export class SqlSchemaReferenceMetadata
  extends DomainObject<SqlSchemaReferenceMetadata>
  implements SqlSchemaReferenceMetadata
{
  public static schema = schema;
}
