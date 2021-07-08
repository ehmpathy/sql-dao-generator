import { DomainObject } from 'domain-objects';
import { DomainObjectMetadata } from 'domain-objects-metadata';
import Joi from 'joi';

import { DatabaseLanguage } from '../constants';

export interface GeneratedOutputPath {
  to: string;
  options?: Record<string, any>;
}

const schema = Joi.object().keys({
  rootDir: Joi.string().required(), // dir of config file, to which all config paths are relative
  language: Joi.string().valid(...Object.values(DatabaseLanguage)),
  dialect: Joi.string().required(),
  generates: Joi.object().keys({
    daos: Joi.object().keys({
      to: Joi.string().required(),
      using: Joi.object().keys({
        log: Joi.string().required(),
        DatabaseConnection: Joi.string().required(),
      }),
    }),
    schema: Joi.object().keys({
      config: Joi.string().required(),
    }),
    control: Joi.object().keys({
      config: Joi.string().required(),
    }),
    code: Joi.object().keys({
      config: Joi.string().required(),
    }),
  }),
  for: Joi.object().keys({
    objects: Joi.array().items(DomainObjectMetadata.schema),
  }),
});

export interface GeneratorConfig {
  rootDir: string;
  language: DatabaseLanguage;
  dialect: string;
  for: {
    objects: DomainObjectMetadata[];
  };
  generates: {
    daos: {
      to: string;
      using: {
        log: string;
        DatabaseConnection: string;
      };
    };
    schema: {
      config: string; // path to sql-schema-generator config
    };
    control: {
      config: string; // path to sql-schema-control config
    };
    code: {
      config: string; // path to sql-code-generator config
    };
  };
}
export class GeneratorConfig extends DomainObject<GeneratorConfig> implements GeneratorConfig {
  public static schema = schema;
}
