import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Welcome.css"; 

const WelcomePage = () => {
   
    const [showHomeBtn, setShowHomeBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowHomeBtn(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const destinations = [
        {
            icon: "🏔️",
            title: "Aventura Natural",
            desc: "Rutas por montañas, selvas y paisajes salvajes.",
            tag: "Naturaleza",
        },
        {
            icon: "🏙️",
            title: "Explorador Urbano",
            desc: "Ciudades vibrantes, gastronomía y cultura.",
            tag: "Ciudad",
        },
        {
            icon: "🏖️",
            title: "Paraíso de Playa",
            desc: "Sol, arena y destinos costeros soñados.",
            tag: "Playa",
        },
        {
            icon: "🏛️",
            title: "Viajero Cultural",
            desc: "Historia, museos y patrimonio del mundo.",
            tag: "Cultura",
        },
    ];
    return (
        <>
            {/* NAVBAR */}
            <nav>
                <div className="wp-nav-logo">
                    Ruta<span>Libre</span>
                </div>
                <div className="wp-nav-actions">
                    <Link to="/login" className="btn-login"> Iniciar sesión</Link>
                    <Link to="/signup" className="btn-register">Registrarse</Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="wp-hero">
                <div className="wp-hero-eyebrow">Tu viaje, tu historia</div>
                <h1>
                    Descubre rutas <em>hechas</em>
                    <br />
                    para ti
                </h1>
                <p>
                    Cuéntanos qué tipo de viajero eres y te trazaremos el camino
                    perfecto hacia donde quieras ir.
                </p>
                <button className="btn-cta">Empezar mi ruta</button>
                <div className="wp-hero-scroll">
                    <span>Descubrir</span>
                    <span>↓</span>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="wp-section">
                <div className="container">
                    <div className="wp-section-label">Cómo funciona</div>
                    <h2 className="wp-section-title">
                        Tres pasos hacia
                        <br />
                        tu aventura
                    </h2>
                    <p className="wp-section-sub">
                        Sin planificación interminable. Solo tus preferencias y una
                        ruta personalizada lista para explorar.
                    </p>

                    <div className="wp-steps">
                        {[
                            {
                                n: "01",
                                title: "Cuéntanos tus gustos",
                                desc: "Elige el tipo de experiencia que buscas: naturaleza, ciudad, playa o cultura.",
                            },
                            {
                                n: "02",
                                title: "Recibe tu ruta",
                                desc: "Nuestro sistema genera un itinerario personalizado con los mejores destinos para ti.",
                            },
                            {
                                n: "03",
                                title: "Explora sin límites",
                                desc: "Guarda tu ruta, compártela y adáptala según evolucione tu viaje.",
                            },
                        ].map((s) => (
                            <div className="wp-step" key={s.n}>
                                <div className="wp-step-num">{s.n}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DESTINATIONS */}
            <section className="wp-destinations">
                <div className="container">
                    <div className="wp-section-label">¿Qué tipo de viajero eres?</div>
                    <h2 className="wp-section-title">
                        Elige tu
                        <br />
                        estilo de aventura
                    </h2>
                    <p className="wp-section-sub">
                        Cada viajero es único. Encuentra el perfil que más se acerca a
                        tu forma de explorar el mundo.
                    </p>

                    <div className="wp-dest-grid">
                        {destinations.map((d) => (
                            <div className="wp-dest-card" key={d.title}>
                                <div className="wp-dest-icon">{d.icon}</div>
                                <div>
                                    <div className="wp-dest-tag">{d.tag}</div>
                                    <h3>{d.title}</h3>
                                    <p>{d.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="wp-cta-section">
                <div className="container">
                    <h2>
                        Tu próxima aventura
                        <br />
                        te <em>espera</em>
                    </h2>
                    <p>Crea una cuenta gratis y empieza a trazar tu camino hoy.</p>
                    <button className="btn-register" style={{ fontSize: "0.95rem", padding: "0.85rem 2.5rem" }}
                    >
                        Crear cuenta gratis
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="wp-footer">
                © {new Date().getFullYear()} RutaLibre — Todos los derechos reservados
            </footer>

            {/* HOME BUTTON */}
            <button
                className={`wp-home-btn${showHomeBtn ? " visible" : ""}`}
                onClick={scrollToTop}
                aria-label="Volver al inicio"
                title="Inicio"
            >
                🏠
            </button>
        </>
    );
};

export default WelcomePage;
