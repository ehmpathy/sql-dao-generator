import { DomainObject } from 'domain-objects';
import { DomainObjectPropertyMetadata } from 'domain-objects-metadata';
import Joi from 'joi';

import { SqlSchemaPropertyMetadata } from './SqlSchemaPropertyMetadata';

const schema = Joi.object().keys({
  name: Joi.object().keys({
    domainObject: Joi.string().required(),
    sqlSchema: Joi.string().required(),
  }),
  properties: Joi.array()
    .items(
      Joi.object().keys({
        domainObject: DomainObjectPropertyMetadata.schema.allow(null),
        sqlSchema: SqlSchemaPropertyMetadata.schema,
      }),
    )
    .required(),
  decorations: Joi.object().keys({
    alias: Joi.object().keys({
      domainObject: Joi.string().required().allow(null),
    }),
    unique: Joi.object().keys({
      domainObject: Joi.array().items(Joi.string()).required().allow(null),
      sqlSchema: Joi.array().items(Joi.string()).required().allow(null),
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
