import { UnexpectedCodePathError } from 'helpful-errors';
import { VisualogicContext } from 'visualogic';
import { Ref, isRefByPrimary, isRefByUnique } from 'domain-objects';
import { HasMetadata } from 'type-fns';

import { Train } from '../../../domain';
import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { findByUnique } from './findByUnique';
import { findByUuid } from './findByUuid';

export const findByRef = async (
  input: { ref: Ref<typeof Train> },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Train> | null> => {
  if (isRefByPrimary({ of: Train })(input.ref))
    return await findByUuid(input.ref, context);
  if (isRefByUnique({ of: Train })(input.ref))
    return await findByUnique(input.ref, context);
  throw new UnexpectedCodePathError('invalid ref for Train', { input });
};
