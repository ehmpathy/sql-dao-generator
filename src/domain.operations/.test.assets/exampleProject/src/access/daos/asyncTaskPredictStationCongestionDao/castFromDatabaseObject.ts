import { HasMetadata } from 'type-fns';

import { AsyncTaskPredictStationCongestion } from '../../../domain';
import { SqlQueryFindAsyncTaskPredictStationCongestionByIdOutput as SqlQueryFindAsyncTaskPredictStationCongestionByIdOutputStrict } from '../.generated/types';
import { asFromDatabase } from '../.generated/casts';

export type { SqlQueryFindAsyncTaskPredictStationCongestionByIdOutputStrict };

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindAsyncTaskPredictStationCongestionByIdOutputStrict,
): HasMetadata<AsyncTaskPredictStationCongestion> =>
  new AsyncTaskPredictStationCongestion({
    id: asFromDatabase.number(dbObject.id),
    uuid: dbObject.uuid,
    createdAt: asFromDatabase.date(dbObject.created_at),
    updatedAt: asFromDatabase.date(dbObject.updated_at),
    status: dbObject.status as AsyncTaskPredictStationCongestion['status'],
    stationUuid: dbObject.station_uuid,
    trainLocatedEventUuid: dbObject.train_located_event_uuid,
  }) as HasMetadata<AsyncTaskPredictStationCongestion>;
