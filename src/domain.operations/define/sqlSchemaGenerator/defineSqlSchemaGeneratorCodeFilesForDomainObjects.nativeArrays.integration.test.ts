import { introspect } from 'domain-objects-metadata';

import { defineSqlSchemaRelationshipsForDomainObjects } from '@src/domain.operations/define/sqlSchemaRelationship/defineSqlSchemaRelationshipsForDomainObjects';

import { defineSqlSchemaGeneratorCodeFilesForDomainObjects } from './defineSqlSchemaGeneratorCodeFilesForDomainObjects';

// prove the new array-kind branches survive a REAL domain-objects-metadata introspect() pass on
// real typescript — not just hand-built DomainObjectPropertyMetadata doubles. this is the vision's
// "real acceptance bar": a mismatch between introspect()'s hydrated output and the unit-test doubles
// would slip past the hand-built cases but be caught here. the fixture lives in a dedicated subfolder
// (not the main index.ts, not the cli's `src/domain.objects/*.ts` glob) so it never flows through the
// cli `generate`, which shells out to sql-schema-generator (whose ARRAY_OF still rejects native
// primitive/enum arrays today).
describe('defineSqlSchemaGeneratorCodeFilesForDomainObjects', () => {
  it('should emit native array columns for primitive, enum, and _uuids arrays from real introspect', () => {
    const domainObjects = introspect(
      `${__dirname}/../../.test.assets/exampleProject/src/domain.objects/nativeArrays/index.ts`,
    );

    // sanity: introspect found the SurfSpot entity and hydrated its array element kinds
    const surfSpot = domainObjects.find((dobj) => dobj.name === 'SurfSpot');
    expect(surfSpot).toBeDefined();

    const sqlSchemaRelationships = defineSqlSchemaRelationshipsForDomainObjects(
      { domainObjects },
    );
    const codes = defineSqlSchemaGeneratorCodeFilesForDomainObjects({
      domainObjects,
      sqlSchemaRelationships,
    });

    // find the emitted schema-generator entity declaration (the camelCase `surfSpot.ts` file that
    // holds the prop.* expressions) — NOT the snake_case `view_surf_spot_hydrated.sql` view file
    const surfSpotSchema = codes.find((code) =>
      code.relpath.endsWith('surfSpot.ts'),
    );
    expect(surfSpotSchema).toBeDefined();
    const content = surfSpotSchema!.content;

    // each array kind maps to its native column expression, derived from real introspect metadata
    expect(content).toContain('aliases: prop.ARRAY_OF(prop.VARCHAR())'); // string[] -> text[]
    expect(content).toContain(
      'best_swell_periods_sec: prop.ARRAY_OF(prop.NUMERIC())',
    ); // number[] -> numeric[]
    expect(content).toContain(
      "swell_windows: prop.ARRAY_OF(prop.ENUM(['N', 'NW', 'W', 'SW', 'S']))",
    ); // enum[] -> native enum[]
    expect(content).toContain('lineup_photo_uuids: prop.ARRAY_OF(prop.UUID())'); // _uuids string[] -> uuid[]

    // and lock the full emitted files against silent regression
    expect(codes).toMatchSnapshot();
  });
});
