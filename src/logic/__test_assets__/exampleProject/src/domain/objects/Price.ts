import { DomainValueObject } from 'domain-objects';

import { SvcPaymentsPaymentTransactionCurrency } from '../../data/clients/svcPayments';

export interface Price {
  id?: number;
  amount: number;
  currency: SvcPaymentsPaymentTransactionCurrency; // must be one of svc-payments currencies
}
export class Price extends DomainValueObject<Price> implements Price {}
