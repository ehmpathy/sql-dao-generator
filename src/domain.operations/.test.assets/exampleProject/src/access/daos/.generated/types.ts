// types for table 'async_task_predict_station_congestion'
export interface SqlTableAsyncTaskPredictStationCongestion {
  id: number;
  uuid: string;
  created_at: Date;
  station_id: number;
  train_located_event_id: number;
}

// types for table 'async_task_predict_station_congestion_cvp'
export interface SqlTableAsyncTaskPredictStationCongestionCvp {
  id: number;
  updated_at: Date;
  async_task_predict_station_congestion_id: number;
  async_task_predict_station_congestion_version_id: number;
}

// types for table 'async_task_predict_station_congestion_version'
export interface SqlTableAsyncTaskPredictStationCongestionVersion {
  id: number;
  async_task_predict_station_congestion_id: number;
  effective_at: Date;
  created_at: Date;
  status: string;
}

// types for table 'carriage'
export interface SqlTableCarriage {
  id: number;
  uuid: string;
  created_at: Date;
  cin: string;
  carries: string;
  capacity: number;
}

// types for table 'carriage_cargo'
export interface SqlTableCarriageCargo {
  id: number;
  uuid: string;
  created_at: Date;
  itinerary_uuid: string;
  carriage_id: number;
  slot: number;
}

// types for table 'carriage_cargo_cvp'
export interface SqlTableCarriageCargoCvp {
  id: number;
  updated_at: Date;
  carriage_cargo_id: number;
  carriage_cargo_version_id: number;
}

// types for table 'carriage_cargo_version'
export interface SqlTableCarriageCargoVersion {
  id: number;
  carriage_cargo_id: number;
  effective_at: Date;
  created_at: Date;
  cargo_exid: string | null;
}

// types for table 'certificate'
export interface SqlTableCertificate {
  id: number;
  uuid: string;
  created_at: Date;
  type: string;
  industry_id: string;
}

// types for table 'geocode'
export interface SqlTableGeocode {
  id: number;
  uuid: string;
  created_at: Date;
  latitude: number;
  longitude: number;
}

// types for table 'invoice'
export interface SqlTableInvoice {
  id: number;
  uuid: string;
  created_at: Date;
  external_id: string;
}

// types for table 'invoice_cvp'
export interface SqlTableInvoiceCvp {
  id: number;
  updated_at: Date;
  invoice_id: number;
  invoice_version_id: number;
}

// types for table 'invoice_line_item'
export interface SqlTableInvoiceLineItem {
  id: number;
  uuid: string;
  created_at: Date;
  price_id: number;
  title: string;
  explanation: string;
}

// types for table 'invoice_version'
export interface SqlTableInvoiceVersion {
  id: number;
  invoice_id: number;
  effective_at: Date;
  created_at: Date;
  total_price_id: number;
  status: string;
  item_ids_hash: Buffer;
}

// types for table 'invoice_version_to_line_item'
export interface SqlTableInvoiceVersionToLineItem {
  id: number;
  created_at: Date;
  invoice_version_id: number;
  invoice_line_item_id: number;
  array_order_index: number;
}

// types for table 'locomotive'
export interface SqlTableLocomotive {
  id: number;
  uuid: string;
  created_at: Date;
  ein: string;
  fuel: string;
  capacity: number;
}

// types for table 'locomotive_cvp'
export interface SqlTableLocomotiveCvp {
  id: number;
  updated_at: Date;
  locomotive_id: number;
  locomotive_version_id: number;
}

// types for table 'locomotive_version'
export interface SqlTableLocomotiveVersion {
  id: number;
  locomotive_id: number;
  effective_at: Date;
  created_at: Date;
  milage: number;
}

// types for table 'price'
export interface SqlTablePrice {
  id: number;
  uuid: string;
  created_at: Date;
  amount: number;
  currency: string;
}

// types for table 'train'
export interface SqlTableTrain {
  id: number;
  uuid: string;
  created_at: Date;
  home_station_geocode_id: number;
  combination_id: string;
  lead_engineer_id: number;
  locomotive_ids_hash: Buffer;
  carriage_ids_hash: Buffer;
  engineer_ids_hash: Buffer;
}

// types for table 'train_cvp'
export interface SqlTableTrainCvp {
  id: number;
  updated_at: Date;
  train_id: number;
  train_version_id: number;
}

// types for table 'train_engineer'
export interface SqlTableTrainEngineer {
  id: number;
  uuid: string;
  created_at: Date;
  social_security_number_hash: string;
}

// types for table 'train_engineer_cvp'
export interface SqlTableTrainEngineerCvp {
  id: number;
  updated_at: Date;
  train_engineer_id: number;
  train_engineer_version_id: number;
}

// types for table 'train_engineer_version'
export interface SqlTableTrainEngineerVersion {
  id: number;
  train_engineer_id: number;
  effective_at: Date;
  created_at: Date;
  name: string;
  certificate_ids_hash: Buffer;
  license_uuids_hash: Buffer;
}

// types for table 'train_engineer_version_to_certificate'
export interface SqlTableTrainEngineerVersionToCertificate {
  id: number;
  created_at: Date;
  train_engineer_version_id: number;
  certificate_id: number;
  array_order_index: number;
}

// types for table 'train_engineer_version_to_license_uuid'
export interface SqlTableTrainEngineerVersionToLicenseUuid {
  id: number;
  created_at: Date;
  train_engineer_version_id: number;
  license_uuid: string;
  array_order_index: number;
}

// types for table 'train_station'
export interface SqlTableTrainStation {
  id: number;
  uuid: string;
  created_at: Date;
  geocode_id: number;
}

// types for table 'train_station_cvp'
export interface SqlTableTrainStationCvp {
  id: number;
  updated_at: Date;
  train_station_id: number;
  train_station_version_id: number;
}

// types for table 'train_station_version'
export interface SqlTableTrainStationVersion {
  id: number;
  train_station_id: number;
  effective_at: Date;
  created_at: Date;
  name: string;
}

// types for table 'train_to_carriage'
export interface SqlTableTrainToCarriage {
  id: number;
  created_at: Date;
  train_id: number;
  carriage_id: number;
  array_order_index: number;
}

// types for table 'train_to_engineer'
export interface SqlTableTrainToEngineer {
  id: number;
  created_at: Date;
  train_id: number;
  train_engineer_id: number;
  array_order_index: number;
}

// types for table 'train_to_locomotive'
export interface SqlTableTrainToLocomotive {
  id: number;
  created_at: Date;
  train_id: number;
  locomotive_id: number;
  array_order_index: number;
}

// types for table 'train_version'
export interface SqlTableTrainVersion {
  id: number;
  train_id: number;
  effective_at: Date;
  created_at: Date;
  status: string;
}

// types for function 'array_agg'
export interface SqlFunctionArrayAggInput {
  0: string | number;
}
export interface SqlFunctionArrayAggInputByName {
  any_column: SqlFunctionArrayAggInput['0'];
}
export type SqlFunctionArrayAggOutput = string[] | number[] | null;

// types for function 'backfill_async_task_predict_station_congestion_cvp'
export interface SqlFunctionBackfillAsyncTaskPredictStationCongestionCvpInput {
  0: number | null;
}
export interface SqlFunctionBackfillAsyncTaskPredictStationCongestionCvpInputByName {
  in_limit: SqlFunctionBackfillAsyncTaskPredictStationCongestionCvpInput['0'];
}
export type SqlFunctionBackfillAsyncTaskPredictStationCongestionCvpOutput = number;

// types for function 'backfill_carriage_cargo_cvp'
export interface SqlFunctionBackfillCarriageCargoCvpInput {
  0: number | null;
}
export interface SqlFunctionBackfillCarriageCargoCvpInputByName {
  in_limit: SqlFunctionBackfillCarriageCargoCvpInput['0'];
}
export type SqlFunctionBackfillCarriageCargoCvpOutput = number;

// types for function 'backfill_invoice_cvp'
export interface SqlFunctionBackfillInvoiceCvpInput {
  0: number | null;
}
export interface SqlFunctionBackfillInvoiceCvpInputByName {
  in_limit: SqlFunctionBackfillInvoiceCvpInput['0'];
}
export type SqlFunctionBackfillInvoiceCvpOutput = number;

// types for function 'backfill_locomotive_cvp'
export interface SqlFunctionBackfillLocomotiveCvpInput {
  0: number | null;
}
export interface SqlFunctionBackfillLocomotiveCvpInputByName {
  in_limit: SqlFunctionBackfillLocomotiveCvpInput['0'];
}
export type SqlFunctionBackfillLocomotiveCvpOutput = number;

// types for function 'backfill_train_cvp'
export interface SqlFunctionBackfillTrainCvpInput {
  0: number | null;
}
export interface SqlFunctionBackfillTrainCvpInputByName {
  in_limit: SqlFunctionBackfillTrainCvpInput['0'];
}
export type SqlFunctionBackfillTrainCvpOutput = number;

// types for function 'backfill_train_engineer_cvp'
export interface SqlFunctionBackfillTrainEngineerCvpInput {
  0: number | null;
}
export interface SqlFunctionBackfillTrainEngineerCvpInputByName {
  in_limit: SqlFunctionBackfillTrainEngineerCvpInput['0'];
}
export type SqlFunctionBackfillTrainEngineerCvpOutput = number;

// types for function 'backfill_train_station_cvp'
export interface SqlFunctionBackfillTrainStationCvpInput {
  0: number | null;
}
export interface SqlFunctionBackfillTrainStationCvpInputByName {
  in_limit: SqlFunctionBackfillTrainStationCvpInput['0'];
}
export type SqlFunctionBackfillTrainStationCvpOutput = number;

// types for function 'json_build_object'
export interface SqlFunctionJsonBuildObjectInput {
  0: string;
}
export interface SqlFunctionJsonBuildObjectInputByName {
  expr: SqlFunctionJsonBuildObjectInput['0'];
}
export type SqlFunctionJsonBuildObjectOutput = Record<string, any> | null;

// types for function 'unnest'
export interface SqlFunctionUnnestInput {
  0: string[] | number[];
}
export interface SqlFunctionUnnestInputByName {
  array: SqlFunctionUnnestInput['0'];
}
export type SqlFunctionUnnestOutput = string | number | Date | Buffer | Record<string, any> | null | undefined;

// types for function 'upsert_async_task_predict_station_congestion'
export interface SqlFunctionUpsertAsyncTaskPredictStationCongestionInput {
  0: string | null;
  1: number | null;
  2: number | null;
}
export interface SqlFunctionUpsertAsyncTaskPredictStationCongestionInputByName {
  in_status: SqlFunctionUpsertAsyncTaskPredictStationCongestionInput['0'];
  in_station_id: SqlFunctionUpsertAsyncTaskPredictStationCongestionInput['1'];
  in_train_located_event_id: SqlFunctionUpsertAsyncTaskPredictStationCongestionInput['2'];
}
export type SqlFunctionUpsertAsyncTaskPredictStationCongestionOutput = {
  id: number;
  uuid: string;
  created_at: Date;
  effective_at: Date;
  updated_at: Date;
};

// types for function 'upsert_carriage'
export interface SqlFunctionUpsertCarriageInput {
  0: string | null;
  1: string | null;
  2: number | null;
}
export interface SqlFunctionUpsertCarriageInputByName {
  in_cin: SqlFunctionUpsertCarriageInput['0'];
  in_carries: SqlFunctionUpsertCarriageInput['1'];
  in_capacity: SqlFunctionUpsertCarriageInput['2'];
}
export type SqlFunctionUpsertCarriageOutput = {
  id: number;
  uuid: string;
  created_at: Date;
};

// types for function 'upsert_carriage_cargo'
export interface SqlFunctionUpsertCarriageCargoInput {
  0: string | null;
  1: number | null;
  2: number | null;
  3: string | null;
}
export interface SqlFunctionUpsertCarriageCargoInputByName {
  in_itinerary_uuid: SqlFunctionUpsertCarriageCargoInput['0'];
  in_carriage_id: SqlFunctionUpsertCarriageCargoInput['1'];
  in_slot: SqlFunctionUpsertCarriageCargoInput['2'];
  in_cargo_exid: SqlFunctionUpsertCarriageCargoInput['3'];
}
export type SqlFunctionUpsertCarriageCargoOutput = {
  id: number;
  uuid: string;
  created_at: Date;
  effective_at: Date;
  updated_at: Date;
};

// types for function 'upsert_certificate'
export interface SqlFunctionUpsertCertificateInput {
  0: string | null;
  1: string | null;
}
export interface SqlFunctionUpsertCertificateInputByName {
  in_type: SqlFunctionUpsertCertificateInput['0'];
  in_industry_id: SqlFunctionUpsertCertificateInput['1'];
}
export type SqlFunctionUpsertCertificateOutput = {
  id: number;
  uuid: string;
  created_at: Date;
};

// types for function 'upsert_geocode'
export interface SqlFunctionUpsertGeocodeInput {
  0: number | null;
  1: number | null;
}
export interface SqlFunctionUpsertGeocodeInputByName {
  in_latitude: SqlFunctionUpsertGeocodeInput['0'];
  in_longitude: SqlFunctionUpsertGeocodeInput['1'];
}
export type SqlFunctionUpsertGeocodeOutput = {
  id: number;
  uuid: string;
  created_at: Date;
};

// types for function 'upsert_invoice'
export interface SqlFunctionUpsertInvoiceInput {
  0: string | null;
  1: number[] | null;
  2: number | null;
  3: string | null;
}
export interface SqlFunctionUpsertInvoiceInputByName {
  in_external_id: SqlFunctionUpsertInvoiceInput['0'];
  in_item_ids: SqlFunctionUpsertInvoiceInput['1'];
  in_total_price_id: SqlFunctionUpsertInvoiceInput['2'];
  in_status: SqlFunctionUpsertInvoiceInput['3'];
}
export type SqlFunctionUpsertInvoiceOutput = {
  id: number;
  uuid: string;
  created_at: Date;
  effective_at: Date;
  updated_at: Date;
};

// types for function 'upsert_invoice_line_item'
export interface SqlFunctionUpsertInvoiceLineItemInput {
  0: number | null;
  1: string | null;
  2: string | null;
}
export interface SqlFunctionUpsertInvoiceLineItemInputByName {
  in_price_id: SqlFunctionUpsertInvoiceLineItemInput['0'];
  in_title: SqlFunctionUpsertInvoiceLineItemInput['1'];
  in_explanation: SqlFunctionUpsertInvoiceLineItemInput['2'];
}
export type SqlFunctionUpsertInvoiceLineItemOutput = {
  id: number;
  uuid: string;
  created_at: Date;
};

// types for function 'upsert_locomotive'
export interface SqlFunctionUpsertLocomotiveInput {
  0: string | null;
  1: string | null;
  2: number | null;
  3: number | null;
}
export interface SqlFunctionUpsertLocomotiveInputByName {
  in_ein: SqlFunctionUpsertLocomotiveInput['0'];
  in_fuel: SqlFunctionUpsertLocomotiveInput['1'];
  in_capacity: SqlFunctionUpsertLocomotiveInput['2'];
  in_milage: SqlFunctionUpsertLocomotiveInput['3'];
}
export type SqlFunctionUpsertLocomotiveOutput = {
  id: number;
  uuid: string;
  created_at: Date;
  effective_at: Date;
  updated_at: Date;
};

// types for function 'upsert_price'
export interface SqlFunctionUpsertPriceInput {
  0: number | null;
  1: string | null;
}
export interface SqlFunctionUpsertPriceInputByName {
  in_amount: SqlFunctionUpsertPriceInput['0'];
  in_currency: SqlFunctionUpsertPriceInput['1'];
}
export type SqlFunctionUpsertPriceOutput = {
  id: number;
  uuid: string;
  created_at: Date;
};

// types for function 'upsert_train'
export interface SqlFunctionUpsertTrainInput {
  0: number | null;
  1: string | null;
  2: number[] | null;
  3: number[] | null;
  4: number[] | null;
  5: number | null;
  6: string | null;
}
export interface SqlFunctionUpsertTrainInputByName {
  in_home_station_geocode_id: SqlFunctionUpsertTrainInput['0'];
  in_combination_id: SqlFunctionUpsertTrainInput['1'];
  in_locomotive_ids: SqlFunctionUpsertTrainInput['2'];
  in_carriage_ids: SqlFunctionUpsertTrainInput['3'];
  in_engineer_ids: SqlFunctionUpsertTrainInput['4'];
  in_lead_engineer_id: SqlFunctionUpsertTrainInput['5'];
  in_status: SqlFunctionUpsertTrainInput['6'];
}
export type SqlFunctionUpsertTrainOutput = {
  id: number;
  uuid: string;
  created_at: Date;
  effective_at: Date;
  updated_at: Date;
};

// types for function 'upsert_train_engineer'
export interface SqlFunctionUpsertTrainEngineerInput {
  0: string | null;
  1: number[] | null;
  2: string[] | null;
  3: string | null;
}
export interface SqlFunctionUpsertTrainEngineerInputByName {
  in_social_security_number_hash: SqlFunctionUpsertTrainEngineerInput['0'];
  in_certificate_ids: SqlFunctionUpsertTrainEngineerInput['1'];
  in_license_uuids: SqlFunctionUpsertTrainEngineerInput['2'];
  in_name: SqlFunctionUpsertTrainEngineerInput['3'];
}
export type SqlFunctionUpsertTrainEngineerOutput = {
  id: number;
  uuid: string;
  created_at: Date;
  effective_at: Date;
  updated_at: Date;
};

// types for function 'upsert_train_station'
export interface SqlFunctionUpsertTrainStationInput {
  0: number | null;
  1: string | null;
}
export interface SqlFunctionUpsertTrainStationInputByName {
  in_geocode_id: SqlFunctionUpsertTrainStationInput['0'];
  in_name: SqlFunctionUpsertTrainStationInput['1'];
}
export type SqlFunctionUpsertTrainStationOutput = {
  id: number;
  uuid: string;
  created_at: Date;
  effective_at: Date;
  updated_at: Date;
};

// types for view 'view_async_task_predict_station_congestion_current'
export interface SqlViewViewAsyncTaskPredictStationCongestionCurrent {
  id: SqlTableAsyncTaskPredictStationCongestion['id'];
  uuid: SqlTableAsyncTaskPredictStationCongestion['uuid'];
  station_id: SqlTableAsyncTaskPredictStationCongestion['station_id'];
  train_located_event_id: SqlTableAsyncTaskPredictStationCongestion['train_located_event_id'];
  status: SqlTableAsyncTaskPredictStationCongestionVersion['status'];
  created_at: SqlTableAsyncTaskPredictStationCongestion['created_at'];
  effective_at: SqlTableAsyncTaskPredictStationCongestionVersion['effective_at'];
  updated_at: SqlTableAsyncTaskPredictStationCongestionVersion['created_at'];
}

// types for view 'view_async_task_predict_station_congestion_hydrated'
export interface SqlViewViewAsyncTaskPredictStationCongestionHydrated {
  id: SqlViewViewAsyncTaskPredictStationCongestionCurrent['id'];
  uuid: SqlViewViewAsyncTaskPredictStationCongestionCurrent['uuid'];
  created_at: SqlViewViewAsyncTaskPredictStationCongestionCurrent['created_at'];
  updated_at: SqlViewViewAsyncTaskPredictStationCongestionCurrent['updated_at'];
  status: SqlViewViewAsyncTaskPredictStationCongestionCurrent['status'];
  station_uuid: SqlViewViewTrainStationCurrent['uuid'];
  train_located_event_uuid: SqlViewViewTrainCurrent['uuid'];
}

// types for view 'view_carriage_cargo_current'
export interface SqlViewViewCarriageCargoCurrent {
  id: SqlTableCarriageCargo['id'];
  uuid: SqlTableCarriageCargo['uuid'];
  itinerary_uuid: SqlTableCarriageCargo['itinerary_uuid'];
  carriage_id: SqlTableCarriageCargo['carriage_id'];
  slot: SqlTableCarriageCargo['slot'];
  cargo_exid: SqlTableCarriageCargoVersion['cargo_exid'];
  created_at: SqlTableCarriageCargo['created_at'];
  effective_at: SqlTableCarriageCargoVersion['effective_at'];
  updated_at: SqlTableCarriageCargoVersion['created_at'];
}

// types for view 'view_carriage_cargo_hydrated'
export interface SqlViewViewCarriageCargoHydrated {
  id: SqlViewViewCarriageCargoCurrent['id'];
  uuid: SqlViewViewCarriageCargoCurrent['uuid'];
  itinerary_uuid: SqlViewViewCarriageCargoCurrent['itinerary_uuid'];
  carriage_uuid: SqlTableCarriage['uuid'];
  slot: SqlViewViewCarriageCargoCurrent['slot'];
  cargo_exid: SqlViewViewCarriageCargoCurrent['cargo_exid'];
}

// types for view 'view_carriage_hydrated'
export interface SqlViewViewCarriageHydrated {
  id: SqlTableCarriage['id'];
  uuid: SqlTableCarriage['uuid'];
  cin: SqlTableCarriage['cin'];
  carries: SqlTableCarriage['carries'];
  capacity: SqlTableCarriage['capacity'];
}

// types for view 'view_certificate_hydrated'
export interface SqlViewViewCertificateHydrated {
  id: SqlTableCertificate['id'];
  type: SqlTableCertificate['type'];
  industry_id: SqlTableCertificate['industry_id'];
}

// types for view 'view_geocode_hydrated'
export interface SqlViewViewGeocodeHydrated {
  id: SqlTableGeocode['id'];
  latitude: SqlTableGeocode['latitude'];
  longitude: SqlTableGeocode['longitude'];
}

// types for view 'view_invoice_current'
export interface SqlViewViewInvoiceCurrent {
  id: SqlTableInvoice['id'];
  uuid: SqlTableInvoice['uuid'];
  external_id: SqlTableInvoice['external_id'];
  item_ids: SqlFunctionArrayAggOutput;
  total_price_id: SqlTableInvoiceVersion['total_price_id'];
  status: SqlTableInvoiceVersion['status'];
  created_at: SqlTableInvoice['created_at'];
  effective_at: SqlTableInvoiceVersion['effective_at'];
  updated_at: SqlTableInvoiceVersion['created_at'];
}

// types for view 'view_invoice_hydrated'
export interface SqlViewViewInvoiceHydrated {
  id: SqlViewViewInvoiceCurrent['id'];
  uuid: SqlViewViewInvoiceCurrent['uuid'];
  external_id: SqlViewViewInvoiceCurrent['external_id'];
  items: SqlFunctionJsonBuildObjectOutput;
  total_price: SqlFunctionJsonBuildObjectOutput;
  status: SqlViewViewInvoiceCurrent['status'];
}

// types for view 'view_invoice_line_item_hydrated'
export interface SqlViewViewInvoiceLineItemHydrated {
  id: SqlTableInvoiceLineItem['id'];
  price: SqlFunctionJsonBuildObjectOutput;
  title: SqlTableInvoiceLineItem['title'];
  explanation: SqlTableInvoiceLineItem['explanation'];
}

// types for view 'view_locomotive_current'
export interface SqlViewViewLocomotiveCurrent {
  id: SqlTableLocomotive['id'];
  uuid: SqlTableLocomotive['uuid'];
  ein: SqlTableLocomotive['ein'];
  fuel: SqlTableLocomotive['fuel'];
  capacity: SqlTableLocomotive['capacity'];
  milage: SqlTableLocomotiveVersion['milage'];
  created_at: SqlTableLocomotive['created_at'];
  effective_at: SqlTableLocomotiveVersion['effective_at'];
  updated_at: SqlTableLocomotiveVersion['created_at'];
}

// types for view 'view_locomotive_hydrated'
export interface SqlViewViewLocomotiveHydrated {
  id: SqlViewViewLocomotiveCurrent['id'];
  uuid: SqlViewViewLocomotiveCurrent['uuid'];
  created_at: SqlViewViewLocomotiveCurrent['created_at'];
  effective_at: SqlViewViewLocomotiveCurrent['effective_at'];
  updated_at: SqlViewViewLocomotiveCurrent['updated_at'];
  ein: SqlViewViewLocomotiveCurrent['ein'];
  fuel: SqlViewViewLocomotiveCurrent['fuel'];
  capacity: SqlViewViewLocomotiveCurrent['capacity'];
  milage: SqlViewViewLocomotiveCurrent['milage'];
}

// types for view 'view_price_hydrated'
export interface SqlViewViewPriceHydrated {
  id: SqlTablePrice['id'];
  amount: SqlTablePrice['amount'];
  currency: SqlTablePrice['currency'];
}

// types for view 'view_train_current'
export interface SqlViewViewTrainCurrent {
  id: SqlTableTrain['id'];
  uuid: SqlTableTrain['uuid'];
  home_station_geocode_id: SqlTableTrain['home_station_geocode_id'];
  combination_id: SqlTableTrain['combination_id'];
  locomotive_ids: SqlFunctionArrayAggOutput;
  carriage_ids: SqlFunctionArrayAggOutput;
  engineer_ids: SqlFunctionArrayAggOutput;
  lead_engineer_id: SqlTableTrain['lead_engineer_id'];
  status: SqlTableTrainVersion['status'];
  created_at: SqlTableTrain['created_at'];
  effective_at: SqlTableTrainVersion['effective_at'];
  updated_at: SqlTableTrainVersion['created_at'];
}

// types for view 'view_train_engineer_current'
export interface SqlViewViewTrainEngineerCurrent {
  id: SqlTableTrainEngineer['id'];
  uuid: SqlTableTrainEngineer['uuid'];
  social_security_number_hash: SqlTableTrainEngineer['social_security_number_hash'];
  certificate_ids: SqlFunctionArrayAggOutput;
  license_uuids: SqlFunctionArrayAggOutput;
  name: SqlTableTrainEngineerVersion['name'];
  created_at: SqlTableTrainEngineer['created_at'];
  effective_at: SqlTableTrainEngineerVersion['effective_at'];
  updated_at: SqlTableTrainEngineerVersion['created_at'];
}

// types for view 'view_train_engineer_hydrated'
export interface SqlViewViewTrainEngineerHydrated {
  id: SqlViewViewTrainEngineerCurrent['id'];
  uuid: SqlViewViewTrainEngineerCurrent['uuid'];
  social_security_number_hash: SqlViewViewTrainEngineerCurrent['social_security_number_hash'];
  certificates: SqlFunctionJsonBuildObjectOutput;
  license_uuids: SqlViewViewTrainEngineerCurrent['license_uuids'];
  name: SqlViewViewTrainEngineerCurrent['name'];
}

// types for view 'view_train_hydrated'
export interface SqlViewViewTrainHydrated {
  id: SqlViewViewTrainCurrent['id'];
  uuid: SqlViewViewTrainCurrent['uuid'];
  home_station_geocode: SqlFunctionJsonBuildObjectOutput;
  combination_id: SqlViewViewTrainCurrent['combination_id'];
  locomotive_uuids: SqlFunctionArrayAggOutput;
  carriage_uuids: SqlFunctionArrayAggOutput;
  engineer_uuids: SqlFunctionArrayAggOutput;
  lead_engineer_uuid: SqlViewViewTrainEngineerCurrent['uuid'];
  status: SqlViewViewTrainCurrent['status'];
}

// types for view 'view_train_station_current'
export interface SqlViewViewTrainStationCurrent {
  id: SqlTableTrainStation['id'];
  uuid: SqlTableTrainStation['uuid'];
  geocode_id: SqlTableTrainStation['geocode_id'];
  name: SqlTableTrainStationVersion['name'];
  created_at: SqlTableTrainStation['created_at'];
  effective_at: SqlTableTrainStationVersion['effective_at'];
  updated_at: SqlTableTrainStationVersion['created_at'];
}

// types for view 'view_train_station_hydrated'
export interface SqlViewViewTrainStationHydrated {
  id: SqlViewViewTrainStationCurrent['id'];
  uuid: SqlViewViewTrainStationCurrent['uuid'];
  geocode: SqlFunctionJsonBuildObjectOutput;
  name: SqlViewViewTrainStationCurrent['name'];
}

// types for query 'find_async_task_predict_station_congestion_by_id'
export interface SqlQueryFindAsyncTaskPredictStationCongestionByIdInput {
  id: SqlViewViewAsyncTaskPredictStationCongestionHydrated['id'];
}
export interface SqlQueryFindAsyncTaskPredictStationCongestionByIdOutput {
  id: SqlViewViewAsyncTaskPredictStationCongestionHydrated['id'];
  uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['uuid'];
  created_at: SqlViewViewAsyncTaskPredictStationCongestionHydrated['created_at'];
  updated_at: SqlViewViewAsyncTaskPredictStationCongestionHydrated['updated_at'];
  status: SqlViewViewAsyncTaskPredictStationCongestionHydrated['status'];
  station_uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['station_uuid'];
  train_located_event_uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['train_located_event_uuid'];
}

// types for query 'find_async_task_predict_station_congestion_by_unique'
export interface SqlQueryFindAsyncTaskPredictStationCongestionByUniqueInput {
  stationUuid: SqlTableTrainStation['uuid'];
  trainLocatedEventUuid: SqlTableTrain['uuid'];
}
export interface SqlQueryFindAsyncTaskPredictStationCongestionByUniqueOutput {
  id: SqlViewViewAsyncTaskPredictStationCongestionHydrated['id'];
  uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['uuid'];
  created_at: SqlViewViewAsyncTaskPredictStationCongestionHydrated['created_at'];
  updated_at: SqlViewViewAsyncTaskPredictStationCongestionHydrated['updated_at'];
  status: SqlViewViewAsyncTaskPredictStationCongestionHydrated['status'];
  station_uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['station_uuid'];
  train_located_event_uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['train_located_event_uuid'];
}

// types for query 'find_async_task_predict_station_congestion_by_uuid'
export interface SqlQueryFindAsyncTaskPredictStationCongestionByUuidInput {
  uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['uuid'];
}
export interface SqlQueryFindAsyncTaskPredictStationCongestionByUuidOutput {
  id: SqlViewViewAsyncTaskPredictStationCongestionHydrated['id'];
  uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['uuid'];
  created_at: SqlViewViewAsyncTaskPredictStationCongestionHydrated['created_at'];
  updated_at: SqlViewViewAsyncTaskPredictStationCongestionHydrated['updated_at'];
  status: SqlViewViewAsyncTaskPredictStationCongestionHydrated['status'];
  station_uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['station_uuid'];
  train_located_event_uuid: SqlViewViewAsyncTaskPredictStationCongestionHydrated['train_located_event_uuid'];
}

// types for query 'find_carriage_by_id'
export interface SqlQueryFindCarriageByIdInput {
  id: SqlViewViewCarriageHydrated['id'];
}
export interface SqlQueryFindCarriageByIdOutput {
  id: SqlViewViewCarriageHydrated['id'];
  uuid: SqlViewViewCarriageHydrated['uuid'];
  cin: SqlViewViewCarriageHydrated['cin'];
  carries: SqlViewViewCarriageHydrated['carries'];
  capacity: SqlViewViewCarriageHydrated['capacity'];
}

// types for query 'find_carriage_by_unique'
export interface SqlQueryFindCarriageByUniqueInput {
  cin: SqlViewViewCarriageHydrated['cin'];
}
export interface SqlQueryFindCarriageByUniqueOutput {
  id: SqlViewViewCarriageHydrated['id'];
  uuid: SqlViewViewCarriageHydrated['uuid'];
  cin: SqlViewViewCarriageHydrated['cin'];
  carries: SqlViewViewCarriageHydrated['carries'];
  capacity: SqlViewViewCarriageHydrated['capacity'];
}

// types for query 'find_carriage_by_uuid'
export interface SqlQueryFindCarriageByUuidInput {
  uuid: SqlViewViewCarriageHydrated['uuid'];
}
export interface SqlQueryFindCarriageByUuidOutput {
  id: SqlViewViewCarriageHydrated['id'];
  uuid: SqlViewViewCarriageHydrated['uuid'];
  cin: SqlViewViewCarriageHydrated['cin'];
  carries: SqlViewViewCarriageHydrated['carries'];
  capacity: SqlViewViewCarriageHydrated['capacity'];
}

// types for query 'find_carriage_cargo_by_id'
export interface SqlQueryFindCarriageCargoByIdInput {
  id: SqlViewViewCarriageCargoHydrated['id'];
}
export interface SqlQueryFindCarriageCargoByIdOutput {
  id: SqlViewViewCarriageCargoHydrated['id'];
  uuid: SqlViewViewCarriageCargoHydrated['uuid'];
  itinerary_uuid: SqlViewViewCarriageCargoHydrated['itinerary_uuid'];
  carriage_uuid: SqlViewViewCarriageCargoHydrated['carriage_uuid'];
  slot: SqlViewViewCarriageCargoHydrated['slot'];
  cargo_exid: SqlViewViewCarriageCargoHydrated['cargo_exid'];
}

// types for query 'find_carriage_cargo_by_unique'
export interface SqlQueryFindCarriageCargoByUniqueInput {
  itineraryUuid: SqlViewViewCarriageCargoHydrated['itinerary_uuid'];
  carriageUuid: SqlTableCarriage['uuid'];
  slot: SqlViewViewCarriageCargoHydrated['slot'];
}
export interface SqlQueryFindCarriageCargoByUniqueOutput {
  id: SqlViewViewCarriageCargoHydrated['id'];
  uuid: SqlViewViewCarriageCargoHydrated['uuid'];
  itinerary_uuid: SqlViewViewCarriageCargoHydrated['itinerary_uuid'];
  carriage_uuid: SqlViewViewCarriageCargoHydrated['carriage_uuid'];
  slot: SqlViewViewCarriageCargoHydrated['slot'];
  cargo_exid: SqlViewViewCarriageCargoHydrated['cargo_exid'];
}

// types for query 'find_carriage_cargo_by_uuid'
export interface SqlQueryFindCarriageCargoByUuidInput {
  uuid: SqlViewViewCarriageCargoHydrated['uuid'];
}
export interface SqlQueryFindCarriageCargoByUuidOutput {
  id: SqlViewViewCarriageCargoHydrated['id'];
  uuid: SqlViewViewCarriageCargoHydrated['uuid'];
  itinerary_uuid: SqlViewViewCarriageCargoHydrated['itinerary_uuid'];
  carriage_uuid: SqlViewViewCarriageCargoHydrated['carriage_uuid'];
  slot: SqlViewViewCarriageCargoHydrated['slot'];
  cargo_exid: SqlViewViewCarriageCargoHydrated['cargo_exid'];
}

// types for query 'find_certificate_by_id'
export interface SqlQueryFindCertificateByIdInput {
  id: SqlViewViewCertificateHydrated['id'];
}
export interface SqlQueryFindCertificateByIdOutput {
  id: SqlViewViewCertificateHydrated['id'];
  type: SqlViewViewCertificateHydrated['type'];
  industry_id: SqlViewViewCertificateHydrated['industry_id'];
}

// types for query 'find_certificate_by_unique'
export interface SqlQueryFindCertificateByUniqueInput {
  type: SqlViewViewCertificateHydrated['type'];
  industryId: SqlViewViewCertificateHydrated['industry_id'];
}
export interface SqlQueryFindCertificateByUniqueOutput {
  id: SqlViewViewCertificateHydrated['id'];
  type: SqlViewViewCertificateHydrated['type'];
  industry_id: SqlViewViewCertificateHydrated['industry_id'];
}

// types for query 'find_geocode_by_id'
export interface SqlQueryFindGeocodeByIdInput {
  id: SqlViewViewGeocodeHydrated['id'];
}
export interface SqlQueryFindGeocodeByIdOutput {
  id: SqlViewViewGeocodeHydrated['id'];
  latitude: SqlViewViewGeocodeHydrated['latitude'];
  longitude: SqlViewViewGeocodeHydrated['longitude'];
}

// types for query 'find_geocode_by_unique'
export interface SqlQueryFindGeocodeByUniqueInput {
  latitude: SqlViewViewGeocodeHydrated['latitude'];
  longitude: SqlViewViewGeocodeHydrated['longitude'];
}
export interface SqlQueryFindGeocodeByUniqueOutput {
  id: SqlViewViewGeocodeHydrated['id'];
  latitude: SqlViewViewGeocodeHydrated['latitude'];
  longitude: SqlViewViewGeocodeHydrated['longitude'];
}

// types for query 'find_invoice_by_id'
export interface SqlQueryFindInvoiceByIdInput {
  id: SqlViewViewInvoiceHydrated['id'];
}
export interface SqlQueryFindInvoiceByIdOutput {
  id: SqlViewViewInvoiceHydrated['id'];
  uuid: SqlViewViewInvoiceHydrated['uuid'];
  external_id: SqlViewViewInvoiceHydrated['external_id'];
  items: SqlViewViewInvoiceHydrated['items'];
  total_price: SqlViewViewInvoiceHydrated['total_price'];
  status: SqlViewViewInvoiceHydrated['status'];
}

// types for query 'find_invoice_by_unique'
export interface SqlQueryFindInvoiceByUniqueInput {
  externalId: SqlViewViewInvoiceHydrated['external_id'];
}
export interface SqlQueryFindInvoiceByUniqueOutput {
  id: SqlViewViewInvoiceHydrated['id'];
  uuid: SqlViewViewInvoiceHydrated['uuid'];
  external_id: SqlViewViewInvoiceHydrated['external_id'];
  items: SqlViewViewInvoiceHydrated['items'];
  total_price: SqlViewViewInvoiceHydrated['total_price'];
  status: SqlViewViewInvoiceHydrated['status'];
}

// types for query 'find_invoice_by_uuid'
export interface SqlQueryFindInvoiceByUuidInput {
  uuid: SqlViewViewInvoiceHydrated['uuid'];
}
export interface SqlQueryFindInvoiceByUuidOutput {
  id: SqlViewViewInvoiceHydrated['id'];
  uuid: SqlViewViewInvoiceHydrated['uuid'];
  external_id: SqlViewViewInvoiceHydrated['external_id'];
  items: SqlViewViewInvoiceHydrated['items'];
  total_price: SqlViewViewInvoiceHydrated['total_price'];
  status: SqlViewViewInvoiceHydrated['status'];
}

// types for query 'find_invoice_line_item_by_id'
export interface SqlQueryFindInvoiceLineItemByIdInput {
  id: SqlViewViewInvoiceLineItemHydrated['id'];
}
export interface SqlQueryFindInvoiceLineItemByIdOutput {
  id: SqlViewViewInvoiceLineItemHydrated['id'];
  price: SqlViewViewInvoiceLineItemHydrated['price'];
  title: SqlViewViewInvoiceLineItemHydrated['title'];
  explanation: SqlViewViewInvoiceLineItemHydrated['explanation'];
}

// types for query 'find_invoice_line_item_by_unique'
export interface SqlQueryFindInvoiceLineItemByUniqueInput {
  priceId: SqlTableInvoiceLineItem['price_id'];
  title: SqlViewViewInvoiceLineItemHydrated['title'];
  explanation: SqlViewViewInvoiceLineItemHydrated['explanation'];
}
export interface SqlQueryFindInvoiceLineItemByUniqueOutput {
  id: SqlViewViewInvoiceLineItemHydrated['id'];
  price: SqlViewViewInvoiceLineItemHydrated['price'];
  title: SqlViewViewInvoiceLineItemHydrated['title'];
  explanation: SqlViewViewInvoiceLineItemHydrated['explanation'];
}

// types for query 'find_locomotive_by_id'
export interface SqlQueryFindLocomotiveByIdInput {
  id: SqlViewViewLocomotiveHydrated['id'];
}
export interface SqlQueryFindLocomotiveByIdOutput {
  id: SqlViewViewLocomotiveHydrated['id'];
  uuid: SqlViewViewLocomotiveHydrated['uuid'];
  created_at: SqlViewViewLocomotiveHydrated['created_at'];
  effective_at: SqlViewViewLocomotiveHydrated['effective_at'];
  updated_at: SqlViewViewLocomotiveHydrated['updated_at'];
  ein: SqlViewViewLocomotiveHydrated['ein'];
  fuel: SqlViewViewLocomotiveHydrated['fuel'];
  capacity: SqlViewViewLocomotiveHydrated['capacity'];
  milage: SqlViewViewLocomotiveHydrated['milage'];
}

// types for query 'find_locomotive_by_unique'
export interface SqlQueryFindLocomotiveByUniqueInput {
  ein: SqlViewViewLocomotiveHydrated['ein'];
}
export interface SqlQueryFindLocomotiveByUniqueOutput {
  id: SqlViewViewLocomotiveHydrated['id'];
  uuid: SqlViewViewLocomotiveHydrated['uuid'];
  created_at: SqlViewViewLocomotiveHydrated['created_at'];
  effective_at: SqlViewViewLocomotiveHydrated['effective_at'];
  updated_at: SqlViewViewLocomotiveHydrated['updated_at'];
  ein: SqlViewViewLocomotiveHydrated['ein'];
  fuel: SqlViewViewLocomotiveHydrated['fuel'];
  capacity: SqlViewViewLocomotiveHydrated['capacity'];
  milage: SqlViewViewLocomotiveHydrated['milage'];
}

// types for query 'find_locomotive_by_uuid'
export interface SqlQueryFindLocomotiveByUuidInput {
  uuid: SqlViewViewLocomotiveHydrated['uuid'];
}
export interface SqlQueryFindLocomotiveByUuidOutput {
  id: SqlViewViewLocomotiveHydrated['id'];
  uuid: SqlViewViewLocomotiveHydrated['uuid'];
  created_at: SqlViewViewLocomotiveHydrated['created_at'];
  effective_at: SqlViewViewLocomotiveHydrated['effective_at'];
  updated_at: SqlViewViewLocomotiveHydrated['updated_at'];
  ein: SqlViewViewLocomotiveHydrated['ein'];
  fuel: SqlViewViewLocomotiveHydrated['fuel'];
  capacity: SqlViewViewLocomotiveHydrated['capacity'];
  milage: SqlViewViewLocomotiveHydrated['milage'];
}

// types for query 'find_price_by_id'
export interface SqlQueryFindPriceByIdInput {
  id: SqlViewViewPriceHydrated['id'];
}
export interface SqlQueryFindPriceByIdOutput {
  id: SqlViewViewPriceHydrated['id'];
  amount: SqlViewViewPriceHydrated['amount'];
  currency: SqlViewViewPriceHydrated['currency'];
}

// types for query 'find_price_by_unique'
export interface SqlQueryFindPriceByUniqueInput {
  amount: SqlViewViewPriceHydrated['amount'];
  currency: SqlViewViewPriceHydrated['currency'];
}
export interface SqlQueryFindPriceByUniqueOutput {
  id: SqlViewViewPriceHydrated['id'];
  amount: SqlViewViewPriceHydrated['amount'];
  currency: SqlViewViewPriceHydrated['currency'];
}

// types for query 'find_train_by_id'
export interface SqlQueryFindTrainByIdInput {
  id: SqlViewViewTrainHydrated['id'];
}
export interface SqlQueryFindTrainByIdOutput {
  id: SqlViewViewTrainHydrated['id'];
  uuid: SqlViewViewTrainHydrated['uuid'];
  home_station_geocode: SqlViewViewTrainHydrated['home_station_geocode'];
  combination_id: SqlViewViewTrainHydrated['combination_id'];
  locomotive_uuids: SqlViewViewTrainHydrated['locomotive_uuids'];
  carriage_uuids: SqlViewViewTrainHydrated['carriage_uuids'];
  engineer_uuids: SqlViewViewTrainHydrated['engineer_uuids'];
  lead_engineer_uuid: SqlViewViewTrainHydrated['lead_engineer_uuid'];
  status: SqlViewViewTrainHydrated['status'];
}

// types for query 'find_train_by_unique'
export interface SqlQueryFindTrainByUniqueInput {
  combinationId: SqlViewViewTrainHydrated['combination_id'];
}
export interface SqlQueryFindTrainByUniqueOutput {
  id: SqlViewViewTrainHydrated['id'];
  uuid: SqlViewViewTrainHydrated['uuid'];
  home_station_geocode: SqlViewViewTrainHydrated['home_station_geocode'];
  combination_id: SqlViewViewTrainHydrated['combination_id'];
  locomotive_uuids: SqlViewViewTrainHydrated['locomotive_uuids'];
  carriage_uuids: SqlViewViewTrainHydrated['carriage_uuids'];
  engineer_uuids: SqlViewViewTrainHydrated['engineer_uuids'];
  lead_engineer_uuid: SqlViewViewTrainHydrated['lead_engineer_uuid'];
  status: SqlViewViewTrainHydrated['status'];
}

// types for query 'find_train_by_uuid'
export interface SqlQueryFindTrainByUuidInput {
  uuid: SqlViewViewTrainHydrated['uuid'];
}
export interface SqlQueryFindTrainByUuidOutput {
  id: SqlViewViewTrainHydrated['id'];
  uuid: SqlViewViewTrainHydrated['uuid'];
  home_station_geocode: SqlViewViewTrainHydrated['home_station_geocode'];
  combination_id: SqlViewViewTrainHydrated['combination_id'];
  locomotive_uuids: SqlViewViewTrainHydrated['locomotive_uuids'];
  carriage_uuids: SqlViewViewTrainHydrated['carriage_uuids'];
  engineer_uuids: SqlViewViewTrainHydrated['engineer_uuids'];
  lead_engineer_uuid: SqlViewViewTrainHydrated['lead_engineer_uuid'];
  status: SqlViewViewTrainHydrated['status'];
}

// types for query 'find_train_engineer_by_id'
export interface SqlQueryFindTrainEngineerByIdInput {
  id: SqlViewViewTrainEngineerHydrated['id'];
}
export interface SqlQueryFindTrainEngineerByIdOutput {
  id: SqlViewViewTrainEngineerHydrated['id'];
  uuid: SqlViewViewTrainEngineerHydrated['uuid'];
  social_security_number_hash: SqlViewViewTrainEngineerHydrated['social_security_number_hash'];
  certificates: SqlViewViewTrainEngineerHydrated['certificates'];
  license_uuids: SqlViewViewTrainEngineerHydrated['license_uuids'];
  name: SqlViewViewTrainEngineerHydrated['name'];
}

// types for query 'find_train_engineer_by_unique'
export interface SqlQueryFindTrainEngineerByUniqueInput {
  socialSecurityNumberHash: SqlViewViewTrainEngineerHydrated['social_security_number_hash'];
}
export interface SqlQueryFindTrainEngineerByUniqueOutput {
  id: SqlViewViewTrainEngineerHydrated['id'];
  uuid: SqlViewViewTrainEngineerHydrated['uuid'];
  social_security_number_hash: SqlViewViewTrainEngineerHydrated['social_security_number_hash'];
  certificates: SqlViewViewTrainEngineerHydrated['certificates'];
  license_uuids: SqlViewViewTrainEngineerHydrated['license_uuids'];
  name: SqlViewViewTrainEngineerHydrated['name'];
}

// types for query 'find_train_engineer_by_uuid'
export interface SqlQueryFindTrainEngineerByUuidInput {
  uuid: SqlViewViewTrainEngineerHydrated['uuid'];
}
export interface SqlQueryFindTrainEngineerByUuidOutput {
  id: SqlViewViewTrainEngineerHydrated['id'];
  uuid: SqlViewViewTrainEngineerHydrated['uuid'];
  social_security_number_hash: SqlViewViewTrainEngineerHydrated['social_security_number_hash'];
  certificates: SqlViewViewTrainEngineerHydrated['certificates'];
  license_uuids: SqlViewViewTrainEngineerHydrated['license_uuids'];
  name: SqlViewViewTrainEngineerHydrated['name'];
}

// types for query 'find_train_station_by_id'
export interface SqlQueryFindTrainStationByIdInput {
  id: SqlViewViewTrainStationHydrated['id'];
}
export interface SqlQueryFindTrainStationByIdOutput {
  id: SqlViewViewTrainStationHydrated['id'];
  uuid: SqlViewViewTrainStationHydrated['uuid'];
  geocode: SqlViewViewTrainStationHydrated['geocode'];
  name: SqlViewViewTrainStationHydrated['name'];
}

// types for query 'find_train_station_by_unique'
export interface SqlQueryFindTrainStationByUniqueInput {
  geocodeId: SqlViewViewTrainStationCurrent['geocode_id'];
}
export interface SqlQueryFindTrainStationByUniqueOutput {
  id: SqlViewViewTrainStationHydrated['id'];
  uuid: SqlViewViewTrainStationHydrated['uuid'];
  geocode: SqlViewViewTrainStationHydrated['geocode'];
  name: SqlViewViewTrainStationHydrated['name'];
}

// types for query 'find_train_station_by_uuid'
export interface SqlQueryFindTrainStationByUuidInput {
  uuid: SqlViewViewTrainStationHydrated['uuid'];
}
export interface SqlQueryFindTrainStationByUuidOutput {
  id: SqlViewViewTrainStationHydrated['id'];
  uuid: SqlViewViewTrainStationHydrated['uuid'];
  geocode: SqlViewViewTrainStationHydrated['geocode'];
  name: SqlViewViewTrainStationHydrated['name'];
}

// types for query 'upsert_async_task_predict_station_congestion'
export interface SqlQueryUpsertAsyncTaskPredictStationCongestionInput {
  status: SqlFunctionUpsertAsyncTaskPredictStationCongestionInput['0'];
  stationUuid: SqlTableTrainStation['uuid'];
  trainLocatedEventUuid: SqlTableTrain['uuid'];
}
export interface SqlQueryUpsertAsyncTaskPredictStationCongestionOutput {
  id: SqlFunctionUpsertAsyncTaskPredictStationCongestionOutput['id'];
  uuid: SqlFunctionUpsertAsyncTaskPredictStationCongestionOutput['uuid'];
  created_at: SqlFunctionUpsertAsyncTaskPredictStationCongestionOutput['created_at'];
  updated_at: SqlFunctionUpsertAsyncTaskPredictStationCongestionOutput['updated_at'];
}

// types for query 'upsert_carriage'
export interface SqlQueryUpsertCarriageInput {
  cin: SqlFunctionUpsertCarriageInput['0'];
  carries: SqlFunctionUpsertCarriageInput['1'];
  capacity: SqlFunctionUpsertCarriageInput['2'];
}
export interface SqlQueryUpsertCarriageOutput {
  id: SqlFunctionUpsertCarriageOutput['id'];
  uuid: SqlFunctionUpsertCarriageOutput['uuid'];
}

// types for query 'upsert_carriage_cargo'
export interface SqlQueryUpsertCarriageCargoInput {
  itineraryUuid: SqlFunctionUpsertCarriageCargoInput['0'];
  carriageUuid: SqlTableCarriage['uuid'];
  slot: SqlFunctionUpsertCarriageCargoInput['2'];
  cargoExid: SqlFunctionUpsertCarriageCargoInput['3'];
}
export interface SqlQueryUpsertCarriageCargoOutput {
  id: SqlFunctionUpsertCarriageCargoOutput['id'];
  uuid: SqlFunctionUpsertCarriageCargoOutput['uuid'];
}

// types for query 'upsert_certificate'
export interface SqlQueryUpsertCertificateInput {
  type: SqlFunctionUpsertCertificateInput['0'];
  industryId: SqlFunctionUpsertCertificateInput['1'];
}
export interface SqlQueryUpsertCertificateOutput {
  id: SqlFunctionUpsertCertificateOutput['id'];
}

// types for query 'upsert_geocode'
export interface SqlQueryUpsertGeocodeInput {
  latitude: SqlFunctionUpsertGeocodeInput['0'];
  longitude: SqlFunctionUpsertGeocodeInput['1'];
}
export interface SqlQueryUpsertGeocodeOutput {
  id: SqlFunctionUpsertGeocodeOutput['id'];
}

// types for query 'upsert_invoice'
export interface SqlQueryUpsertInvoiceInput {
  externalId: SqlFunctionUpsertInvoiceInput['0'];
  itemIds: SqlFunctionUpsertInvoiceInput['1'];
  totalPriceId: SqlFunctionUpsertInvoiceInput['2'];
  status: SqlFunctionUpsertInvoiceInput['3'];
}
export interface SqlQueryUpsertInvoiceOutput {
  id: SqlFunctionUpsertInvoiceOutput['id'];
  uuid: SqlFunctionUpsertInvoiceOutput['uuid'];
}

// types for query 'upsert_invoice_line_item'
export interface SqlQueryUpsertInvoiceLineItemInput {
  priceId: SqlFunctionUpsertInvoiceLineItemInput['0'];
  title: SqlFunctionUpsertInvoiceLineItemInput['1'];
  explanation: SqlFunctionUpsertInvoiceLineItemInput['2'];
}
export interface SqlQueryUpsertInvoiceLineItemOutput {
  id: SqlFunctionUpsertInvoiceLineItemOutput['id'];
}

// types for query 'upsert_locomotive'
export interface SqlQueryUpsertLocomotiveInput {
  ein: SqlFunctionUpsertLocomotiveInput['0'];
  fuel: SqlFunctionUpsertLocomotiveInput['1'];
  capacity: SqlFunctionUpsertLocomotiveInput['2'];
  milage: SqlFunctionUpsertLocomotiveInput['3'];
}
export interface SqlQueryUpsertLocomotiveOutput {
  id: SqlFunctionUpsertLocomotiveOutput['id'];
  uuid: SqlFunctionUpsertLocomotiveOutput['uuid'];
  created_at: SqlFunctionUpsertLocomotiveOutput['created_at'];
  effective_at: SqlFunctionUpsertLocomotiveOutput['effective_at'];
  updated_at: SqlFunctionUpsertLocomotiveOutput['updated_at'];
}

// types for query 'upsert_price'
export interface SqlQueryUpsertPriceInput {
  amount: SqlFunctionUpsertPriceInput['0'];
  currency: SqlFunctionUpsertPriceInput['1'];
}
export interface SqlQueryUpsertPriceOutput {
  id: SqlFunctionUpsertPriceOutput['id'];
}

// types for query 'upsert_train'
export interface SqlQueryUpsertTrainInput {
  homeStationGeocodeId: SqlFunctionUpsertTrainInput['0'];
  combinationId: SqlFunctionUpsertTrainInput['1'];
  locomotiveUuids: SqlFunctionUnnestInput['0'];
  carriageUuids: SqlFunctionUnnestInput['0'];
  engineerUuids: SqlFunctionUnnestInput['0'];
  leadEngineerUuid: SqlTableTrainEngineer['uuid'];
  status: SqlFunctionUpsertTrainInput['6'];
}
export interface SqlQueryUpsertTrainOutput {
  id: SqlFunctionUpsertTrainOutput['id'];
  uuid: SqlFunctionUpsertTrainOutput['uuid'];
}

// types for query 'upsert_train_engineer'
export interface SqlQueryUpsertTrainEngineerInput {
  socialSecurityNumberHash: SqlFunctionUpsertTrainEngineerInput['0'];
  certificateIds: SqlFunctionUpsertTrainEngineerInput['1'];
  licenseUuids: SqlFunctionUpsertTrainEngineerInput['2'];
  name: SqlFunctionUpsertTrainEngineerInput['3'];
}
export interface SqlQueryUpsertTrainEngineerOutput {
  id: SqlFunctionUpsertTrainEngineerOutput['id'];
  uuid: SqlFunctionUpsertTrainEngineerOutput['uuid'];
}

// types for query 'upsert_train_station'
export interface SqlQueryUpsertTrainStationInput {
  geocodeId: SqlFunctionUpsertTrainStationInput['0'];
  name: SqlFunctionUpsertTrainStationInput['1'];
}
export interface SqlQueryUpsertTrainStationOutput {
  id: SqlFunctionUpsertTrainStationOutput['id'];
  uuid: SqlFunctionUpsertTrainStationOutput['uuid'];
}
