const normalizeLocation = (location = "") =>
  String(location).normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();

export function findDirectRoutes(busRoutes, from, to) {
  if (!from?.trim() || !to?.trim()) {
    return { success: false, message: "Enter both a starting point and a destination.", routes: [] };
  }
  const start = normalizeLocation(from);
  const destination = normalizeLocation(to);
  if (start === destination) {
    return { success: false, message: "Choose two different stops.", routes: [] };
  }

  const routes = busRoutes.flatMap((bus) => {
    if (!Array.isArray(bus.stops)) return [];
    const startIndex = bus.stops.findIndex((stop) => normalizeLocation(stop) === start);
    const endIndex = bus.stops.findIndex((stop) => normalizeLocation(stop) === destination);
    if (startIndex < 0 || endIndex < 0) return [];
    const journeyStops = startIndex < endIndex
      ? bus.stops.slice(startIndex, endIndex + 1)
      : bus.stops.slice(endIndex, startIndex + 1).reverse();
    return [{ ...bus, startIndex, endIndex, journeyStops, totalStops: journeyStops.length, direction: startIndex < endIndex ? "Forward" : "Reverse" }];
  });

  return {
    success: routes.length > 0,
    message: routes.length ? `${routes.length} direct bus route${routes.length === 1 ? "" : "s"} found.` : "No direct bus found for these stops. Try another pair.",
    routes,
  };
}

export function getUniqueStops(busRoutes) {
  const stops = busRoutes.flatMap((bus) => Array.isArray(bus.stops) ? bus.stops : []);
  return [...new Map(stops.map((stop) => [normalizeLocation(stop), stop])).values()].sort((a, b) => a.localeCompare(b));
}
