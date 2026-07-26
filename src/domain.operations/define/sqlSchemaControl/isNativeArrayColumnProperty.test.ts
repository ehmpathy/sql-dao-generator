import {
  type DomainObjectPropertyMetadata,
  DomainObjectPropertyType,
  DomainObjectVariant,
} from 'domain-objects-metadata';

import { isNativeArrayColumnProperty } from './isNativeArrayColumnProperty';

const stringArray: DomainObjectPropertyMetadata = {
  name: 'tags',
  type: DomainObjectPropertyType.ARRAY,
  of: { type: DomainObjectPropertyType.STRING },
};

const numberArray: DomainObjectPropertyMetadata = {
  name: 'scores',
  type: DomainObjectPropertyType.ARRAY,
  of: { type: DomainObjectPropertyType.NUMBER },
};

const enumArray: DomainObjectPropertyMetadata = {
  name: 'statuses',
  type: DomainObjectPropertyType.ARRAY,
  of: { type: DomainObjectPropertyType.ENUM, of: ['ACTIVE', 'PAUSED'] },
};

const referenceArray: DomainObjectPropertyMetadata = {
  name: 'zones',
  type: DomainObjectPropertyType.ARRAY,
  of: {
    type: DomainObjectPropertyType.REFERENCE,
    of: { name: 'Zone', extends: DomainObjectVariant.DOMAIN_ENTITY },
  },
};

const soloString: DomainObjectPropertyMetadata = {
  name: 'slug',
  type: DomainObjectPropertyType.STRING,
};

const TEST_CASES: {
  description: string;
  given: DomainObjectPropertyMetadata | null;
  expect: boolean;
}[] = [
  {
    description: 'a primitive string[] is a native array column',
    given: stringArray,
    expect: true,
  },
  {
    description: 'a primitive number[] is a native array column',
    given: numberArray,
    expect: true,
  },
  {
    description: 'an enum[] is a native array column',
    given: enumArray,
    expect: true,
  },
  {
    description:
      'a reference array is NOT a native array column (it is a relation)',
    given: referenceArray,
    expect: false,
  },
  {
    description: 'a solo (non-array) primitive is NOT a native array column',
    given: soloString,
    expect: false,
  },
  {
    description:
      'a null property (database-generated) is NOT a native array column',
    given: null,
    expect: false,
  },
];

describe('isNativeArrayColumnProperty', () => {
  TEST_CASES.map((thisCase) =>
    test(thisCase.description, () => {
      const result = isNativeArrayColumnProperty(thisCase.given);
      expect(result).toEqual(thisCase.expect);
    }),
  );
});
