interface GeocodeResult {
  lat: string;
  lon: string;
}

interface OsrmResponse {
  code: string;
  routes?: Array<{ distance: number }>;
}

async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`;
  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error('Adres kon niet worden opgehaald');
  }

  const results = (await response.json()) as GeocodeResult[];
  const best = results[0];

  if (!best) {
    throw new Error('Adres niet gevonden');
  }

  return best;
}

export async function calculateDrivingDistanceKm(
  startAddress: string,
  endAddress: string,
  returnTrip = false,
): Promise<number> {
  const start = await geocodeAddress(startAddress);
  const end = await geocodeAddress(endAddress);

  const routeUrl = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`;
  const routeResponse = await fetch(routeUrl);

  if (!routeResponse.ok) {
    throw new Error('Route kon niet worden berekend');
  }

  const routeData = (await routeResponse.json()) as OsrmResponse;
  const distanceMeters = routeData.routes?.[0]?.distance;

  if (!distanceMeters || distanceMeters <= 0) {
    throw new Error('Geen route gevonden tussen deze adressen');
  }

  const totalDistanceMeters = returnTrip ? distanceMeters * 2 : distanceMeters;
  return Math.round((totalDistanceMeters / 1000) * 10) / 10;
}
