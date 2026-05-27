import type { CountryResult } from "../types/planning.types";

const ASP_API_BASE_URL = "/api/countries";

export async function searchCountries(
    query: string
): Promise<CountryResult[]> {
    const cleanQuery = query.trim();

    if (!cleanQuery) return [];

    try {
        const res = await fetch(
            `${ASP_API_BASE_URL}/search?query=${encodeURIComponent(cleanQuery)}`
        );

        if (!res.ok) return [];

        const data: CountryResult[] = await res.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error al conectar con el servidor ASP:", error);
        return [];
    }
}