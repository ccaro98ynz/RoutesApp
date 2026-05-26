import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

interface LoginForm {
    email: string;
    password: string;
}

interface FieldError {
    email?: string;
    password?: string;
    general?: string;
}

const LoginPage = () => {
    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [errors, setErrors] = useState<FieldError>({});
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); 

    const validate = (): boolean => {
        const e: FieldError = {};
        if (!form.email.includes("@")) e.email = "Correo electrónico inválido.";
        if (form.password.length < 1) e.password = "Ingresa tu contraseña.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined, general: undefined });
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({}); 

        try {
            const response = await fetch("https://localhost:7269/Customers/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                }),
            });

            if (!response.ok) {
                throw new Error("Credenciales inválidas");
            }
            const data = await response.json();
            if (data.id) {
                localStorage.setItem("customerId", data.id);
                localStorage.setItem("customerName", data.nombre);
            }
            navigate("/dashboard");

        } catch (error) {
            setErrors({ general: (error as Error).message });
        } finally {
            setLoading(false);

        }
    };

    return (
        <div className="lp-wrapper">
            {/* PANEL DECORATIVO DERECHO */}
            <div className="lp-right">
                <a href="/" className="lp-logo">Ruta<span>Libre</span></a>

                <div className="lp-right-content">
                    <div className="lp-right-eyebrow">De regreso al camino</div>
                    <h2>
                        Tu próxima ruta<br />
                        te <em>está esperando</em>
                    </h2>
                    <p>
                        Inicia sesión y retoma donde lo dejaste. Tus rutas guardadas,
                        preferencias y destinos favoritos te están esperando.
                    </p>
                </div>

                <div className="lp-right-footer">
                    © {new Date().getFullYear()} RutaLibre
                </div>
            </div>

            {/* PANEL DE FORMULARIO IZQUIERDO */}
            <div className="lp-left">
                <div className="lp-form-box">
                    <h1 className="lp-form-title">Iniciar sesión</h1>
                    <p className="lp-form-sub">
                        ¿No tienes cuenta?{" "}
                        <a href="/signup">Regístrate gratis</a>
                    </p>

                    {errors.general && (
                        <div className="lp-general-error">⚠️ {errors.general}</div>
                    )}

                    {/* EMAIL */}
                    <div className="lp-field">
                        <label className="lp-label" htmlFor="email">Correo electrónico</label>
                        <div className="lp-input-wrap">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={`lp-input${errors.email ? " is-error" : ""}`}
                                placeholder="correo@ejemplo.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>
                        {errors.email && <div className="lp-error">{errors.email}</div>}
                    </div>

                    {/* PASSWORD */}
                    <div className="lp-field">
                        <label className="lp-label" htmlFor="password">Contraseña</label>
                        <div className="lp-input-wrap">
                            <input
                                id="password"
                                name="password"
                                type={showPass ? "text" : "password"}
                                className={`lp-input${errors.password ? " is-error" : ""}`}
                                placeholder="Tu contraseña"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                style={{ paddingRight: "2.5rem" }}
                            />
                            <button
                                type="button"
                                className="lp-input-icon"
                                onClick={() => setShowPass(!showPass)}
                                aria-label="Mostrar contraseña"
                            >
                                {showPass ? "🙈" : "👁️"}
                            </button>
                        </div>
                        {errors.password && <div className="lp-error">{errors.password}</div>}
                        <a href="/forgot-password" className="lp-forgot">¿Olvidaste tu contraseña?</a>
                    </div>

                    <button
                        className="btn-submit"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading && <span className="lp-spinner" />}
                        {loading ? "Entrando..." : "Iniciar sesión"}
                    </button>

                    <div className="lp-register-cta">
                        ¿Primera vez aquí?{" "}
                        {/* Corregido de /register a /signup */}
                        <a href="/signup">Crea tu cuenta gratis →</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;