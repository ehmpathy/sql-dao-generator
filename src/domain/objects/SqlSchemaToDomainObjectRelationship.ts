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
        domainObject: DomainObjectPropertyMetadata.schema,
        sqlSchema: SqlSchemaPropertyMetadata.schema,
      }),
    )
    .required(),
  decorations: Joi.object().keys({
    unique: Joi.object().keys({
      domainObject: Joi.array()
        .items(Joi.string())
        .required()
        .allow(null),
      sqlSchema: Joi.array()
        .items(Joi.string())
        .required()
        .allow(null),
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
    domainObject: DomainObjectPropertyMetadata;
  }[];
  decorations: {
    unique: {
      sqlSchema: string[] | null;
      domainObject: string[] | null;
    };
  };
}

export class SqlSchemaToDomainObjectRelationship extends DomainObject<SqlSchemaToDomainObjectRelationship>
  implements SqlSchemaToDomainObjectRelationship {
  public static schema = schema;
}
