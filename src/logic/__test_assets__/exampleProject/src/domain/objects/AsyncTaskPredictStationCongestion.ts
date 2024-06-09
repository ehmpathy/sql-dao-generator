import { DomainEntity } from 'domain-objects';
import { AsyncTask, AsyncTaskStatus } from 'simple-async-tasks';

/**
 * an async task which predicts station congestion by comparing expected arrival time with estimated arrival time
 */
export interface AsyncTaskPredictStationCongestion extends AsyncTask {
  id?: number;
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status: AsyncTaskStatus;

  /**
   * the station to run this prediction for
   */
  stationUuid: string;

  /**
   * the event to run the prediction on
   *
   * note
   * - this has a nested dependency on a train, which we use to test sql-schema-control order
   */
  trainLocatedEventUuid: string;
}
export class AsyncTaskPredictStationCongestion
  extends DomainEntity<AsyncTaskPredictStationCongestion>
  implements AsyncTaskPredictStationCongestion
{
  public static unique = ['stationUuid', 'trainLocatedEventUuid'];
  public static updatable = ['status'];
}
