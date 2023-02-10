import { DomainValueObject } from 'domain-objects';

import { Price } from './Price';

export interface InvoiceLineItem {
  id?: number;
  price: Price;
  title: string; // e.g., "Work", "Protection", "AddOn: Liability Insurance"
  explanation: string; // "this is what the service provider quoted you" or "this is what allows ahbode to protect..." or "you chose to add on..."
}
export class InvoiceLineItem
  extends DomainValueObject<InvoiceLineItem>
  implements InvoiceLineItem {}
