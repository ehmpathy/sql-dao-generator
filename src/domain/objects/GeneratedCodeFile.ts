import { DomainObject } from 'domain-objects';
import Joi from 'joi';

const schema = Joi.object().keys({
  relpath: Joi.string().required(),
  content: Joi.string().required(),
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
