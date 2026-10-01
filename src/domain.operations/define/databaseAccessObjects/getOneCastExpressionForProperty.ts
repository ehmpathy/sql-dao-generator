import {
  type DomainObjectMetadata,
  DomainObjectPropertyType,
  isEnumArrayProperty,
  isPrimitiveArrayProperty,
} from 'domain-objects-metadata';

import { SqlSchemaReferenceMethod } from '@src/domain.objects/SqlSchemaReferenceMetadata';
import type { SqlSchemaToDomainObjectRelationship } from '@src/domain.objects/SqlSchemaToDomainObjectRelationship';
import { UnexpectedCodePathDetectedError } from '@src/domain.operations/UnexpectedCodePathDetectedError';

import { getOneCastNameForProperty } from './getOneCastNameForProperty';
import { getOneDbObjectKeyForProperty } from './getOneDbObjectKeyForProperty';

/**
 * .what = wraps one cast expression in the null short-circuit a nullable column owes
 * .why  = five arms below owe this guard; one home keeps the five in step
 * .note = the key is an input: three arms guard on `sqlSchemaProperty.name`, two on `dbObjectKey`
 */
const asNullGuardedExpression = ({
  dbObjectKey,
  isNullable,
  expression,
}: {
  dbObjectKey: string;
  isNullable: boolean;
  expression: string;
}): string =>
  isNullable
    ? `dbObject.${dbObjectKey} === null ? null : ${expression}`
    : expression;

/**
 * .what = gets the one property assignment a generated cast carries for one property
 * .why  = the choice descends reference method × cardinality × nullability; named, the caller
 *         reads as a map
 * .note = a sql column with no domain property yields `null`, which the caller drops
 */
export const getOneCastExpressionForProperty = ({
  sqlSchemaProperty,
  domainObjectProperty,
  domainObject,
}: {
  sqlSchemaProperty: SqlSchemaToDomainObjectRelationship['properties'][number]['sqlSchema'];
  domainObjectProperty: SqlSchemaToDomainObjectRelationship['properties'][number]['domainObject'];
  domainObject: DomainObjectMetadata;
}): string | null => {
  // if domain object property is not defined, then no need to define how to cast from it
  if (!domainObjectProperty) return null;

  // enum case
  if (domainObjectProperty.type === DomainObjectPropertyType.ENUM)
    return `${domainObjectProperty.name}: dbObject.${sqlSchemaProperty.name} as ${domainObject.name}['${domainObjectProperty.name}']`;

  // enum array case: assure typescript of the domain enum[] type (the sql-generated element type is a loose string, not the enum union)
  if (isEnumArrayProperty(domainObjectProperty) && !sqlSchemaProperty.reference)
    return `${domainObjectProperty.name}: dbObject.${sqlSchemaProperty.name} as ${domainObject.name}['${domainObjectProperty.name}']`;

  // non-reference primitive string array case (e.g. a native varchar[] column, or a _uuids array of non-fk uuids)
  if (
    isPrimitiveArrayProperty(domainObjectProperty) &&
    domainObjectProperty.of.type === DomainObjectPropertyType.STRING &&
    !sqlSchemaProperty.reference // only for cases where its not an fk based implicit-uuid-reference
  ) {
    // note: `as string[]` also asserts non-null, and a native `varchar[]` has no COALESCE, so a
    //   nullable one is guarded
    const castExpression = `dbObject.${sqlSchemaProperty.name} as string[]`; // assure typescript that we _know_ its a string array (not number[])
    return `${domainObjectProperty.name}: ${asNullGuardedExpression({
      dbObjectKey: sqlSchemaProperty.name,
      isNullable: sqlSchemaProperty.isNullable,
      expression: castExpression,
    })}`;
  }

  // note: boolean arrays fall through with no assertion; the right narrow depends on an element
  //   type sql-schema-generator can not yet generate (its ARRAY_OF accepts only REFERENCES/UUID)

  // divergence-prone primitive array case: cast elementwise
  // note: unreachable until sql-schema-generator's ARRAY_OF accepts native primitive arrays
  const castName = getOneCastNameForProperty({
    sqlSchemaProperty,
    domainObjectProperty,
  });
  if (
    castName &&
    isPrimitiveArrayProperty(domainObjectProperty) &&
    !sqlSchemaProperty.reference
  ) {
    const castExpressionElementwise = `dbObject.${sqlSchemaProperty.name}.map(${castName})`;

    // note: a nullable native array is guarded; `.map` on null would raise a bare `TypeError`
    return `${domainObjectProperty.name}: ${asNullGuardedExpression({
      dbObjectKey: sqlSchemaProperty.name,
      isNullable: sqlSchemaProperty.isNullable,
      expression: castExpressionElementwise,
    })}`;
  }

  // non-reference case
  if (!sqlSchemaProperty.reference) {
    // string, boolean, uuid, and enum arrive identically on both paths, so read directly
    if (!castName)
      return `${domainObjectProperty.name}: dbObject.${sqlSchemaProperty.name}`;

    // otherwise, cast at the boundary, so the declared domain type is true on every path
    const castExpression = `${castName}(dbObject.${sqlSchemaProperty.name})`;
    return `${domainObjectProperty.name}: ${asNullGuardedExpression({
      dbObjectKey: sqlSchemaProperty.name,
      isNullable: sqlSchemaProperty.isNullable,
      expression: castExpression,
    })}`;
  }

  // define the key this property is read from; the find-by select asks the same function
  // note: `null` means an unknown reference method
  const dbObjectKey = getOneDbObjectKeyForProperty({
    sqlSchemaProperty,
    domainObjectProperty,
  });
  if (dbObjectKey === null)
    throw new UnexpectedCodePathDetectedError({
      reason:
        'unexpected reference method to derive a database object key for in dao castFromDatabaseObject to generate',
      domainObjectName: domainObject.name,
      domainObjectPropertyName: domainObjectProperty.name,
    });

  // referenced by uuid case
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.IMPLICIT_BY_UUID
  ) {
    // solo reference case
    if (!sqlSchemaProperty.isArray)
      return `${domainObjectProperty.name}: dbObject.${dbObjectKey}`;

    // array reference case
    // note: no null guard: the select is `COALESCE(array_agg(...), array[]::uuid[])`
    return `${domainObjectProperty.name}: dbObject.${dbObjectKey} as string[]`; // as string array since we have an array of uuids - but the type defs generated from sql will complain that it could be string[] or number[] or null (not smart enough to look all the way through fn defs yet)
  }

  // directly nested case
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.DIRECT_BY_NESTING
  ) {
    // note: a nested column arrives jsoned however its parent was selected, so the narrow lives
    //   here. upstream declares it `Record<string, any> | null`
    // note: scoped to one column of one read; in the `...Strict` type, every `findBy*` would assert
    const jsonedShape = `SqlQueryFind${sqlSchemaProperty.reference.of.name}ByIdOutputJsoned`;

    // solo reference case
    if (!sqlSchemaProperty.isArray)
      return `${domainObjectProperty.name}: ${asNullGuardedExpression({
        dbObjectKey,
        isNullable: sqlSchemaProperty.isNullable,
        expression: `cast${sqlSchemaProperty.reference.of.name}FromDatabaseObject(dbObject.${dbObjectKey} as ${jsonedShape})`,
      })}`;

    // array reference case
    // note: no null guard: the select is `COALESCE(json_agg(...), '[]'::json)`
    return `${domainObjectProperty.name}: (dbObject.${dbObjectKey} as ${jsonedShape}[]).map(cast${sqlSchemaProperty.reference.of.name}FromDatabaseObject)`;
  }

  // directly declared case
  if (
    sqlSchemaProperty.reference.method ===
    SqlSchemaReferenceMethod.DIRECT_BY_DECLARATION
  ) {
    // solo reference case
    // note: a bare correlated subquery yields NULL when the row is absent, so this arm guards
    // note: guard and value read one key; a guard on `carriage_ref` would never fire
    if (!sqlSchemaProperty.isArray)
      return `${domainObjectProperty.name}: ${asNullGuardedExpression({
        dbObjectKey,
        isNullable: sqlSchemaProperty.isNullable,
        expression: `{ uuid: dbObject.${dbObjectKey} }`,
      })}`; // todo: get a ref-by-unique json object back, instead of just the uuid

    // array reference case
    // note: no null guard: the select is `COALESCE(array_agg(...), array[]::uuid[])`
    // todo: get a ref-by-unique json object back, instead of just the uuid
    return `${domainObjectProperty.name}: (dbObject.${dbObjectKey} as string[]).map(uuid => ({ uuid }))`; // as string array since we have an array of uuids - but the type defs generated from sql will complain that it could be string[] or number[] or null (not smart enough to look all the way through fn defs yet)
  }

  // handle unexpected case (each case should have been handled above)
  throw new UnexpectedCodePathDetectedError({
    reason:
      'unexpected property type to instantiate in dao castFromDatabaseObject to generate',
    domainObjectName: domainObject.name,
    domainObjectPropertyName: domainObjectProperty.name,
  }); // fail fast if reached here
};
