import {
  type DomainObjectPropertyMetadata,
  DomainObjectPropertyType,
} from 'domain-objects-metadata';

import { isUuidReferenceArrayProperty } from './isUuidReferenceArrayProperty';

const stringArray: DomainObjectPropertyMetadata = {
  name: 'photoUuids',
  type: DomainObjectPropertyType.ARRAY,
  of: { type: DomainObjectPropertyType.STRING },
};

const numberArray: DomainObjectPropertyMetadata = {
  name: 'scoreUuids',
  type: DomainObjectPropertyType.ARRAY,
  of: { type: DomainObjectPropertyType.NUMBER },
};

const soloString: DomainObjectPropertyMetadata = {
  name: 'ownerUuid',
  type: DomainObjectPropertyType.STRING,
};

const TEST_CASES: {
  description: string;
  given: {
    name: string;
    domainObjectProperty: DomainObjectPropertyMetadata | null;
  };
  expect: boolean;
}[] = [
  {
    description: 'a _uuids-suffix string[] is a uuid reference array',
    given: { name: 'photo_uuids', domainObjectProperty: stringArray },
    expect: true,
  },
  {
    description:
      'a _uuids-suffix number[] is NOT a uuid reference array (native primitive array)',
    given: { name: 'score_uuids', domainObjectProperty: numberArray },
    expect: false,
  },
  {
    description:
      'a string[] without the _uuids suffix is NOT a uuid reference array',
    given: { name: 'tags', domainObjectProperty: stringArray },
    expect: false,
  },
  {
    description:
      'a solo (non-array) _uuid string is NOT a uuid reference array',
    given: { name: 'owner_uuid', domainObjectProperty: soloString },
    expect: false,
  },
  {
    description:
      'a null domain-object property (database-generated) is NOT a uuid reference array',
    given: { name: 'thing_uuids', domainObjectProperty: null },
    expect: false,
  },
];

describe('isUuidReferenceArrayProperty', () => {
  TEST_CASES.map((thisCase) =>
    test(thisCase.description, () => {
      const result = isUuidReferenceArrayProperty(thisCase.given);
      expect(result).toEqual(thisCase.expect);
    }),
  );
});
