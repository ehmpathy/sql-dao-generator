import { SqlSchemaReferenceMethod } from '@src/domain.objects/SqlSchemaReferenceMetadata';

import { isNonReferenceArrayColumn } from './isNonReferenceArrayColumn';

const genSqlSchemaProperty = (input: {
  isArray: boolean;
  reference: { method: SqlSchemaReferenceMethod } | null;
}) => ({
  name: 'example',
  isNullable: false,
  isUpdatable: false,
  isDatabaseGenerated: false,
  isArray: input.isArray,
  reference: input.reference as any,
});

const TEST_CASES = [
  {
    description: 'a native array column (isArray, no reference) is true',
    given: { isArray: true, reference: null },
    expect: true,
  },
  {
    description: 'a reference array (isArray, has reference) is false',
    given: {
      isArray: true,
      reference: { method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING },
    },
    expect: false,
  },
  {
    description:
      'a _uuids implicit-by-uuid reference array (isArray, has reference) is false',
    given: {
      isArray: true,
      reference: { method: SqlSchemaReferenceMethod.IMPLICIT_BY_UUID },
    },
    expect: false,
  },
  {
    description: 'a solo (non-array) native column is false',
    given: { isArray: false, reference: null },
    expect: false,
  },
  {
    description: 'a solo (non-array) reference is false',
    given: {
      isArray: false,
      reference: { method: SqlSchemaReferenceMethod.DIRECT_BY_NESTING },
    },
    expect: false,
  },
];

describe('isNonReferenceArrayColumn', () => {
  TEST_CASES.map((thisCase) =>
    test(thisCase.description, () => {
      const result = isNonReferenceArrayColumn(
        genSqlSchemaProperty(thisCase.given),
      );
      expect(result).toEqual(thisCase.expect);
    }),
  );
});
