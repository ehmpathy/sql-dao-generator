import { getRelevantContentsOfSqlCodeGeneratorConfig } from './getRelevantContentsOfSqlCodeGeneratorConfig';

describe('getRelevantContentsOfSqlCodeGeneratorConfig', () => {
  it('should be able to get the contents', async () => {
    const contents = await getRelevantContentsOfSqlCodeGeneratorConfig({
      pathToConfig: `${__dirname}/../../../__test_assets__/exampleProject/codegen.sql.types.yml`,
    });
    expect(contents.resources).toContain('provision/schema/sql/tables/**/*.sql');
    expect(contents.queries).toContain('src/data/dao/**/*.ts');
    expect(contents.generates.types).toEqual('src/data/dao/.generated/types.ts');
    expect(contents.generates.queryFunctions).toEqual('src/data/dao/.generated/queryFunctions.ts');
  });
});
