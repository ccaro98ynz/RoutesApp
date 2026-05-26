export interface StateResult {
    name: string;
    state_code?: string;
}

export interface CityResult {
    name: string;
}

const BASE_URL = "https://countriesnow.space/api/v0.1";

export async function fetchStatesByCountry(countryName: string): Promise<StateResult[]> {
    const res = await fetch(`${BASE_URL}/countries/states`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            country: countryName,
        }),
    });

    if (!res.ok) {
        throw new Error("Error consultando estados");
    }

    const data = await res.json();

    return data.data?.states ?? [];
}

export async function fetchCitiesByState(
    countryName: string,
    stateName: string
): Promise<string[]> {
    const res = await fetch(`${BASE_URL}/countries/state/cities`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            country: countryName,
            state: stateName,
        }),
    });

    if (!res.ok) {
        throw new Error("Error consultando ciudades");
    }

    const data = await res.json();

    return data.data ?? [];
}