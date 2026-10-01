import { Command, Flags } from '@oclif/core';
import { resolve as asAbsolutePath } from 'path';

import { generate } from '@src/domain.operations/commands/generate';

// biome-ignore lint/style/noDefaultExport: oclif commands require default exports
export default class Generate extends Command {
  public static description =
    'generate data-access-objects from domain-objects';

  public static flags = {
    help: Flags.help({ char: 'h' }),
    // .note = no `required: true`: a defaulted flag is always satisfied, so `required` only
    //         printed a contradictory `(required)` in `--help`
    config: Flags.string({
      char: 'c',
      description: 'path to config yml',
      default: 'codegen.sql.dao.yml',
    }),
  };

  public async run() {
    const { flags } = await this.parse(Generate);
    const config = flags.config!;

    // generate the code
    // .note = node's path operation keeps an absolute path, joins a relative one to cwd, and
    //         collapses `./`, so errors show the path the human typed
    const configPath = asAbsolutePath(config);
    await generate({ configPath });
  }
}
