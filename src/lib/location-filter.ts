export interface LocationPresence {
  presentAtAllLocations?: boolean | null;
  presentAtLocationIds?: string[] | null;
  absentAtLocationIds?: string[] | null;
}

export function isPresentAtLocation(
  object: LocationPresence,
  locationId: string,
): boolean {
  const absent = object.absentAtLocationIds ?? [];
  if (absent.includes(locationId)) {
    return false;
  }

  const presentAtAll = object.presentAtAllLocations ?? true;
  if (presentAtAll) {
    return true;
  }

  const present = object.presentAtLocationIds ?? [];
  return present.includes(locationId);
}
