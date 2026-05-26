export type PlaceCategory =
    | "attraction"
    | "historic"
    | "restaurant"
    | "bar"
    | "hotel"
    | "nature";

export interface OverpassPlace {
    id: number;
    lat: number;
    lon: number;
    name: string;
    category: PlaceCategory;
}

// Solo node — way y relation son lentos y rara vez tienen coords directas
const CATEGORY_FILTERS: Record<PlaceCategory, string> = {
    attraction: `node["tourism"="attraction"]["name"]`,
    historic: `node["historic"]["name"]`,
    restaurant: `node["amenity"="restaurant"]["name"]`,
    bar: `node["amenity"~"^(bar|pub|nightclub)$"]["name"]`,
    hotel: `node["tourism"="hotel"]["name"]`,
    nature: `node["leisure"~"^(park|nature_reserve|beach)$"]["name"]`,
};

// Cache en memoria por sesión
const cache = new Map<string, OverpassPlace[]>();

// Paso 1: geocodificar ciudad con Nominatim (muy rápido, ~200ms)
async function geocodeCity(
    city: string,
    state: string,
    countryCode: string
): Promise<{ lat: number; lon: number } | null> {
    const q = encodeURIComponent(`${city}, ${state}, ${countryCode}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
    const res = await fetch(url, {
        headers: {
            "Accept-Language": "es",
            "User-Agent": "RoutesApp/1.0 (student project)",
        },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

// Paso 2: buscar places en radio alrededor de las coords
export async function fetchPlacesByCity(
    cityName: string,
    stateName: string,
    countryCode: string,
    category: PlaceCategory,
    limit = 25,
    radiusKm = 10
): Promise<OverpassPlace[]> {
    const cacheKey = `${countryCode}-${cityName}-${category}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey)!;

    // Geocodificar primero
    const coords = await geocodeCity(cityName, stateName, countryCode);
    if (!coords) throw new Error(`No se encontró la ciudad: ${cityName}`);

    const { lat, lon } = coords;
    const radiusM = radiusKm * 1000;
    const filter = CATEGORY_FILTERS[category];

    const query = `
[out:json][timeout:10];
${filter}(around:${radiusM},${lat},${lon});
out ${limit};
    `.trim();

    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
    });

    if (!res.ok) throw new Error("Error consultando Overpass API");

    const data = await res.json();
    const places: OverpassPlace[] = (data.elements as any[])
        .filter((el) => el.lat && el.lon && el.tags?.name)
        .map((el) => ({
            id: el.id,
            lat: el.lat,
            lon: el.lon,
            name: el.tags.name,
            category,
        }));

    cache.set(cacheKey, places);
    return places;
}

export function clearPlacesCache() {
    cache.clear();
}