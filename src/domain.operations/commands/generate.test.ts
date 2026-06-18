import { generate } from './generate';

jest.setTimeout(60 * 1000);

describe('generate', () => {
  const testAssetPaths = {
    codegenYml: `${__dirname}/../__test_assets__/exampleProject/codegen.sql.dao.yml`,
  };
  describe('generate the daos', () => {
    it('should be able to generate for the example config provisioned in __test_assets__/exampleProject', async () => {
      await generate({
        configPath: testAssetPaths.codegenYml,
      });
    });
  });
});
