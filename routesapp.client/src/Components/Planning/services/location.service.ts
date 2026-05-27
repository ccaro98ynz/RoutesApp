export interface StateResult {
    name: string;
    state_code?: string;
}

export interface CityResult {
    name: string;
}

// Cambia esto por el puerto local real de tu backend de ASP.NET
const ASP_API_BASE_URL = "/api/locations";

export async function fetchStatesByCountry(countryName: string): Promise<StateResult[]> {
    if (!countryName.trim()) return [];

    const res = await fetch(`${ASP_API_BASE_URL}/states`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            countryName: countryName, // Estructura que espera nuestro DTO de C#
        }),
    });

    if (!res.ok) {
        throw new Error("Error consultando estados desde el servidor ASP");
    }

    return await res.json();
}

export async function fetchCitiesByState(
    countryName: string,
    stateName: string
): Promise<string[]> {
    if (!countryName.trim() || !stateName.trim()) return [];

    const res = await fetch(`${ASP_API_BASE_URL}/cities`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            countryName: countryName,
            stateName: stateName, // Estructura que espera nuestro DTO de C#
        }),
    });

    if (!res.ok) {
        throw new Error("Error consultando ciudades desde el servidor ASP");
    }

    return await res.json();
}