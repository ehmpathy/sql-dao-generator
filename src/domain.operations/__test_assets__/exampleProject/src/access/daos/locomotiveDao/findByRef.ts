import { UnexpectedCodePathError } from 'helpful-errors';
import { VisualogicContext } from 'visualogic';
import { Ref, isRefByPrimary, isRefByUnique } from 'domain-objects';
import { HasMetadata } from 'type-fns';

import { Locomotive } from '../../../domain';
import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { findByUnique } from './findByUnique';
import { findByUuid } from './findByUuid';

export const findByRef = async (
  input: { ref: Ref<typeof Locomotive> },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Locomotive> | null> => {
  if (isRefByPrimary({ of: Locomotive })(input.ref))
    return await findByUuid(input.ref, context);
  if (isRefByUnique({ of: Locomotive })(input.ref))
    return await findByUnique(input.ref, context);
  throw new UnexpectedCodePathError('invalid ref for Locomotive', { input });
};
