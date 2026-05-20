import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface CountryResult {
    name: { common: string; official: string };
    cca2: string;         // código 2 letras — igual que tu BD
    flags: { svg: string; png: string };
    latlng: [number, number];
    capital?: string[];
    population: number;
    region: string;
    subregion?: string;
}

// ── Componente auxiliar: mueve el mapa cuando cambian las coords ───────────
const FlyToCountry = ({ latlng, zoom }: { latlng: [number, number]; zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(latlng, zoom, { duration: 1.8 });
    }, [latlng, zoom, map]);
    return null;
};

const PlanningPage = () => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<CountryResult[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<CountryResult | null>(null);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [travelerType, setTravelerType] = useState("pareja");
    const [budgetMode, setBudgetMode] = useState<"preset" | "exact">("preset");
    const [presetBudget, setPresetBudget] = useState("disfrutar");
    const [exactBudget, setExactBudget] = useState("");
    const [showDd, setShowDd] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState("");

    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Coordenadas del mapa — centro inicial en México
    const defaultCenter: [number, number] = [23.6345, -102.5528];
    const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
    const [mapZoom, setMapZoom] = useState(4);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setShowDd(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Busca países en RestCountries con debounce
    // 1. EL EFFECT DEL DEBOUNCE (Limpio y en su lugar)
    useEffect(() => {
        if (!query.trim()) { setSuggestions([]); return; }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setLoadingSuggest(true);
            try {
                const res = await fetch(
                    `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,cca2,flags,latlng,capital,population,region,subregion`
                );
                if (!res.ok) { setSuggestions([]); return; }
                const data: CountryResult[] = await res.json();
                setSuggestions(data.slice(0, 6));
                setShowDd(true);
            } catch {
                setSuggestions([]);
            } finally {
                setLoadingSuggest(false);
            }
        }, 350);
    }, [query]);
    const handleSelectCountry = (country: CountryResult) => {
        setSelectedCountry(country);
        setQuery(country.name.common);
        setShowDd(false);
        if (country.latlng?.length >= 2) {
            setMapCenter([country.latlng[0], country.latlng[1]]);
            setMapZoom(5);
        }
    }; 
    const handleGenerate = async () => {
        setGenError("");
        if (!selectedCountry) { setGenError("Selecciona un país destino."); return; }

      

        setGenerating(true);
        try {
            const res = await fetch(
                `https://localhost:7269/countries/search?query=${encodeURIComponent(query)}`
            );

            if (!res.ok) { setSuggestions([]); return; }

            const data: CountryResult[] = await res.json();
            setSuggestions(data.slice(0, 6));
            setShowDd(true);
        } catch {
            setGenError("Error al generar el itinerario. Intenta de nuevo.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

            {/* ── PANEL IZQUIERDO ── */}
            <aside style={{
                width: 440, background: "#f5ede0", padding: "2.5rem 2rem",
                zIndex: 10, boxShadow: "2px 0 15px rgba(0,0,0,.07)",
                overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.75rem",
            }}>
                <div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: "#8c7355" }}>
                        Nueva ruta
                    </span>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2c2723", fontSize: "1.8rem", margin: "4px 0 0" }}>
                        Diseña tu próximo destino
                    </h2>
                </div>

                {/* 1. BUSCADOR DE PAÍS */}
                <div ref={searchRef} style={{ position: "relative" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#6b5a47", display: "block", marginBottom: 6 }}>
                        ¿A dónde quieres ir?
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setSelectedCountry(null); }}
                            onFocus={() => suggestions.length > 0 && setShowDd(true)}
                            placeholder="Busca un país..."
                            autoComplete="off"
                            style={{
                                width: "100%", padding: "0.65rem 2.5rem 0.65rem 0.9rem",
                                border: "1px solid rgba(196,168,130,.5)", borderRadius: 4,
                                fontSize: "0.9rem", background: "#fff", color: "#2c2723",
                                outline: "none",
                            }}
                        />
                        {loadingSuggest && (
                            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "#8c7355" }}>
                                ⏳
                            </span>
                        )}
                    </div>

                    {/* Dropdown sugerencias */}
                    {showDd && suggestions.length > 0 && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                            background: "#fff", border: "1px solid rgba(196,168,130,.3)",
                            borderRadius: 4, zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,.1)",
                            maxHeight: 260, overflowY: "auto",
                        }}>
                            {suggestions.map((c) => (
                                <div
                                    key={c.cca2}
                                    onClick={() => handleSelectCountry(c)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "0.65rem 0.9rem", cursor: "pointer",
                                        borderBottom: "1px solid rgba(196,168,130,.1)",
                                        fontSize: "0.88rem", color: "#2c2723",
                                        transition: "background .15s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f6f2")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                                >
                                    <img src={c.flags.png} alt="" style={{ width: 24, height: 16, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>{c.name.common}</span>
                                    <span style={{
                                        fontSize: "0.72rem", fontWeight: 700, color: "#6b5a47",
                                        background: "rgba(196,168,130,.2)", padding: "2px 7px", borderRadius: 3,
                                    }}>{c.cca2}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info del país seleccionado */}
                {selectedCountry && (
                    <div style={{
                        background: "#fff", border: "1px solid rgba(196,168,130,.3)",
                        borderRadius: 4, padding: "1rem", display: "flex", gap: 12, alignItems: "flex-start",
                    }}>
                        <img src={selectedCountry.flags.svg} alt={selectedCountry.name.common} style={{ width: 48, height: 32, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />
                        <div style={{ fontSize: "0.82rem", color: "#6b5a47", lineHeight: 1.6 }}>
                            <strong style={{ fontSize: "0.95rem", color: "#2c2723", display: "block" }}>{selectedCountry.name.common}</strong>
                            {selectedCountry.capital && <span>🏛 Capital: {selectedCountry.capital[0]} &nbsp;</span>}
                            <span>🌍 {selectedCountry.region}{selectedCountry.subregion ? ` · ${selectedCountry.subregion}` : ""}</span><br />
                            <span>👥 {selectedCountry.population.toLocaleString()} hab.</span>
                        </div>
                    </div>
                )}

                {/* 2. ACOMPAÑANTES */}
                <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#6b5a47", display: "block", marginBottom: 8 }}>
                        ¿Con quién viajas?
                    </label>
                    <div style={{ display: "flex", gap: 6, background: "rgba(196,168,130,.15)", padding: "0.4rem", borderRadius: 4 }}>
                        {[
                            { key: "solo", label: "🧳 Solo" },
                            { key: "pareja", label: "💑 Pareja" },
                            { key: "familia", label: "👨‍👩‍👧 Familia" },
                            { key: "amigos", label: "🍻 Amigos" },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTravelerType(key)}
                                style={{
                                    flex: 1, padding: "0.55rem 0.25rem", border: "none", borderRadius: 3,
                                    fontSize: "0.8rem", cursor: "pointer", transition: "all .2s",
                                    background: travelerType === key ? "#2c2723" : "transparent",
                                    color: travelerType === key ? "#f5ede0" : "#2c2723",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. PRESUPUESTO */}
                <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#6b5a47", display: "block", marginBottom: 8 }}>
                        Presupuesto
                    </label>

                    {budgetMode === "preset" ? (
                        <>
                            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                                {[
                                    { key: "economico", label: "🎒 Económico" },
                                    { key: "disfrutar", label: "🥂 Disfrutar" },
                                    { key: "premium", label: "💎 Premium" },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setPresetBudget(key)}
                                        style={{
                                            flex: 1, padding: "0.65rem 0.25rem",
                                            border: `1px solid ${presetBudget === key ? "#c4a882" : "rgba(196,168,130,.3)"}`,
                                            borderRadius: 4, fontSize: "0.8rem", cursor: "pointer",
                                            background: presetBudget === key ? "rgba(196,168,130,.15)" : "transparent",
                                            color: "#2c2723", transition: "all .2s",
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setBudgetMode("exact")}
                                style={{ background: "none", border: "none", color: "#e05c2a", fontSize: "0.78rem", cursor: "pointer", padding: 0 }}
                            >
                                Ingresar cantidad exacta en MXN →
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "#6b5a47", fontWeight: 600 }}>$</span>
                                <input
                                    type="number"
                                    placeholder="Ej. 15000"
                                    value={exactBudget}
                                    onChange={(e) => setExactBudget(e.target.value)}
                                    style={{
                                        width: "100%", padding: "0.65rem 3rem 0.65rem 1.8rem",
                                        border: "1px solid rgba(196,168,130,.5)", borderRadius: 4,
                                        fontSize: "0.9rem", background: "#fff", color: "#2c2723", outline: "none",
                                    }}
                                />
                                <span style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "#6b5a47", fontWeight: 700 }}>MXN</span>
                            </div>
                            <button
                                onClick={() => setBudgetMode("preset")}
                                style={{ background: "none", border: "none", color: "#8c7355", fontSize: "0.78rem", cursor: "pointer", padding: 0, marginTop: 8 }}
                            >
                                ← Volver a perfiles de presupuesto
                            </button>
                        </>
                    )}
                </div>

                {genError && (
                    <p style={{ color: "#e05c2a", fontSize: "0.82rem", margin: 0 }}>{genError}</p>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{
                        background: generating ? "#8c7355" : "#2c2723",
                        color: "#f5ede0", border: "none", padding: "0.9rem 1.5rem",
                        borderRadius: 4, fontSize: "0.95rem", fontWeight: 500,
                        cursor: generating ? "not-allowed" : "pointer",
                        transition: "background .2s", marginTop: "auto",
                    }}
                >
                    {generating ? "Generando..." : "✨ Generar Itinerario Personalizado"}
                </button>
            </aside>

            {/* ── PANEL DERECHO: MAPA ── */}
            <main style={{ flex: 1, position: "relative" }}>
                <MapContainer
                    center={defaultCenter}
                    zoom={4}
                    style={{ width: "100%", height: "100%" }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Vuela al país seleccionado */}
                    <FlyToCountry latlng={mapCenter} zoom={mapZoom} />

                    {/* Marker del país */}
                    {selectedCountry && (
                        <Marker position={[selectedCountry.latlng[0], selectedCountry.latlng[1]]}>
                            <Popup>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 160 }}>
                                    <img src={selectedCountry.flags.svg} alt="" style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 4, marginBottom: 6 }} />
                                    <strong style={{ fontSize: "0.95rem" }}>{selectedCountry.name.common}</strong><br />
                                    <span style={{ fontSize: "0.8rem", color: "#6b5a47" }}>
                                        {selectedCountry.capital?.[0] && `🏛 ${selectedCountry.capital[0]}`}<br />
                                        📍 {selectedCountry.latlng[0].toFixed(2)}, {selectedCountry.latlng[1].toFixed(2)}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Overlay cuando no hay país seleccionado */}
                {!selectedCountry && (
                    <div style={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                        background: "rgba(255,255,255,.85)", backdropFilter: "blur(4px)",
                        padding: "1rem 1.5rem", borderRadius: 6, textAlign: "center",
                        color: "#6b5a47", fontSize: "0.9rem", pointerEvents: "none", zIndex: 500,
                        boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                    }}>
                        🗺️ Busca un país para centrarte en él
                    </div>
                )}
            </main>
        </div>
    );
};

export default PlanningPage;