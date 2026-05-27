const API_BASE_URL = "/api/routes";

export interface DashboardPlace {
    idPlace: number;
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    visitedAt: string;
}

export interface DashboardRoute {
    idRoute: number;
    startDate: string;
    endDate: string;
    travelerType: string;
    totalGuests: number;
    places: DashboardPlace[];
}

export async function fetchCustomerRoutes(customerId: number): Promise<DashboardRoute[]> {
    const res = await fetch(`${API_BASE_URL}/customer/${customerId}`);

    if (!res.ok) {
        throw new Error("Error cargando rutas");
    }

    return await res.json();
}
export async function removePlaceFromRoute(
    routeId: number,
    placeId: number
): Promise<void> {
    const res = await fetch(
        `${API_BASE_URL}/${routeId}/places/${placeId}`,
        {
            method: "DELETE",
        }
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error eliminando lugar de la ruta");
    }
}