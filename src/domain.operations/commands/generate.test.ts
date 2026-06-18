import { generate } from './generate';

jest.setTimeout(60 * 1000);

describe('generate', () => {
  const testAssetPaths = {
    codegenYml: `${__dirname}/../.test.assets/exampleProject/codegen.sql.dao.yml`,
  };
  describe('generate the daos', () => {
    it('should be able to generate for the example config provisioned in .test.assets/exampleProject', async () => {
      await generate({
        configPath: testAssetPaths.codegenYml,
      });
    });
  });
});
