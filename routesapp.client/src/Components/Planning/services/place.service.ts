export type PlaceCategory =
    | "tourism"
    | "gastronomy"
    | "nature"
    | "culture"
    | "nightlife"
    | "shopping"
    | "sport"
    | "wellness";
export const placeCategoryOptions = [
    {
        key: "tourism",
        label: "Turismo",
        emoji: "🗺️",
        color: "#2563eb",
    },
    {
        key: "gastronomy",
        label: "Gastronomía",
        emoji: "🍽️",
        color: "#ea580c",
    },
    {
        key: "nature",
        label: "Naturaleza",
        emoji: "🌿",
        color: "#16a34a",
    },
    {
        key: "culture",
        label: "Cultura",
        emoji: "🎭",
        color: "#9333ea",
    },
    {
        key: "nightlife",
        label: "Vida nocturna",
        emoji: "🌙",
        color: "#db2777",
    },
    {
        key: "shopping",
        label: "Compras",
        emoji: "🛍️",
        color: "#f59e0b",
    },
    {
        key: "sport",
        label: "Deporte",
        emoji: "⚽",
        color: "#06b6d4",
    },
    {
        key: "wellness",
        label: "Bienestar",
        emoji: "🧘",
        color: "#84cc16",
    },
];

export interface OverpassPlace {
    id: string;
    lat: number;
    lon: number;
    name: string;
    category: PlaceCategory;
}

// Solo node — way y relation son lentos y rara vez tienen coords directas
const CATEGORY_FILTERS: Record<PlaceCategory, string> = {
    tourism: `node["tourism"~"^(attraction|museum|viewpoint)$"]["name"]`,
    gastronomy: `node["amenity"~"^(restaurant|cafe|fast_food)$"]["name"]`,
    nature: `node["leisure"~"^(park|nature_reserve|garden)$"]["name"]`,
    culture: `node["tourism"~"^(museum|gallery)$"]["name"]`,
    nightlife: `node["amenity"~"^(bar|pub|nightclub)$"]["name"]`,
    shopping: `node["shop"]["name"]`,
    sport: `node["leisure"~"^(sports_centre|stadium|pitch)$"]["name"]`,
    wellness: `node["amenity"~"^(spa|clinic)$"]["name"]`,
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
    categories: PlaceCategory[],
    limit = 40,
    radiusKm = 5
): Promise<OverpassPlace[]> {
    if (categories.length === 0) return [];

    const cacheKey = `${countryCode}-${cityName}-${stateName}-${categories.slice().sort().join(",")}`;

    if (cache.has(cacheKey)) return cache.get(cacheKey)!;

    const coords = await geocodeCity(cityName, stateName, countryCode);
    if (!coords) return [];

    const { lat, lon } = coords;
    const radiusM = radiusKm * 1000;

    const queryParts = categories
        .map((category) => {
            const filter = CATEGORY_FILTERS[category];

            if (!filter) return "";

            return `${filter}(around:${radiusM},${lat},${lon});`;
        })
        .filter(Boolean)
        .join("\n");

    const query = `
[out:json][timeout:15];
(
${queryParts}
);
out center ${limit};
`.trim();

    console.log("Overpass query única:", query);

    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
    });

    if (!res.ok) {
        console.warn("Overpass falló:", res.status, await res.text());
        cache.set(cacheKey, []);
        return [];
    }

    const data = await res.json();

    const places: OverpassPlace[] = (data.elements as any[])
        .filter((el) => el.tags?.name && (el.lat || el.center?.lat) && (el.lon || el.center?.lon))
        .slice(0, limit)
        .map((el) => {
            const category =
                categories.find((cat) => {
                    const tags = el.tags || {};

                    if (cat === "tourism") return tags.tourism;
                    if (cat === "gastronomy") return ["restaurant", "cafe", "fast_food"].includes(tags.amenity);
                    if (cat === "nature") return tags.leisure;
                    if (cat === "culture") return ["museum", "gallery"].includes(tags.tourism);
                    if (cat === "nightlife") return ["bar", "pub", "nightclub"].includes(tags.amenity);
                    if (cat === "shopping") return tags.shop;
                    if (cat === "sport") return tags.leisure;
                    if (cat === "wellness") return ["spa", "clinic"].includes(tags.amenity);

                    return false;
                }) ?? categories[0];

            return {
                id: `${category}-${el.type}-${el.id}`,
                lat: el.lat ?? el.center.lat,
                lon: el.lon ?? el.center.lon,
                name: el.tags.name,
                category,
            };
        });

    cache.set(cacheKey, places);
    return places;
}
export function clearPlacesCache() {
    cache.clear();
}