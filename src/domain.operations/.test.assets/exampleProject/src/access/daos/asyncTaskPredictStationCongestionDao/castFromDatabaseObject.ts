import { HasMetadata } from 'type-fns';

import { AsyncTaskPredictStationCongestion } from '../../../domain';
import { SqlQueryFindAsyncTaskPredictStationCongestionByIdOutput } from '../../../data/dao/.generated/types';

export const castFromDatabaseObject = (
  dbObject: SqlQueryFindAsyncTaskPredictStationCongestionByIdOutput,
): HasMetadata<AsyncTaskPredictStationCongestion> =>
  new AsyncTaskPredictStationCongestion({
    id: dbObject.id,
    uuid: dbObject.uuid,
    createdAt: dbObject.created_at,
    updatedAt: dbObject.updated_at,
    status: dbObject.status as AsyncTaskPredictStationCongestion['status'],
    stationUuid: dbObject.station_uuid,
    trainLocatedEventUuid: dbObject.train_located_event_uuid,
  }) as HasMetadata<AsyncTaskPredictStationCongestion>;
