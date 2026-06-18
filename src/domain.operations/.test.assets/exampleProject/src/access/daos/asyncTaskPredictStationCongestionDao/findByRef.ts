import { UnexpectedCodePathError } from 'helpful-errors';
import { VisualogicContext } from 'visualogic';
import { Ref, isRefByPrimary, isRefByUnique } from 'domain-objects';
import { HasMetadata } from 'type-fns';

import { AsyncTaskPredictStationCongestion } from '../../../domain';
import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { findByUnique } from './findByUnique';
import { findByUuid } from './findByUuid';

export const findByRef = async (
  input: { ref: Ref<typeof AsyncTaskPredictStationCongestion> },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<AsyncTaskPredictStationCongestion> | null> => {
  if (isRefByPrimary({ of: AsyncTaskPredictStationCongestion })(input.ref))
    return await findByUuid(input.ref, context);
  if (isRefByUnique({ of: AsyncTaskPredictStationCongestion })(input.ref))
    return await findByUnique(input.ref, context);
  throw new UnexpectedCodePathError('invalid ref for AsyncTaskPredictStationCongestion', { input });
};
