import { DomainObject } from 'domain-objects';
import { DomainObjectReferenceMetadata } from 'domain-objects-metadata';
import Joi from 'joi';

export enum SqlSchemaReferenceMethod {
  DIRECT_BY_NESTING = 'DIRECT_BY_NESTING',
  IMPLICIT_BY_UUID = 'IMPLICIT_BY_UUID',
}

const schema = Joi.object().keys({
  method: Joi.string()
    .valid(...Object.values(SqlSchemaReferenceMethod))
    .required(),
  of: DomainObjectReferenceMetadata.schema.required(),
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
