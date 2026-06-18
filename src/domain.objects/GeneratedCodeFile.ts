import { DomainObject } from 'domain-objects';
import { z } from 'zod';

const schema = z.object({
  relpath: z.string(),
  content: z.string(),
});

export interface GeneratedCodeFile {
  relpath: string; // the relative path of this file, from whatever the root is decided to be
  content: string;
}
export class GeneratedCodeFile
  extends DomainObject<GeneratedCodeFile>
  implements GeneratedCodeFile
{
  public static schema = schema;
}
