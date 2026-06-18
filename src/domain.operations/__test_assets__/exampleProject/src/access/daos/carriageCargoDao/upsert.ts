import { VisualogicContext } from 'visualogic';
import { HasMetadata } from 'type-fns';
import { isRefByPrimary } from 'domain-objects';

import { DatabaseConnection } from '../../../util/database/getDbConnection';
import { CarriageCargo, Carriage } from '../../../domain';
import { sqlQueryUpsertCarriageCargo } from '../.generated/queryFunctions';
import { carriageDao } from '../carriageDao';

export const sql = `
  -- query_name = upsert_carriage_cargo
  SELECT
    dgv.id, dgv.uuid
  FROM upsert_carriage_cargo(
    :itineraryUuid,
    (SELECT id FROM carriage WHERE carriage.uuid = :carriageUuid),
    :slot,
    :cargoExid
  ) as dgv;
`;

export const upsert = async (
  {
    carriageCargo,
  }: {
    carriageCargo: CarriageCargo;
  },
  context: { dbConnection: DatabaseConnection } & VisualogicContext,
): Promise<HasMetadata<CarriageCargo>> => {
  const results = await sqlQueryUpsertCarriageCargo({
    dbExecute: context.dbConnection.query,
    logDebug: context.log.debug,
    input: {
      itineraryUuid: carriageCargo.itineraryUuid,
      carriageUuid: isRefByPrimary({ of: Carriage })(carriageCargo.carriageRef) ? carriageCargo.carriageRef.uuid : (await carriageDao.findByRef({ ref: carriageCargo.carriageRef }, context).expect('isPresent')).uuid,
      slot: carriageCargo.slot,
      cargoExid: carriageCargo.cargoExid,
    },
  });
  const { id, uuid } = results[0]!; // grab the db generated values
  return new CarriageCargo({ ...carriageCargo, id, uuid }) as HasMetadata<CarriageCargo>;
};
