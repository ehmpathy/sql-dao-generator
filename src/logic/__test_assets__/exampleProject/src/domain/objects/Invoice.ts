import { DomainEntity } from 'domain-objects';

import { InvoiceLineItem } from './InvoiceLineItem';
import { Price } from './Price';

export enum InvoiceStatus {
  PROPOSED = 'PROPOSED', // i.e., we created an invoice to show someone as a proposal
  ISSUED = 'ISSUED', // i.e., the user asked to pay for this invoice / told we would refund by this invoice (and the appropriate txn was created)
  PAID = 'PAID', // i.e., the user successfully paid this invoice
  REFUNDED = 'REFUNDED', // i.e., the user was refunded with this invoice
  CANCELED = 'CANCELED', // i.e., the invoice was canceled without payment
  FAILED = 'FAILED', // i.e., the charge or refund had failed to go through
}

export interface Invoice {
  id?: number;
  uuid?: string;
  externalId: string; // an id the service that created this invoice refers to the invoice by. namespaced to purpose
  items: InvoiceLineItem[];
  totalPrice: Price;
  status: InvoiceStatus;
}
export class Invoice extends DomainEntity<Invoice> implements Invoice {
  public static unique = ['externalId'];
  public static updatable = ['items', 'totalPrice', 'status'];
}
