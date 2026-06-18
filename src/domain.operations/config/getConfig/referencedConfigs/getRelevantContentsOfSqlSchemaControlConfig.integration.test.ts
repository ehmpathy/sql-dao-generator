import { getRelevantContentsOfSqlSchemaControlConfig } from './getRelevantContentsOfSqlSchemaControlConfig';

describe('getRelevantContentsOfSqlSchemaControlConfig', () => {
  it('should be able to get the contents', async () => {
    const contents = await getRelevantContentsOfSqlSchemaControlConfig({
      pathToConfig: `${__dirname}/../../../.test.assets/exampleProject/provision/schema/control.yml`,
    });
    expect(contents.definitions).toContain('./sql/domain.yml');
  });
});
