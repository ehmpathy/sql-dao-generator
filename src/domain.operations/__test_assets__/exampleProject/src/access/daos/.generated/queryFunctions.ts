import { pg as prepare } from 'yesql';
import { sql as sqlQueryFindAsyncTaskPredictStationCongestionByIdSql } from '../asyncTaskPredictStationCongestionDao/findById';
import { sql as sqlQueryFindAsyncTaskPredictStationCongestionByUniqueSql } from '../asyncTaskPredictStationCongestionDao/findByUnique';
import { sql as sqlQueryFindAsyncTaskPredictStationCongestionByUuidSql } from '../asyncTaskPredictStationCongestionDao/findByUuid';
import { sql as sqlQueryUpsertAsyncTaskPredictStationCongestionSql } from '../asyncTaskPredictStationCongestionDao/upsert';
import { sql as sqlQueryFindCarriageCargoByIdSql } from '../carriageCargoDao/findById';
import { sql as sqlQueryFindCarriageCargoByUniqueSql } from '../carriageCargoDao/findByUnique';
import { sql as sqlQueryFindCarriageCargoByUuidSql } from '../carriageCargoDao/findByUuid';
import { sql as sqlQueryUpsertCarriageCargoSql } from '../carriageCargoDao/upsert';
import { sql as sqlQueryFindCarriageByIdSql } from '../carriageDao/findById';
import { sql as sqlQueryFindCarriageByUniqueSql } from '../carriageDao/findByUnique';
import { sql as sqlQueryFindCarriageByUuidSql } from '../carriageDao/findByUuid';
import { sql as sqlQueryUpsertCarriageSql } from '../carriageDao/upsert';
import { sql as sqlQueryFindCertificateByIdSql } from '../certificateDao/findById';
import { sql as sqlQueryFindCertificateByUniqueSql } from '../certificateDao/findByUnique';
import { sql as sqlQueryUpsertCertificateSql } from '../certificateDao/upsert';
import { sql as sqlQueryFindGeocodeByIdSql } from '../geocodeDao/findById';
import { sql as sqlQueryFindGeocodeByUniqueSql } from '../geocodeDao/findByUnique';
import { sql as sqlQueryUpsertGeocodeSql } from '../geocodeDao/upsert';
import { sql as sqlQueryFindInvoiceByIdSql } from '../invoiceDao/findById';
import { sql as sqlQueryFindInvoiceByUniqueSql } from '../invoiceDao/findByUnique';
import { sql as sqlQueryFindInvoiceByUuidSql } from '../invoiceDao/findByUuid';
import { sql as sqlQueryUpsertInvoiceSql } from '../invoiceDao/upsert';
import { sql as sqlQueryFindInvoiceLineItemByIdSql } from '../invoiceLineItemDao/findById';
import { sql as sqlQueryFindInvoiceLineItemByUniqueSql } from '../invoiceLineItemDao/findByUnique';
import { sql as sqlQueryUpsertInvoiceLineItemSql } from '../invoiceLineItemDao/upsert';
import { sql as sqlQueryFindLocomotiveByIdSql } from '../locomotiveDao/findById';
import { sql as sqlQueryFindLocomotiveByUniqueSql } from '../locomotiveDao/findByUnique';
import { sql as sqlQueryFindLocomotiveByUuidSql } from '../locomotiveDao/findByUuid';
import { sql as sqlQueryUpsertLocomotiveSql } from '../locomotiveDao/upsert';
import { sql as sqlQueryFindPriceByIdSql } from '../priceDao/findById';
import { sql as sqlQueryFindPriceByUniqueSql } from '../priceDao/findByUnique';
import { sql as sqlQueryUpsertPriceSql } from '../priceDao/upsert';
import { sql as sqlQueryFindTrainByIdSql } from '../trainDao/findById';
import { sql as sqlQueryFindTrainByUniqueSql } from '../trainDao/findByUnique';
import { sql as sqlQueryFindTrainByUuidSql } from '../trainDao/findByUuid';
import { sql as sqlQueryUpsertTrainSql } from '../trainDao/upsert';
import { sql as sqlQueryFindTrainEngineerByIdSql } from '../trainEngineerDao/findById';
import { sql as sqlQueryFindTrainEngineerByUniqueSql } from '../trainEngineerDao/findByUnique';
import { sql as sqlQueryFindTrainEngineerByUuidSql } from '../trainEngineerDao/findByUuid';
import { sql as sqlQueryUpsertTrainEngineerSql } from '../trainEngineerDao/upsert';
import { sql as sqlQueryFindTrainStationByIdSql } from '../trainStationDao/findById';
import { sql as sqlQueryFindTrainStationByUniqueSql } from '../trainStationDao/findByUnique';
import { sql as sqlQueryFindTrainStationByUuidSql } from '../trainStationDao/findByUuid';
import { sql as sqlQueryUpsertTrainStationSql } from '../trainStationDao/upsert';
import {
  SqlQueryFindAsyncTaskPredictStationCongestionByIdInput,
  SqlQueryFindAsyncTaskPredictStationCongestionByIdOutput,
  SqlQueryFindAsyncTaskPredictStationCongestionByUniqueInput,
  SqlQueryFindAsyncTaskPredictStationCongestionByUniqueOutput,
  SqlQueryFindAsyncTaskPredictStationCongestionByUuidInput,
  SqlQueryFindAsyncTaskPredictStationCongestionByUuidOutput,
  SqlQueryFindCarriageByIdInput,
  SqlQueryFindCarriageByIdOutput,
  SqlQueryFindCarriageByUniqueInput,
  SqlQueryFindCarriageByUniqueOutput,
  SqlQueryFindCarriageByUuidInput,
  SqlQueryFindCarriageByUuidOutput,
  SqlQueryFindCarriageCargoByIdInput,
  SqlQueryFindCarriageCargoByIdOutput,
  SqlQueryFindCarriageCargoByUniqueInput,
  SqlQueryFindCarriageCargoByUniqueOutput,
  SqlQueryFindCarriageCargoByUuidInput,
  SqlQueryFindCarriageCargoByUuidOutput,
  SqlQueryFindCertificateByIdInput,
  SqlQueryFindCertificateByIdOutput,
  SqlQueryFindCertificateByUniqueInput,
  SqlQueryFindCertificateByUniqueOutput,
  SqlQueryFindGeocodeByIdInput,
  SqlQueryFindGeocodeByIdOutput,
  SqlQueryFindGeocodeByUniqueInput,
  SqlQueryFindGeocodeByUniqueOutput,
  SqlQueryFindInvoiceByIdInput,
  SqlQueryFindInvoiceByIdOutput,
  SqlQueryFindInvoiceByUniqueInput,
  SqlQueryFindInvoiceByUniqueOutput,
  SqlQueryFindInvoiceByUuidInput,
  SqlQueryFindInvoiceByUuidOutput,
  SqlQueryFindInvoiceLineItemByIdInput,
  SqlQueryFindInvoiceLineItemByIdOutput,
  SqlQueryFindInvoiceLineItemByUniqueInput,
  SqlQueryFindInvoiceLineItemByUniqueOutput,
  SqlQueryFindLocomotiveByIdInput,
  SqlQueryFindLocomotiveByIdOutput,
  SqlQueryFindLocomotiveByUniqueInput,
  SqlQueryFindLocomotiveByUniqueOutput,
  SqlQueryFindLocomotiveByUuidInput,
  SqlQueryFindLocomotiveByUuidOutput,
  SqlQueryFindPriceByIdInput,
  SqlQueryFindPriceByIdOutput,
  SqlQueryFindPriceByUniqueInput,
  SqlQueryFindPriceByUniqueOutput,
  SqlQueryFindTrainByIdInput,
  SqlQueryFindTrainByIdOutput,
  SqlQueryFindTrainByUniqueInput,
  SqlQueryFindTrainByUniqueOutput,
  SqlQueryFindTrainByUuidInput,
  SqlQueryFindTrainByUuidOutput,
  SqlQueryFindTrainEngineerByIdInput,
  SqlQueryFindTrainEngineerByIdOutput,
  SqlQueryFindTrainEngineerByUniqueInput,
  SqlQueryFindTrainEngineerByUniqueOutput,
  SqlQueryFindTrainEngineerByUuidInput,
  SqlQueryFindTrainEngineerByUuidOutput,
  SqlQueryFindTrainStationByIdInput,
  SqlQueryFindTrainStationByIdOutput,
  SqlQueryFindTrainStationByUniqueInput,
  SqlQueryFindTrainStationByUniqueOutput,
  SqlQueryFindTrainStationByUuidInput,
  SqlQueryFindTrainStationByUuidOutput,
  SqlQueryUpsertAsyncTaskPredictStationCongestionInput,
  SqlQueryUpsertAsyncTaskPredictStationCongestionOutput,
  SqlQueryUpsertCarriageCargoInput,
  SqlQueryUpsertCarriageCargoOutput,
  SqlQueryUpsertCarriageInput,
  SqlQueryUpsertCarriageOutput,
  SqlQueryUpsertCertificateInput,
  SqlQueryUpsertCertificateOutput,
  SqlQueryUpsertGeocodeInput,
  SqlQueryUpsertGeocodeOutput,
  SqlQueryUpsertInvoiceInput,
  SqlQueryUpsertInvoiceLineItemInput,
  SqlQueryUpsertInvoiceLineItemOutput,
  SqlQueryUpsertInvoiceOutput,
  SqlQueryUpsertLocomotiveInput,
  SqlQueryUpsertLocomotiveOutput,
  SqlQueryUpsertPriceInput,
  SqlQueryUpsertPriceOutput,
  SqlQueryUpsertTrainEngineerInput,
  SqlQueryUpsertTrainEngineerOutput,
  SqlQueryUpsertTrainInput,
  SqlQueryUpsertTrainOutput,
  SqlQueryUpsertTrainStationInput,
  SqlQueryUpsertTrainStationOutput,
} from './types';

// typedefs common to each query function
export type DatabaseExecuteCommand = (args: { sql: string; values: any[] }) => Promise<{ rows: any[] }>;
export type LogMethod = (message: string, metadata: any) => void;

// utility used by each query function
export const executeQueryWithBestPractices = async ({
  dbExecute,
  logDebug,
  name,
  sql,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  name: string;
  sql: string;
  input: object | null;
}) => {
  // 1. define the query with yesql
  const { text: preparedSql, values: preparedValues } = prepare(sql)(input || {});

  // 2. log that we're running the request
  logDebug(`${name}.input`, { input });

  // 3. execute the query
  const { rows: output } = await dbExecute({ sql: preparedSql, values: preparedValues });

  // 4. log that we've executed the request
  logDebug(`${name}.output`, { output });

  // 5. return the output
  return output;
};

// client method for query 'find_async_task_predict_station_congestion_by_id'
export const sqlQueryFindAsyncTaskPredictStationCongestionById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindAsyncTaskPredictStationCongestionByIdInput;
}): Promise<SqlQueryFindAsyncTaskPredictStationCongestionByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindAsyncTaskPredictStationCongestionById',
    sql: sqlQueryFindAsyncTaskPredictStationCongestionByIdSql,
    input,
  });

// client method for query 'find_async_task_predict_station_congestion_by_unique'
export const sqlQueryFindAsyncTaskPredictStationCongestionByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindAsyncTaskPredictStationCongestionByUniqueInput;
}): Promise<SqlQueryFindAsyncTaskPredictStationCongestionByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindAsyncTaskPredictStationCongestionByUnique',
    sql: sqlQueryFindAsyncTaskPredictStationCongestionByUniqueSql,
    input,
  });

// client method for query 'find_async_task_predict_station_congestion_by_uuid'
export const sqlQueryFindAsyncTaskPredictStationCongestionByUuid = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindAsyncTaskPredictStationCongestionByUuidInput;
}): Promise<SqlQueryFindAsyncTaskPredictStationCongestionByUuidOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindAsyncTaskPredictStationCongestionByUuid',
    sql: sqlQueryFindAsyncTaskPredictStationCongestionByUuidSql,
    input,
  });

// client method for query 'find_carriage_by_id'
export const sqlQueryFindCarriageById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindCarriageByIdInput;
}): Promise<SqlQueryFindCarriageByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindCarriageById',
    sql: sqlQueryFindCarriageByIdSql,
    input,
  });

// client method for query 'find_carriage_by_unique'
export const sqlQueryFindCarriageByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindCarriageByUniqueInput;
}): Promise<SqlQueryFindCarriageByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindCarriageByUnique',
    sql: sqlQueryFindCarriageByUniqueSql,
    input,
  });

// client method for query 'find_carriage_by_uuid'
export const sqlQueryFindCarriageByUuid = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindCarriageByUuidInput;
}): Promise<SqlQueryFindCarriageByUuidOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindCarriageByUuid',
    sql: sqlQueryFindCarriageByUuidSql,
    input,
  });

// client method for query 'find_carriage_cargo_by_id'
export const sqlQueryFindCarriageCargoById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindCarriageCargoByIdInput;
}): Promise<SqlQueryFindCarriageCargoByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindCarriageCargoById',
    sql: sqlQueryFindCarriageCargoByIdSql,
    input,
  });

// client method for query 'find_carriage_cargo_by_unique'
export const sqlQueryFindCarriageCargoByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindCarriageCargoByUniqueInput;
}): Promise<SqlQueryFindCarriageCargoByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindCarriageCargoByUnique',
    sql: sqlQueryFindCarriageCargoByUniqueSql,
    input,
  });

// client method for query 'find_carriage_cargo_by_uuid'
export const sqlQueryFindCarriageCargoByUuid = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindCarriageCargoByUuidInput;
}): Promise<SqlQueryFindCarriageCargoByUuidOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindCarriageCargoByUuid',
    sql: sqlQueryFindCarriageCargoByUuidSql,
    input,
  });

// client method for query 'find_certificate_by_id'
export const sqlQueryFindCertificateById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindCertificateByIdInput;
}): Promise<SqlQueryFindCertificateByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindCertificateById',
    sql: sqlQueryFindCertificateByIdSql,
    input,
  });

// client method for query 'find_certificate_by_unique'
export const sqlQueryFindCertificateByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindCertificateByUniqueInput;
}): Promise<SqlQueryFindCertificateByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindCertificateByUnique',
    sql: sqlQueryFindCertificateByUniqueSql,
    input,
  });

// client method for query 'find_geocode_by_id'
export const sqlQueryFindGeocodeById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindGeocodeByIdInput;
}): Promise<SqlQueryFindGeocodeByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindGeocodeById',
    sql: sqlQueryFindGeocodeByIdSql,
    input,
  });

// client method for query 'find_geocode_by_unique'
export const sqlQueryFindGeocodeByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindGeocodeByUniqueInput;
}): Promise<SqlQueryFindGeocodeByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindGeocodeByUnique',
    sql: sqlQueryFindGeocodeByUniqueSql,
    input,
  });

// client method for query 'find_invoice_by_id'
export const sqlQueryFindInvoiceById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindInvoiceByIdInput;
}): Promise<SqlQueryFindInvoiceByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindInvoiceById',
    sql: sqlQueryFindInvoiceByIdSql,
    input,
  });

// client method for query 'find_invoice_by_unique'
export const sqlQueryFindInvoiceByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindInvoiceByUniqueInput;
}): Promise<SqlQueryFindInvoiceByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindInvoiceByUnique',
    sql: sqlQueryFindInvoiceByUniqueSql,
    input,
  });

// client method for query 'find_invoice_by_uuid'
export const sqlQueryFindInvoiceByUuid = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindInvoiceByUuidInput;
}): Promise<SqlQueryFindInvoiceByUuidOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindInvoiceByUuid',
    sql: sqlQueryFindInvoiceByUuidSql,
    input,
  });

// client method for query 'find_invoice_line_item_by_id'
export const sqlQueryFindInvoiceLineItemById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindInvoiceLineItemByIdInput;
}): Promise<SqlQueryFindInvoiceLineItemByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindInvoiceLineItemById',
    sql: sqlQueryFindInvoiceLineItemByIdSql,
    input,
  });

// client method for query 'find_invoice_line_item_by_unique'
export const sqlQueryFindInvoiceLineItemByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindInvoiceLineItemByUniqueInput;
}): Promise<SqlQueryFindInvoiceLineItemByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindInvoiceLineItemByUnique',
    sql: sqlQueryFindInvoiceLineItemByUniqueSql,
    input,
  });

// client method for query 'find_locomotive_by_id'
export const sqlQueryFindLocomotiveById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindLocomotiveByIdInput;
}): Promise<SqlQueryFindLocomotiveByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindLocomotiveById',
    sql: sqlQueryFindLocomotiveByIdSql,
    input,
  });

// client method for query 'find_locomotive_by_unique'
export const sqlQueryFindLocomotiveByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindLocomotiveByUniqueInput;
}): Promise<SqlQueryFindLocomotiveByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindLocomotiveByUnique',
    sql: sqlQueryFindLocomotiveByUniqueSql,
    input,
  });

// client method for query 'find_locomotive_by_uuid'
export const sqlQueryFindLocomotiveByUuid = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindLocomotiveByUuidInput;
}): Promise<SqlQueryFindLocomotiveByUuidOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindLocomotiveByUuid',
    sql: sqlQueryFindLocomotiveByUuidSql,
    input,
  });

// client method for query 'find_price_by_id'
export const sqlQueryFindPriceById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindPriceByIdInput;
}): Promise<SqlQueryFindPriceByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindPriceById',
    sql: sqlQueryFindPriceByIdSql,
    input,
  });

// client method for query 'find_price_by_unique'
export const sqlQueryFindPriceByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindPriceByUniqueInput;
}): Promise<SqlQueryFindPriceByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindPriceByUnique',
    sql: sqlQueryFindPriceByUniqueSql,
    input,
  });

// client method for query 'find_train_by_id'
export const sqlQueryFindTrainById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainByIdInput;
}): Promise<SqlQueryFindTrainByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainById',
    sql: sqlQueryFindTrainByIdSql,
    input,
  });

// client method for query 'find_train_by_unique'
export const sqlQueryFindTrainByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainByUniqueInput;
}): Promise<SqlQueryFindTrainByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainByUnique',
    sql: sqlQueryFindTrainByUniqueSql,
    input,
  });

// client method for query 'find_train_by_uuid'
export const sqlQueryFindTrainByUuid = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainByUuidInput;
}): Promise<SqlQueryFindTrainByUuidOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainByUuid',
    sql: sqlQueryFindTrainByUuidSql,
    input,
  });

// client method for query 'find_train_engineer_by_id'
export const sqlQueryFindTrainEngineerById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainEngineerByIdInput;
}): Promise<SqlQueryFindTrainEngineerByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainEngineerById',
    sql: sqlQueryFindTrainEngineerByIdSql,
    input,
  });

// client method for query 'find_train_engineer_by_unique'
export const sqlQueryFindTrainEngineerByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainEngineerByUniqueInput;
}): Promise<SqlQueryFindTrainEngineerByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainEngineerByUnique',
    sql: sqlQueryFindTrainEngineerByUniqueSql,
    input,
  });

// client method for query 'find_train_engineer_by_uuid'
export const sqlQueryFindTrainEngineerByUuid = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainEngineerByUuidInput;
}): Promise<SqlQueryFindTrainEngineerByUuidOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainEngineerByUuid',
    sql: sqlQueryFindTrainEngineerByUuidSql,
    input,
  });

// client method for query 'find_train_station_by_id'
export const sqlQueryFindTrainStationById = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainStationByIdInput;
}): Promise<SqlQueryFindTrainStationByIdOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainStationById',
    sql: sqlQueryFindTrainStationByIdSql,
    input,
  });

// client method for query 'find_train_station_by_unique'
export const sqlQueryFindTrainStationByUnique = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainStationByUniqueInput;
}): Promise<SqlQueryFindTrainStationByUniqueOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainStationByUnique',
    sql: sqlQueryFindTrainStationByUniqueSql,
    input,
  });

// client method for query 'find_train_station_by_uuid'
export const sqlQueryFindTrainStationByUuid = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryFindTrainStationByUuidInput;
}): Promise<SqlQueryFindTrainStationByUuidOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryFindTrainStationByUuid',
    sql: sqlQueryFindTrainStationByUuidSql,
    input,
  });

// client method for query 'upsert_async_task_predict_station_congestion'
export const sqlQueryUpsertAsyncTaskPredictStationCongestion = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertAsyncTaskPredictStationCongestionInput;
}): Promise<SqlQueryUpsertAsyncTaskPredictStationCongestionOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertAsyncTaskPredictStationCongestion',
    sql: sqlQueryUpsertAsyncTaskPredictStationCongestionSql,
    input,
  });

// client method for query 'upsert_carriage'
export const sqlQueryUpsertCarriage = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertCarriageInput;
}): Promise<SqlQueryUpsertCarriageOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertCarriage',
    sql: sqlQueryUpsertCarriageSql,
    input,
  });

// client method for query 'upsert_carriage_cargo'
export const sqlQueryUpsertCarriageCargo = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertCarriageCargoInput;
}): Promise<SqlQueryUpsertCarriageCargoOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertCarriageCargo',
    sql: sqlQueryUpsertCarriageCargoSql,
    input,
  });

// client method for query 'upsert_certificate'
export const sqlQueryUpsertCertificate = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertCertificateInput;
}): Promise<SqlQueryUpsertCertificateOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertCertificate',
    sql: sqlQueryUpsertCertificateSql,
    input,
  });

// client method for query 'upsert_geocode'
export const sqlQueryUpsertGeocode = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertGeocodeInput;
}): Promise<SqlQueryUpsertGeocodeOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertGeocode',
    sql: sqlQueryUpsertGeocodeSql,
    input,
  });

// client method for query 'upsert_invoice'
export const sqlQueryUpsertInvoice = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertInvoiceInput;
}): Promise<SqlQueryUpsertInvoiceOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertInvoice',
    sql: sqlQueryUpsertInvoiceSql,
    input,
  });

// client method for query 'upsert_invoice_line_item'
export const sqlQueryUpsertInvoiceLineItem = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertInvoiceLineItemInput;
}): Promise<SqlQueryUpsertInvoiceLineItemOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertInvoiceLineItem',
    sql: sqlQueryUpsertInvoiceLineItemSql,
    input,
  });

// client method for query 'upsert_locomotive'
export const sqlQueryUpsertLocomotive = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertLocomotiveInput;
}): Promise<SqlQueryUpsertLocomotiveOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertLocomotive',
    sql: sqlQueryUpsertLocomotiveSql,
    input,
  });

// client method for query 'upsert_price'
export const sqlQueryUpsertPrice = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertPriceInput;
}): Promise<SqlQueryUpsertPriceOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertPrice',
    sql: sqlQueryUpsertPriceSql,
    input,
  });

// client method for query 'upsert_train'
export const sqlQueryUpsertTrain = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertTrainInput;
}): Promise<SqlQueryUpsertTrainOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertTrain',
    sql: sqlQueryUpsertTrainSql,
    input,
  });

// client method for query 'upsert_train_engineer'
export const sqlQueryUpsertTrainEngineer = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertTrainEngineerInput;
}): Promise<SqlQueryUpsertTrainEngineerOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertTrainEngineer',
    sql: sqlQueryUpsertTrainEngineerSql,
    input,
  });

// client method for query 'upsert_train_station'
export const sqlQueryUpsertTrainStation = async ({
  dbExecute,
  logDebug,
  input,
}: {
  dbExecute: DatabaseExecuteCommand;
  logDebug: LogMethod;
  input: SqlQueryUpsertTrainStationInput;
}): Promise<SqlQueryUpsertTrainStationOutput[]> =>
  executeQueryWithBestPractices({
    dbExecute,
    logDebug,
    name: 'sqlQueryUpsertTrainStation',
    sql: sqlQueryUpsertTrainStationSql,
    input,
  });
