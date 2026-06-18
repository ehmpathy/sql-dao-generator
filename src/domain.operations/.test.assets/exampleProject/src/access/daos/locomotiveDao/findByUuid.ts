import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Locomotive } from '../../../domain';
import { sqlQueryFindLocomotiveByUuid } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_locomotive_by_uuid
  SELECT
    locomotive.id,
    locomotive.uuid,
    locomotive.created_at,
    locomotive.effective_at,
    locomotive.updated_at,
    locomotive.ein,
    locomotive.fuel,
    locomotive.capacity,
    locomotive.milage
  FROM view_locomotive_hydrated AS locomotive
  WHERE locomotive.uuid = :uuid;
`;

export const findByUuid = async (
  {
    uuid,
  }: {
    uuid: string;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<Locomotive> | null> => {
  const results = await sqlQueryFindLocomotiveByUuid({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      uuid,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
