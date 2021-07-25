import { Command, flags } from '@oclif/command';
import { generate } from '../../logic/commands/generate';

export default class Generate extends Command {
  public static description = 'generate data-access-objects from domain-objects';

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({
      char: 'c',
      description: 'path to config yml',
      required: true,
      default: 'codegen.sql.dao.yml',
    }),
  };

  public async run() {
    const { flags } = this.parse(Generate);
    const config = flags.config!;

    // generate the code
    const configPath = config.slice(0, 1) === '/' ? config : `${process.cwd()}/${config}`; // if starts with /, consider it as an absolute path
    await generate({ configPath });
  }
}
