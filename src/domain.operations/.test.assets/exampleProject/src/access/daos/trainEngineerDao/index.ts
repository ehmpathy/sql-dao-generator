import { withExpectOutput } from 'procedure-fns';

import { findById } from './findById';
import { findByUnique } from './findByUnique';
import { findByUuid } from './findByUuid';
import { findByRef } from './findByRef';
import { upsert } from './upsert';

export const trainEngineerDao = {
  findById: withExpectOutput(findById),
  findByUnique: withExpectOutput(findByUnique),
  findByUuid: withExpectOutput(findByUuid),
  findByRef: withExpectOutput(findByRef),
  upsert,
};

// include an alias, for improved ease of access via autocomplete
export const daoTrainEngineer = trainEngineerDao;
