import { DomainObject } from 'domain-objects';
import type { DomainObjectMetadata } from 'domain-objects-metadata';
import { z } from 'zod';

import { DatabaseLanguage } from './constants';

export interface GeneratedOutputPath {
  to: string;
  options?: Record<string, any>;
}

const schema = z.object({
  rootDir: z.string(), // dir of config file, to which all config paths are relative
  language: z.enum([DatabaseLanguage.MYSQL, DatabaseLanguage.POSTGRES]),
  dialect: z.string(),
  generates: z.object({
    daos: z.object({
      to: z.string(),
      using: z.object({
        log: z.string(),
        DatabaseConnection: z.string(),
      }),
    }),
    schema: z.object({
      config: z.object({
        path: z.string(),
        content: z.any(),
      }),
    }),
    control: z.object({
      config: z.object({
        path: z.string(),
        content: z.any(),
      }),
    }),
    code: z.object({
      config: z.object({
        path: z.string(),
        content: z.any(),
      }),
    }),
  }),
  for: z.object({
    objects: z.array(z.any() as z.ZodType<DomainObjectMetadata>),
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
