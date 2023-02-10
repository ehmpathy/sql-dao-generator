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
      config: Joi.object().keys({
        path: Joi.string().required(),
        content: Joi.any().required(),
      }),
    }),
    control: Joi.object().keys({
      config: Joi.object().keys({
        path: Joi.string().required(),
        content: Joi.any().required(),
      }),
    }),
    code: Joi.object().keys({
      config: Joi.object().keys({
        path: Joi.string().required(),
        content: Joi.any().required(),
      }),
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
      config: {
        path: string; // path to sql-schema-generator config
        content: {
          declarations: string;
          generates: {
            sql: {
              to: string;
            };
          };
        };
      };
    };
    control: {
      config: {
        path: string; // path to sql-schema-control config
        content: {
          definitions: string[];
        };
      };
    };
    code: {
      config: {
        path: string; // path to sql-code-generator config
        content: {
          resources: string[];
          queries: string[];
          generates: {
            types: string;
            queryFunctions: string;
          };
        };
      };
    };
  };
}
export class GeneratorConfig
  extends DomainObject<GeneratorConfig>
  implements GeneratorConfig
{
  public static schema = schema;
}
