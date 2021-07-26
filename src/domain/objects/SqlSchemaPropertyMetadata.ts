import { DomainObject } from 'domain-objects';
import Joi from 'joi';

import { SqlSchemaReferenceMetadata } from './SqlSchemaReferenceMetadata';

const schema = Joi.object().keys({
  name: Joi.string().required(),
  isNullable: Joi.boolean().required(),
  isUpdatable: Joi.boolean().required(),
  isArray: Joi.boolean().required(),
  isDatabaseGenerated: Joi.boolean().required(),
  reference: SqlSchemaReferenceMetadata.schema.required().allow(null),
});

export interface SqlSchemaPropertyMetadata {
  name: string;
  isNullable: boolean;
  isUpdatable: boolean;
  isArray: boolean;
  isDatabaseGenerated: boolean; // when true, property is something that the database generates / defines for us - and is not something user can define
  reference: SqlSchemaReferenceMetadata | null;
}
export class SqlSchemaPropertyMetadata extends DomainObject<SqlSchemaPropertyMetadata>
  implements SqlSchemaPropertyMetadata {
  public static schema = schema;
}
