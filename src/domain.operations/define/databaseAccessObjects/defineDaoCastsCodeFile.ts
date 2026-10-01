import { GeneratedCodeFile } from '@src/domain.objects/GeneratedCodeFile';

import { DAO_CASTS_MODULE_NAME, DAO_GENERATED_DIR } from './constants';
import { defineDaoCastsSectionAsDateFromDbValue } from './defineDaoCastsSectionAsDateFromDbValue';
import { defineDaoCastsSectionAsFromDatabase } from './defineDaoCastsSectionAsFromDatabase';
import { defineDaoCastsSectionAsJsonFromDbObject } from './defineDaoCastsSectionAsJsonFromDbObject';
import { defineDaoCastsSectionAsNumberFromDbValue } from './defineDaoCastsSectionAsNumberFromDbValue';
import { defineDaoCastsSectionDbValueCastError } from './defineDaoCastsSectionDbValueCastError';
import { defineDaoCastsSectionSetDbTypeParsers } from './defineDaoCastsSectionSetDbTypeParsers';

/**
 * .what = one artifact of the generated casts module — its package imports, and its body
 * .why  = each section states the packages it needs, so its import list moves with its body
 * .note  = a section holds no relative import — every section shares one module
 */
export interface DaoCastsSection {
  imports: string[];
  content: string;
}

/**
 * .what = defines the one shared module every generated dao imports its casts from
 * .why  = it sits in `.generated/` beside `types.ts` and `queryFunctions.ts`, the dir a consumer
 *         already reads
 * .note  = sections compose in dependency order. the namespace section is an object literal,
 *          evaluated at module init — placed above the casts it names, the module throws at import
 *          (temporal dead zone). `defineDaoCastsCodeFile.test.ts` pins that order
 * .note  = imports follow section order, deduped by exact statement
 */
export const defineDaoCastsCodeFile = (): GeneratedCodeFile => {
  const sections: DaoCastsSection[] = [
    defineDaoCastsSectionAsJsonFromDbObject(),
    defineDaoCastsSectionDbValueCastError(),
    defineDaoCastsSectionAsDateFromDbValue(),
    defineDaoCastsSectionAsNumberFromDbValue(),
    defineDaoCastsSectionAsFromDatabase(),
    defineDaoCastsSectionSetDbTypeParsers(),
  ];

  const imports = [...new Set(sections.flatMap((section) => section.imports))];

  return new GeneratedCodeFile({
    relpath: `${DAO_GENERATED_DIR}/${DAO_CASTS_MODULE_NAME}.ts`,
    content: [imports.join('\n'), ...sections.map((section) => section.content)]
      .filter((each) => each.length > 0)
      .join('\n\n'),
  });
};
