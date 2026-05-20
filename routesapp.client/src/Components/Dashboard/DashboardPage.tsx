import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const DashboardPage = () => {
    // Inicializamos el hook de React Router
    const navigate = useNavigate();

    return (
        <div className="db-wrapper">
            {/* SIDEBAR */}
            <aside className="db-sidebar">
                <div className="db-sidebar-top">
                    <a href="/dashboard" className="db-logo">Ruta<span>Libre</span></a>
                    <nav className="db-nav">
                        <a href="/dashboard" className="db-nav-item active">🗺️ Mis Rutas</a>
                        <a href="/dashboard/profile" className="db-nav-item">👤 Mi Perfil</a>
                        <a href="/dashboard/interests" className="db-nav-item">✨ Preferencias</a>
                    </nav>
                </div>
                <div className="db-sidebar-footer">
                    {/* Reemplazo de window.location.href por navigate */}
                    <button className="db-btn-logout" onClick={() => navigate("/login")}>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="db-main">
                <header className="db-header">
                    <div className="db-welcome">
                        <span className="db-eyebrow">Panel de Control</span>
                        <h1>¡Hola de nuevo!</h1>
                    </div>
                    {/* Enlace a la PlanningPage usando React Router */}
                    <button className="db-btn-primary" onClick={() => navigate("/planning")}>
                        ➕ Trazar Nueva Ruta
                    </button>
                </header>

                {/* METRICAS / WIDGETS */}
                <section className="db-stats-grid">
                    <div className="db-stat-card"><h3>0</h3><p>Rutas creadas</p></div>
                    <div className="db-stat-card"><h3>0</h3><p>Lugares visitados</p></div>
                    <div className="db-stat-card"><h3>Premium</h3><p>Tipo de cuenta</p></div>
                </section>

                {/* ESPACIO PARA RENDERIZAR RUTAS DINÁMICAS */}
                <section className="db-content-section">
                    <h2 className="db-section-title">Mis Itinerarios Guardados</h2>
                    <div className="db-routes-list">
                        {/* Mapeo de la API aquí */}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardPage;