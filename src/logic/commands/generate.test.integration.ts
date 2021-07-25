import { generate } from './generate';

jest.setTimeout(60 * 1000);
describe('generate', () => {
  const testAssetPaths = {
    codegenYml: `${__dirname}/../__test_assets__/exampleProject/codegen.sql.dao.yml`,
  };
  it('should be able to generate for the example config provisioned in __test_assets__', async () => {
    await generate({
      configPath: testAssetPaths.codegenYml,
    });

    // // expect that the types code does not have compile errors
    // await import(testAssetPaths.generatedTypesCode);

    // // expect that the query functions code does not have compile errors
    // const queryFunctionExports = await import(testAssetPaths.generatedQueryFunctionsCode);
    // expect(queryFunctionExports).toHaveProperty('sqlQueryFindAllByName');

    // // expect the look right
    // const typesCode = (await readFile(testAssetPaths.generatedTypesCode)).toString();
    // expect(typesCode).toMatchSnapshot();

    // // expect the functions look right
    // const queryFunctionsCode = (await readFile(testAssetPaths.generatedQueryFunctionsCode)).toString();
    // expect(queryFunctionsCode).toMatchSnapshot();
  });
});
