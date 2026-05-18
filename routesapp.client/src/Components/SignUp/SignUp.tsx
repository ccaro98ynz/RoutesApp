import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.css";

interface RegisterForm {
    name: string;
    last_name: string;
    phone_number: string;
    email: string;
    password: string;
    confirm: string;
}

interface FieldError {
    name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
    password?: string;
    confirm?: string;
}

const SignUpPage = () => {
    const [form, setForm] = useState<RegisterForm>({
        name: "",
        last_name: "",
        phone_number: "",
        email: "",
        password: "",
        confirm: "",
    });
    const [errors, setErrors] = useState<FieldError>({});
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validate = (): boolean => {
        const e: FieldError = {};
        if (!form.name.trim()) e.name = "El nombre es requerido.";
        if (!form.last_name.trim()) e.last_name = "El apellido es requerido.";
        if (!/^\d{10}$/.test(form.phone_number)) e.phone_number = "Teléfono inválido (10 dígitos).";
        if (!form.email.includes("@")) e.email = "Correo electrónico inválido.";
        if (form.password.length < 8) e.password = "Mínimo 8 caracteres.";
        if (form.password !== form.confirm) e.confirm = "Las contraseñas no coinciden.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined });
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const response = await fetch("https://tu-api/api/Customer/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Name: form.name,
                    last_name: form.last_name,
                    phone_number: form.phone_number,
                    email: form.email,
                    password: form.password,
                }),
            });

            if (!response.ok) throw new Error("Error al registrar");
            setSubmitted(true);
        } catch {
            setErrors({ email: "Error al crear la cuenta. Intenta de nuevo." });
        }
    };

    const passwordStrength = (): { label: string; width: string; color: string } => {
        const p = form.password;
        if (p.length === 0) return { label: "", width: "0%", color: "transparent" };
        if (p.length < 6) return { label: "Débil", width: "25%", color: "#e05c2a" };
        if (p.length < 10) return { label: "Media", width: "55%", color: "#d4a82a" };
        return { label: "Fuerte", width: "100%", color: "#3d7a3e" };
    };

    const strength = passwordStrength();

    return (
        <div className="rp-wrapper">
            {/* LEFT */}
            <div className="rp-left">
                <a href="/" className="rp-logo">Ruta<span>Libre</span></a>
                <div className="rp-left-content">
                    <div className="rp-left-eyebrow">Únete a la comunidad</div>
                    <h2>Traza tu camino,<br /><em>viaja diferente</em></h2>
                    <p>
                        Crea tu cuenta y descubre rutas personalizadas según tus
                        preferencias. Cada viajero tiene su propia historia — la tuya
                        empieza aquí.
                    </p>
                </div>
                <div className="rp-left-footer">© {new Date().getFullYear()} RutaLibre</div>
            </div>

            {/* RIGHT */}
            <div className="rp-right">
                <div className="rp-form-box">
                    {!submitted ? (
                        <>
                            <h1 className="rp-form-title">Crear cuenta</h1>
                            <p className="rp-form-sub">
                                ¿Ya tienes una cuenta?{" "}
                                <a href="/login">Inicia sesión</a>
                            </p>

                            {/* NAME */}
                            <div className="rp-field">
                                <label className="rp-label" htmlFor="name">Nombre</label>
                                <div className="rp-input-wrap">
                                    <input
                                        id="name" name="name" type="text"
                                        className={`rp-input${errors.name ? " is-error" : ""}`}
                                        placeholder="Tu nombre"
                                        value={form.name}
                                        onChange={handleChange}
                                        autoComplete="given-name"
                                    />
                                </div>
                                {errors.name && <div className="rp-error">{errors.name}</div>}
                            </div>

                            {/* LAST NAME */}
                            <div className="rp-field">
                                <label className="rp-label" htmlFor="last_name">Apellido</label>
                                <div className="rp-input-wrap">
                                    <input
                                        id="last_name" name="last_name" type="text"
                                        className={`rp-input${errors.last_name ? " is-error" : ""}`}
                                        placeholder="Tu apellido"
                                        value={form.last_name}
                                        onChange={handleChange}
                                        autoComplete="family-name"
                                    />
                                </div>
                                {errors.last_name && <div className="rp-error">{errors.last_name}</div>}
                            </div>

                            {/* PHONE */}
                            <div className="rp-field">
                                <label className="rp-label" htmlFor="phone_number">Teléfono</label>
                                <div className="rp-input-wrap">
                                    <input
                                        id="phone_number" name="phone_number" type="tel"
                                        className={`rp-input${errors.phone_number ? " is-error" : ""}`}
                                        placeholder="10 dígitos"
                                        value={form.phone_number}
                                        onChange={handleChange}
                                        maxLength={10}
                                        autoComplete="tel"
                                    />
                                </div>
                                {errors.phone_number && <div className="rp-error">{errors.phone_number}</div>}
                            </div>

                            {/* EMAIL */}
                            <div className="rp-field">
                                <label className="rp-label" htmlFor="email">Correo electrónico</label>
                                <div className="rp-input-wrap">
                                    <input
                                        id="email" name="email" type="email"
                                        className={`rp-input${errors.email ? " is-error" : ""}`}
                                        placeholder="correo@ejemplo.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && <div className="rp-error">{errors.email}</div>}
                            </div>

                            {/* PASSWORD */}
                            <div className="rp-field">
                                <label className="rp-label" htmlFor="password">Contraseña</label>
                                <div className="rp-input-wrap">
                                    <input
                                        id="password" name="password"
                                        type={showPass ? "text" : "password"}
                                        className={`rp-input${errors.password ? " is-error" : ""}`}
                                        placeholder="Mínimo 8 caracteres"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        style={{ paddingRight: "2.5rem" }}
                                    />
                                    <button
                                        type="button" className="rp-input-icon"
                                        onClick={() => setShowPass(!showPass)}
                                        aria-label="Mostrar contraseña"
                                    >
                                        {showPass ? "🙈" : "👁️"}
                                    </button>
                                </div>
                                {form.password.length > 0 && (
                                    <>
                                        <div className="rp-strength-bar">
                                            <div className="rp-strength-fill"
                                                style={{ width: strength.width, background: strength.color }} />
                                        </div>
                                        <div className="rp-strength-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </div>
                                    </>
                                )}
                                {errors.password && <div className="rp-error">{errors.password}</div>}
                            </div>

                            {/* CONFIRM */}
                            <div className="rp-field">
                                <label className="rp-label" htmlFor="confirm">Confirmar contraseña</label>
                                <div className="rp-input-wrap">
                                    <input
                                        id="confirm" name="confirm"
                                        type={showConfirm ? "text" : "password"}
                                        className={`rp-input${errors.confirm ? " is-error" : ""}`}
                                        placeholder="Repite tu contraseña"
                                        value={form.confirm}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        style={{ paddingRight: "2.5rem" }}
                                    />
                                    <button
                                        type="button" className="rp-input-icon"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        aria-label="Mostrar confirmación"
                                    >
                                        {showConfirm ? "🙈" : "👁️"}
                                    </button>
                                </div>
                                {errors.confirm && <div className="rp-error">{errors.confirm}</div>}
                            </div>

                            <button className="btn-submit" onClick={handleSubmit}>
                                Crear cuenta
                            </button>
                        </>
                    ) : (
                        <div className="rp-success">
                            <div className="rp-success-icon">✅</div>
                            <h3>¡Bienvenido, {form.name}!</h3>
                            <p>Tu cuenta ha sido creada. Ahora puedes explorar rutas personalizadas.</p>
                            <button className="btn-submit" onClick={() => window.location.href = "/login"}>
                                Ir a Iniciar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;