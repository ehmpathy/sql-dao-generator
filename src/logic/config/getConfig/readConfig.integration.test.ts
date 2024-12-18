import { GeneratorConfig } from '../../../domain';
import { readConfig } from './readConfig';

describe('readConfig', () => {
  it('should be able to read the example config provisioned in __test_assets__', async () => {
    const config = await readConfig({
      configPath: `${__dirname}/../../__test_assets__/exampleProject/codegen.sql.dao.yml`,
    });
    expect(config).toBeInstanceOf(GeneratorConfig);
    expect(config.language).toEqual('postgres');
    expect(config.dialect).toEqual('10.7');
    expect(config.generates).toMatchObject({
      daos: {
        to: 'src/data/dao',
        using: {
          log: 'src/util/log#log',
          DatabaseConnection:
            'src/util/database/getDbConnection#DatabaseConnection',
        },
      },
      schema: {
        config: {
          path: 'codegen.sql.schema.yml',
          content: expect.anything(),
        },
      },
      control: {
        config: {
          path: 'provision/schema/control.yml',
          content: expect.anything(),
        },
      },
      code: {
        config: {
          path: 'codegen.sql.types.yml',
          content: expect.anything(),
        },
      },
    });
    expect(config.for.objects.length).toEqual(12);
    expect(config).toMatchSnapshot({ rootDir: expect.anything() }); // to log an example of the output; ignore the rootDir, to make it machine independent
  });
});
