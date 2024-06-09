import { getAllPathsMatchingGlobs } from './getAllPathsMatchingGlobs';

const root = `${__dirname}/../../__test_assets__/exampleProject`; // i.e., using the example project dir to search on

describe('getAllPathsMatchingGlobs', () => {
  it('should return paths that match a glob', async () => {
    const files = await getAllPathsMatchingGlobs({
      globs: ['src/domain/objects/*.ts'],
      root,
    });
    expect(files).toContain('src/domain/objects/Carriage.ts');
    expect(files).toContain('src/domain/objects/Engineer.ts');
    expect(files).toContain('src/domain/objects/Geocode.ts');
    expect(files).toContain('src/domain/objects/index.ts');
    expect(files).toContain('src/domain/objects/Locomotive.ts');
    expect(files).toContain('src/domain/objects/Train.ts');
    expect(files).toContain('src/domain/objects/TrainLocatedEvent.ts');
    expect(files).toContain('src/domain/objects/Station.ts');
    expect(files.length).toEqual(14);
  });
  it('should return paths that match each glob', async () => {
    const files = await getAllPathsMatchingGlobs({
      globs: ['src/domain/objects/Train*.ts', 'src/domain/objects/Geocode.ts'],
      root,
    });
    expect(files).toContain('src/domain/objects/Train.ts');
    expect(files).toContain('src/domain/objects/TrainLocatedEvent.ts');
    expect(files).toContain('src/domain/objects/Geocode.ts');
    expect(files.length).toEqual(4);
  });
  it('should not return paths that match a glob that starts with "!"', async () => {
    const files = await getAllPathsMatchingGlobs({
      globs: ['src/domain/objects/*.ts', '!src/domain/objects/*.test.ts'],
      root,
    });
    expect(files).toContain('src/domain/objects/TrainLocatedEvent.ts');
    expect(files).not.toContain('src/domain/objects/TrainLocatedEvent.test.ts');
  });
});
