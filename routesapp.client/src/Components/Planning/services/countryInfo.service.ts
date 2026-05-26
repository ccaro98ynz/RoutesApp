import type { CountryResult } from "../types/planning.types";

const REST_COUNTRIES_BASE_URL = "https://restcountries.com/v3.1";

export async function searchCountries(
    query: string
): Promise<CountryResult[]> {
    const cleanQuery = query.trim();

    if (!cleanQuery) return [];

    const res = await fetch(
        `${REST_COUNTRIES_BASE_URL}/name/${encodeURIComponent(
            cleanQuery
        )}?fields=name,cca2,flags,latlng,capital,population`
    );

    if (!res.ok) return [];

    const data: CountryResult[] = await res.json();

    return data.slice(0, 6);
}