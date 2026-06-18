import { generate } from '@src/domain.operations/commands/generate';

import SqlCodeGenerator from './generate';

jest.mock('../../domain.operations/commands/generate');
const generateMock = generate as jest.Mock;

describe('generate', () => {
  it('should call the generate command logic', async () => {
    await SqlCodeGenerator.run([
      '-c',
      `${__dirname}/../.test.assets/exampleProject/codegen.sql.dao.yml`,
    ]);
    expect(generateMock).toHaveBeenCalledTimes(1);
    expect(generateMock).toHaveBeenCalledWith({
      configPath: `${__dirname}/../.test.assets/exampleProject/codegen.sql.dao.yml`,
    });
  });
});
