import { introspect } from 'domain-objects-metadata';

export const extractDomainObjectMetadatasFromConfigCriteria = async ({
  searchPaths,
  include,
  exclude,
}: {
  searchPaths: string[];
  include: string[] | null;
  exclude: string[] | null;
}) => {
  // grab the metadata of the domain objects specified in those search paths
  const metadatas = introspect(searchPaths);

  // if "include" is specified, include only the ones that are explicitly defined in the list; DEFAULT = all of them
  const metadatasAfterInclusion = include
    ? metadatas.filter((metadata) => include.includes(metadata.name)) // if defined, use only the ones in the list
    : metadatas; // default to "all are included"

  // if "exclude" is specified, filter out the ones that are in the list
  const metadatasAfterExclusion = exclude
    ? metadatasAfterInclusion.filter((metadata) => !exclude.includes(metadata.name)) // if defined, skip the ones in the list
    : metadatasAfterInclusion; // default to "none are exluded"

  // and give the metadatas after doing both of the above (and sorting)
  return metadatasAfterExclusion.sort((a, b) => (a.name < b.name ? -1 : 1));
};
