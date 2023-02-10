import { getRelevantContentsOfSqlSchemaGeneratorConfig } from './getRelevantContentsOfSqlSchemaGeneratorConfig';

describe('getRelevantContentsOfSqlSchemaGeneratorConfig', () => {
  it('should be able to get the contents', async () => {
    const contents = await getRelevantContentsOfSqlSchemaGeneratorConfig({
      pathToConfig: `${__dirname}/../../../__test_assets__/exampleProject/codegen.sql.schema.yml`,
    });
    expect(contents.declarations).toEqual(
      'provision/schema/declarations/index.ts',
    );
    expect(contents.generates.sql.to).toEqual('provision/schema/sql');
  });
});
