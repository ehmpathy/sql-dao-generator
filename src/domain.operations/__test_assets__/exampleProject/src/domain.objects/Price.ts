import { DomainLiteral } from 'domain-objects';

import type { SvcPaymentsPaymentTransactionCurrency } from '../access/sdks/svcPayments';

export interface Price {
  id?: number;
  amount: number;
  currency: SvcPaymentsPaymentTransactionCurrency; // must be one of svc-payments currencies
}
export class Price extends DomainLiteral<Price> implements Price {}
