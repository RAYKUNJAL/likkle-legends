export type RadioCatalogTrack = {
  id: string;
  title: string;
  url: string;
  channel?: string;
};

export function buildRadioCatalog<T extends RadioCatalogTrack>(playable: T[], unavailable: T[]): T[] {
  // A recovered recording takes precedence over its older unavailable entry.
  return Array.from(new Map(
    [...unavailable, ...playable].map(track => [`${track.channel}-${track.title}`, track]),
  ).values());
}

export function getRadioStationSummary(channel: string, playable: RadioCatalogTrack[], catalog: RadioCatalogTrack[]) {
  const playableCount = playable.filter(track => track.channel === channel).length;
  const totalCount = catalog.filter(track => track.channel === channel).length;
  return {
    playableCount,
    totalCount,
    label: playableCount ? `${playableCount} playable` : 'Library only',
    description: `${playableCount} ready to play, ${totalCount} in the collection`,
  };
}

export function resolveRadioStationTrack<T extends RadioCatalogTrack>(library: T[], active: T | undefined, channel: string): T | undefined {
  const stationTracks = library.filter(track => track.channel === channel);
  return stationTracks.find(track => track.id === active?.id) ?? stationTracks[0];
}
