import { introspect } from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipsForDomainObjects } from '@src/domain.operations/define/sqlSchemaRelationship/defineSqlSchemaRelationshipsForDomainObjects';

import { DAO_GENERATED_DIR } from './constants';
import { defineDaoCodeFilesForDomainObjects } from './defineDaoCodeFilesForDomainObjects';

const getAllDaoCodeFilesForExampleProject = () => {
  const domainObjects = introspect(
    `${__dirname}/../../.test.assets/exampleProject/src/domain.objects/index.ts`,
  );
  const sqlSchemaRelationships = defineSqlSchemaRelationshipsForDomainObjects({
    domainObjects,
  });
  return defineDaoCodeFilesForDomainObjects({
    domainObjects,
    sqlSchemaRelationships,
  });
};

describe('defineSqlSchemaControlCodeFilesForDomainObjects', () => {
  it('should work on the example project', () => {
    expect(getAllDaoCodeFilesForExampleProject()).toMatchSnapshot(); // and save example
  });

  /**
   * .what = every file this generator defines lands in one of exactly TWO directories — the shared
   *         `.generated/`, or the domain object's own `<x>Dao/`
   * .why  = a snapshot absorbs a new directory on resnap; this refuses it. and an undotted dir is
   *         scanned for sql by a consumer's `codegen.sql.types.yml`, which fails their generate run
   * .note  = asserts the relpath shape, so a new per-dao file or shared module needs no test edit
   */
  it('should define files into the shared generated dir or a per-dao dir, and nowhere else', () => {
    const relpaths = getAllDaoCodeFilesForExampleProject().map(
      (file) => file.relpath,
    );

    // sanity: the corpus is real, so an empty pass can not read as a green
    expect(relpaths.length).toBeGreaterThan(10);

    const relpathsUnpermitted = relpaths.filter(
      (relpath) =>
        !new RegExp(`^${DAO_GENERATED_DIR}\\/[^/]+\\.ts$`).test(relpath) &&
        !/^[a-zA-Z]+Dao\/[^/]+\.ts$/.test(relpath),
    );
    expect(relpathsUnpermitted).toEqual([]);

    // and both permitted shapes are actually exercised, so neither branch is dead
    expect(
      relpaths.filter((relpath) => relpath.startsWith(`${DAO_GENERATED_DIR}/`)),
    ).toEqual([`${DAO_GENERATED_DIR}/casts.ts`]);
    expect(
      relpaths.filter((relpath) => /^[a-zA-Z]+Dao\//.test(relpath)).length,
    ).toBeGreaterThan(10);
  });
});
