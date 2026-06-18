import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';
import { isRefByPrimary } from 'domain-objects';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { CarriageCargo } from '../../../domain';
import { sqlQueryFindCarriageCargoById } from '../../../data/dao/.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';

export const sql = `
  -- query_name = find_carriage_cargo_by_id
  SELECT
    carriage_cargo.id,
    carriage_cargo.uuid,
    carriage_cargo.itinerary_uuid,
    carriage_cargo.carriage_uuid,
    carriage_cargo.slot,
    carriage_cargo.cargo_exid
  FROM view_carriage_cargo_hydrated AS carriage_cargo
  WHERE carriage_cargo.id = :id;
`;

export const findById = async (
  {
    id,
  }: {
    id: number;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<CarriageCargo> | null> => {
  const results = await sqlQueryFindCarriageCargoById({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      id,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
