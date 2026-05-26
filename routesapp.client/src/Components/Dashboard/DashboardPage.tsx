import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import {
    fetchCustomerRoutes,
    removePlaceFromRoute,
    type DashboardRoute
} from "./services/dashboard.service";


const DashboardPage = () => {
    const navigate = useNavigate();

    const [routes, setRoutes] = useState<DashboardRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRouteId, setExpandedRouteId] = useState<number | null>(null);

    const customerName = localStorage.getItem("customerName") ?? "viajero";
    const customerId = Number(localStorage.getItem("customerId"));
    const handleRemovePlace = async (routeId: number, placeId: number) => {
        try {
            await removePlaceFromRoute(routeId, placeId);

            setRoutes((prev) =>
                prev.map((route) =>
                    route.idRoute === routeId
                        ? {
                            ...route,
                            places: route.places.filter((p) => p.idPlace !== placeId),
                        }
                        : route
                )
            );
        } catch (error) {
            console.error(error);
            alert("No se pudo quitar el lugar.");
        }
    };
    useEffect(() => {
        if (!customerId) {
            navigate("/login");
            return;
        }

        fetchCustomerRoutes(customerId)
            .then(setRoutes)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [customerId, navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const toggleRoute = (routeId: number) => {
        setExpandedRouteId((prev) => prev === routeId ? null : routeId);
    };

    return (
        <div className="db-wrapper">
            <aside className="db-sidebar">
                <div>
                    <a href="/dashboard" className="db-logo">
                        Ruta<span>Libre</span>
                    </a>

                    <button
                        className="db-btn-new"
                        onClick={() => navigate("/planning")}
                    >
                        ➕ Nueva Ruta
                    </button>
                </div>

                <button className="db-btn-logout" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </aside>

            <main className="db-main">
                <header className="db-header">
                    <div>
                        <span className="db-eyebrow">Tus rutas guardadas</span>
                        <h1>Hola, {customerName}</h1>
                        <p>Consulta tus itinerarios y lugares registrados.</p>
                    </div>
                </header>

                <section className="db-content-section">
                    {loading ? (
                        <p>Cargando rutas...</p>
                    ) : routes.length === 0 ? (
                        <div className="db-empty">
                            <h2>No tienes rutas guardadas</h2>
                            <p>Crea tu primera ruta para verla aquí.</p>
                            <button onClick={() => navigate("/planning")}>
                                Trazar nueva ruta
                            </button>
                        </div>
                    ) : (
                        <div className="db-routes-list">
                            {routes.map((route) => {
                                const expanded = expandedRouteId === route.idRoute;
                                const visiblePlaces = expanded
                                    ? route.places
                                    : route.places.slice(0, 4);

                                return (
                                    <article key={route.idRoute} className="db-route-card">
                                        <div className="db-route-card-header">
                                            <div>
                                                <h3>{route.places[0]?.city || "Ruta guardada"}</h3>
                                                <p>
                                                    {new Date(route.startDate).toLocaleDateString()} -{" "}
                                                    {new Date(route.endDate).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="db-route-meta">
                                                <span>{route.totalGuests} viajeros</span>
                                                <span>{route.places.length} lugares</span>
                                            </div>
                                        </div>
                                        <div className="db-route-places">
                                            {visiblePlaces.map((place) => (
                                                <span key={place.idPlace} className="db-place-pill">
                                                    📍 {place.name}

                                                    {expanded && (
                                                        <button
                                                            className="db-remove-place-btn"
                                                            onClick={() => handleRemovePlace(route.idRoute, place.idPlace)}
                                                            title="Quitar de la ruta"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>

                                        {route.places.length > 4 && (
                                            <button
                                                className="db-expand-btn"
                                                onClick={() => toggleRoute(route.idRoute)}
                                            >
                                                {expanded
                                                    ? "Ver menos"
                                                    : `Ver ruta completa (+${route.places.length - 4})`}
                                            </button>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default DashboardPage;