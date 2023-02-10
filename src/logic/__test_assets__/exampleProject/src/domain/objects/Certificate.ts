import { DomainValueObject } from 'domain-objects';

export enum CertificateType {
  LOCOMOTIVE_DRIVING = 'LOCOMOTIVE_DRIVING',
  ENGINE_MAINTENANCE = 'ENGINE_MAINTENANCE',
  CARRIAGE_MAINTENANCE = 'CARRIAGE_MAINTENANCE',
}

export interface Certificate {
  id?: number;
  type: CertificateType;
  industryId: string;
}
export class Certificate
  extends DomainValueObject<Certificate>
  implements Certificate {}
