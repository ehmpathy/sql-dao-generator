import { HasMetadata } from 'type-fns';
import { VisualogicContext } from 'visualogic';
import { Ref, isRefByPrimary } from 'domain-objects';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { Carriage, CarriageCargo } from '../../../domain';
import { sqlQueryFindCarriageCargoByUnique } from '../.generated/queryFunctions';
import { castFromDatabaseObject } from './castFromDatabaseObject';
import { carriageDao } from '../carriageDao';

export const sql = `
  -- query_name = find_carriage_cargo_by_unique
  SELECT
    carriage_cargo.id,
    carriage_cargo.uuid,
    carriage_cargo.itinerary_uuid,
    carriage_cargo.carriage_uuid,
    carriage_cargo.slot,
    carriage_cargo.cargo_exid
  FROM view_carriage_cargo_hydrated AS carriage_cargo
  JOIN view_carriage_cargo_current ON carriage_cargo.id = view_carriage_cargo_current.id
  WHERE 1=1
    AND carriage_cargo.itinerary_uuid = :itineraryUuid
    AND view_carriage_cargo_current.carriage_id = (SELECT id FROM carriage WHERE carriage.uuid = :carriageUuid)
    AND carriage_cargo.slot = :slot;
`;

export const findByUnique = async (
  {
    itineraryUuid,
    carriageRef,
    slot,
  }: {
    itineraryUuid: string;
    carriageRef: Ref<typeof Carriage>;
    slot: number;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<CarriageCargo> | null> => {
  const results = await sqlQueryFindCarriageCargoByUnique({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      itineraryUuid,
      carriageUuid: isRefByPrimary({ of: Carriage })(carriageRef) ? carriageRef.uuid : (await carriageDao.findByRef({ ref: carriageRef }, context).expect('isPresent')).uuid,
      slot,
    },
  });
  const [dbObject, ...moreDbObjects] = results;
  if (moreDbObjects.length) throw new Error('expected only one db object for this query');
  if (!dbObject) return null;
  return castFromDatabaseObject(dbObject);
};
