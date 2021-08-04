import { extractDomainObjectMetadatasFromConfigCriteria } from './extractDomainObjectMetadatasFromConfigCriteria';

describe('extractDomainObjectMetadatasFromConfigCriteria', () => {
  it('should follow all imports to resolve all references', async () => {
    const metadatas = await extractDomainObjectMetadatasFromConfigCriteria({
      searchPaths: [`${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/index.ts`],
      include: null,
      exclude: null,
    });
    // console.log(JSON.stringify(metadatas, null, 2));
    expect(metadatas.length).toEqual(8);
  });
  it('should find all of the domain objects findable by all search paths in a directory, with no dupes', async () => {
    const metadatas = await extractDomainObjectMetadatasFromConfigCriteria({
      searchPaths: [
        `${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/Carriage.ts`,
        `${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/Engineer.ts`,
        `${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/Geocode.ts`,
        `${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/index.ts`,
        `${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/Locomotive.ts`,
        `${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/Train.ts`,
        `${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/TrainLocatedEvent.ts`,
      ],
      include: null,
      exclude: null,
    });
    // console.log(JSON.stringify(metadatas, null, 2));
    expect(metadatas.length).toEqual(8);
  });
  it('should only find the domain objects imported from the files in the search paths', async () => {
    const metadatas = await extractDomainObjectMetadatasFromConfigCriteria({
      searchPaths: [`${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/Train.ts`],
      include: null,
      exclude: null,
    });
    // console.log(JSON.stringify(metadatas, null, 2));
    expect(metadatas.length).toEqual(2);
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('TrainLocatedEvent'); // Train does not reference TrainLocatedEvent
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('TrainEngineer'); // Train does not reference Geocode
  });
  it('should filter out the ones named in the `exclude` list', async () => {
    const metadatas = await extractDomainObjectMetadatasFromConfigCriteria({
      searchPaths: [`${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/index.ts`],
      include: null,
      exclude: ['TrainLocatedEvent'],
    });
    // console.log(JSON.stringify(metadatas, null, 2));
    expect(metadatas.length).toEqual(7);
  });
  it('should only keep the one named in the `include` list, if provided', async () => {
    const metadatas = await extractDomainObjectMetadatasFromConfigCriteria({
      searchPaths: [`${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/index.ts`],
      include: ['Geocode', 'TrainLocatedEvent', 'Carriage'],
      exclude: null,
    });
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('Engineer');
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('Locomotive');
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('Train');
    // console.log(JSON.stringify(metadatas, null, 2));
    expect(metadatas.length).toEqual(3);
  });
  it('should filter on include and exclude if both are defined', async () => {
    const metadatas = await extractDomainObjectMetadatasFromConfigCriteria({
      searchPaths: [`${__dirname}/../../__test_assets__/exampleProject/src/domain/objects/index.ts`],
      include: ['Geocode', 'TrainLocatedEvent', 'Carriage'],
      exclude: ['TrainLocatedEvent'],
    });
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('Engineer');
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('Locomotive');
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('Train');
    expect(metadatas.map((metadata) => metadata.name)).not.toContain('TrainLocatedEvent');
    // console.log(JSON.stringify(metadatas, null, 2));
    expect(metadatas.length).toEqual(2);
  });
});
