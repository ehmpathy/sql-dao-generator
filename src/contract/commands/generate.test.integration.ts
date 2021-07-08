import SqlCodeGenerator from './generate';

describe('generate', () => {
  it('should be able to generate code for valid config in example project, generating schema, control, code, and ultimately the full dao - with runnable tests', async () => {
    await SqlCodeGenerator.run(['-c', `${__dirname}/../__test_assets__/exampleProject/codegen.dao.yml`]);
  });
});
