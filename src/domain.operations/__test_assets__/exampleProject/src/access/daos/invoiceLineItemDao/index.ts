import { withExpectOutput } from 'procedure-fns';

import { findById } from './findById';
import { findByUnique } from './findByUnique';
import { upsert } from './upsert';

export const invoiceLineItemDao = {
  findById: withExpectOutput(findById),
  findByUnique: withExpectOutput(findByUnique),
  upsert,
};

// include an alias, for improved ease of access via autocomplete
export const daoInvoiceLineItem = invoiceLineItemDao;
