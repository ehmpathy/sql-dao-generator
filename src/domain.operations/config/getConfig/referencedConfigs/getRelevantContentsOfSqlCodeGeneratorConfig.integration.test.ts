import { getRelevantContentsOfSqlCodeGeneratorConfig } from './getRelevantContentsOfSqlCodeGeneratorConfig';

describe('getRelevantContentsOfSqlCodeGeneratorConfig', () => {
  it('should be able to get the contents', async () => {
    const contents = await getRelevantContentsOfSqlCodeGeneratorConfig({
      pathToConfig: `${__dirname}/../../../.test.assets/exampleProject/codegen.sql.types.yml`,
    });
    expect(contents.resources).toContain(
      'provision/schema/sql/tables/**/*.sql',
    );
    expect(contents.queries).toContain('src/access/daos/**/*.ts');
    expect(contents.generates.types).toEqual(
      'src/access/daos/.generated/types.ts',
    );
    expect(contents.generates.queryFunctions).toEqual(
      'src/access/daos/.generated/queryFunctions.ts',
    );
  });
});
