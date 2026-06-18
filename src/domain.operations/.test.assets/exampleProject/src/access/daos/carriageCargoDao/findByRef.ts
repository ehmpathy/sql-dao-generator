import { UnexpectedCodePathError } from 'helpful-errors';
import { VisualogicContext } from 'visualogic';
import { Ref, isRefByPrimary, isRefByUnique } from 'domain-objects';
import { HasMetadata } from 'type-fns';

import { CarriageCargo } from '../../../domain';
import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { findByUnique } from './findByUnique';
import { findByUuid } from './findByUuid';

export const findByRef = async (
  input: { ref: Ref<typeof CarriageCargo> },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<CarriageCargo> | null> => {
  if (isRefByPrimary({ of: CarriageCargo })(input.ref))
    return await findByUuid(input.ref, context);
  if (isRefByUnique({ of: CarriageCargo })(input.ref))
    return await findByUnique(input.ref, context);
  throw new UnexpectedCodePathError('invalid ref for CarriageCargo', { input });
};
