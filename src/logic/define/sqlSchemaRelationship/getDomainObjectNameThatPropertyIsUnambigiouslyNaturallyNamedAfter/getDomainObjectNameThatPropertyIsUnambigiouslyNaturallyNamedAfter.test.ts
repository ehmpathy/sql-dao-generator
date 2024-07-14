// tslint:disable: align
import {
  AmbiguouslyNamedDomainObjectReferencePropertyError,
  getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter,
} from './getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter';

describe('getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter', () => {
  const cases: {
    propertyName: string;
    allDomainObjectNames: string[];
    expectedResult?: string | null;
    expectedErrorMessageContains?: string;
  }[] = [
    // {
    //   propertyName: 'address',
    //   allDomainObjectNames: ['Address', 'Geocode', 'User'],
    //   expectedResult: 'Address',
    // },
    // {
    //   propertyName: 'homeAddress',
    //   allDomainObjectNames: ['HomeAddress', 'Geocode', 'User'],
    //   expectedResult: 'HomeAddress',
    // },
    // {
    //   propertyName: 'address',
    //   allDomainObjectNames: ['HomeAddress', 'Geocode', 'User'],
    //   expectedResult: 'HomeAddress',
    // },
    // {
    //   propertyName: 'address',
    //   allDomainObjectNames: ['HomeAddress', 'WorkAddress', 'Geocode', 'User'],
    //   expectedErrorMessageContains: '["HomeAddress","WorkAddress"]',
    // },
    // {
    //   propertyName: 'homeAddress',
    //   allDomainObjectNames: ['HomeAddress', 'WorkAddress', 'Geocode', 'User'],
    //   expectedResult: 'HomeAddress',
    // },
    // {
    //   propertyName: 'externalId',
    //   allDomainObjectNames: ['PlaneExternalId', 'Airport', 'PlaneManufacturer'],
    //   expectedResult: 'PlaneExternalId',
    // },
    // {
    //   propertyName: 'externalIds',
    //   allDomainObjectNames: ['PlaneExternalId', 'Airport', 'PlaneManufacturer'],
    //   expectedResult: 'PlaneExternalId',
    // },
    // {
    //   propertyName: 'eventUuid',
    //   allDomainObjectNames: ['OutreachCaptureEvent', 'RelationshipEvent'],
    //   expectedErrorMessageContains:
    //     '["OutreachCaptureEvent","RelationshipEvent"]',
    // },
    // {
    //   propertyName: 'outreachCaptureEventUuid',
    //   allDomainObjectNames: ['OutreachCaptureEvent', 'RelationshipEvent'],
    //   expectedResult: 'OutreachCaptureEvent',
    // },
    // {
    //   propertyName: 'issuerRef',
    //   allDomainObjectNames: ['InvoiceIssuer', 'InvoiceReceiver'],
    //   expectedResult: 'InvoiceIssuer',
    // },
    // {
    //   propertyName: 'issuerRef',
    //   allDomainObjectNames: ['InvoiceIssuerRef', 'InvoiceReceiverRef'],
    //   expectedResult: 'InvoiceIssuerRef',
    // },
    {
      propertyName: 'receiverRef',
      allDomainObjectNames: ['InvoiceIssuerRef', 'InvoiceReceiverRef'],
      expectedResult: 'InvoiceReceiverRef',
    },
  ];

  cases.forEach((testCase) => {
    it(`should ${
      testCase.expectedResult
        ? `return ${testCase.expectedResult}`
        : 'throw error'
    } for ${testCase.propertyName}, ${JSON.stringify(
      testCase.allDomainObjectNames,
    )}`, () => {
      if (testCase.expectedResult) {
        expect(
          getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter({
            parentDomainObjectName: 'GreatThing',
            propertyName: testCase.propertyName,
            allDomainObjectNames: testCase.allDomainObjectNames,
          }),
        ).toEqual(testCase.expectedResult);
      } else {
        try {
          getDomainObjectNameThatPropertyIsUnambigiouslyNaturallyNamedAfter({
            parentDomainObjectName: 'GreatThing',
            propertyName: testCase.propertyName,
            allDomainObjectNames: testCase.allDomainObjectNames,
          });
          throw new Error('should not reach here');
        } catch (error) {
          expect(error).toBeInstanceOf(
            AmbiguouslyNamedDomainObjectReferencePropertyError,
          );
          expect(error.message).toContain(
            testCase.expectedErrorMessageContains,
          );
        }
      }
    });
  });
});
