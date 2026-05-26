import type { OverpassPlace } from "./place.service";

const ASP_API_BASE_URL = "https://localhost:7269/api/routes";

export interface CreateRouteDTO {
    idCustomer: number;
    startDate: string;
    endDate: string;
    travelerType: string;
    totalGuests: number;
    interestIds: number[];
    places: CreateRoutePlaceDTO[];
}

export interface CreateRoutePlaceDTO {
    idExternal: string;
    latitude: number;
    longitude: number;
    addressLine: string;
    city: string;
    postalCode: string;
    countryCode: string;
}

export async function createRoute(payload: CreateRouteDTO): Promise<{ routeId: number }> {
    const res = await fetch(ASP_API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al registrar la ruta");
    }

    return await res.json();
}

export function mapPlacesToRouteDTO(
    places: OverpassPlace[],
    selectedCity: string,
    countryCode: string
): CreateRoutePlaceDTO[] {
    return places.map((p) => ({
        idExternal: String(p.id),
        latitude: p.lat,
        longitude: p.lon,
        addressLine: p.name,
        city: selectedCity,
        postalCode: "",
        countryCode,
    }));
}