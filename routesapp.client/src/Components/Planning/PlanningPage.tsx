import { useState, useEffect, useRef} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Planning.css";

const iconProto = L.Icon.Default.prototype as unknown as Record<string, unknown>;
delete iconProto._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


async function fetchCountryImages(countryName: string): Promise<CountryImage[]> {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(countryName)}&format=json&origin=*`;
    try {
        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) return [];
        const searchData = await searchRes.json();
        const page = searchData.query.search[0];
        if (!page) return [];
        const pageTitle = page.title;
        const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(pageTitle)}&format=json&imlimit=10&origin=*`;
        const imagesRes = await fetch(imagesUrl);
        if (!imagesRes.ok) return [];
        const imagesData = await imagesRes.json();
        const pages = imagesData.query.pages;
        const images: string[] = [];
        for (const key in pages) {
            if (pages[key].images) {
                for (const img of pages[key].images) {
                    if (/\.(jpg|jpeg|png)$/i.test(img.title)) {
                        images.push(img.title);
                    }
                }
            }
        }
        const imageInfoPromises = images.slice(0, 8).map(async (imgTitle) => {
            const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(imgTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
            const infoRes = await fetch(infoUrl);
            if (!infoRes.ok) return null;
            const infoData = await infoRes.json();
            const p = Object.values(infoData.query.pages)[0] as any;
            if (p?.imageinfo?.[0]) {
                return { id: imgTitle, url: p.imageinfo[0].url, label: imgTitle.replace(/^File:/, "") };
            }
            return null;
        });
        const imageInfos = await Promise.all(imageInfoPromises);
        return imageInfos.filter(Boolean) as CountryImage[];
    } catch {
        return [];
    }
}

const FlyToCountry = ({ latlng, zoom }: { latlng: [number, number]; zoom: number }) => {
    const map = useMap();
    useEffect(() => { map.flyTo(latlng, zoom, { duration: 1.8 }); }, [latlng, zoom, map]);
    return null;
};

const MapInvalidateSize = () => {
    const map = useMap();
    useEffect(() => {
        const container = map.getContainer();
        const observer = new ResizeObserver(() => { map.invalidateSize(); });
        observer.observe(container);
        return () => observer.disconnect();
    }, [map]);
    return null;
};


const PlanningPage = () => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<CountryResult[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<CountryResult | null>(null);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [travelerType, setTravelerType] = useState<TravelerKey>("pareja");
    const [budgetMode, setBudgetMode] = useState<"preset" | "exact">("preset");
    const [presetBudget, setPresetBudget] = useState<PresetBudgetKey>("disfrutar");
    const [exactBudget, setExactBudget] = useState("");
    const [showDd, setShowDd] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState("");
    const [images, setImages] = useState<CountryImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const defaultCenter: [number, number] = [23.6345, -102.5528];
    const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
    const [mapZoom, setMapZoom] = useState(4);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setShowDd(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            setSuggestions([]);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoadingSuggest(true);
            try {
                const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,cca2,flags,latlng,capital,population,region,subregion`);
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

    useEffect(() => {
        if (!selectedCountry) { setImages([]); return; }
        let mounted = true;
        setLoadingImages(true);
        setImages([]);
        fetchCountryImages(selectedCountry.name.common).then((imgs) => {
            if (mounted) setImages(imgs);
        }).finally(() => { if (mounted) setLoadingImages(false); });
        return () => { mounted = false; };
    }, [selectedCountry?.cca2]);

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
            const res = await fetch(`https://localhost:7269/countries/search?query=${encodeURIComponent(query)}`);
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
        <div className="planner-layout">

            {/* ══ PANEL IZQUIERDO ══ */}
            <aside className="planner-sidebar">

                <div className="planner-header">

                    <span className="planner-brand">
                        Omawe
                    </span>

                    <h2 className="planner-title">
                        Explora el mundo a tu medida
                    </h2>

                </div>

                {/* Buscador */}
                <div className="search-box" ref={searchRef}>

                    <label className="search-label">
                        ¿A dónde quieres ir?
                    </label>

                    <div className="search-input-wrapper">

                        <input
                            className="search-place"
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedCountry(null);
                            }}
                            onFocus={() => suggestions.length > 0 && setShowDd(true)}
                            placeholder="Busca un país..."
                            autoComplete="off"
                        />

                        {loadingSuggest && (
                            <span className="search-loader">
                                ⏳
                            </span>
                        )}
                    </div>

                    {showDd && query.trim() && !loadingSuggest && (
                        <div className="search-dropdown">

                            {suggestions.length > 0 ? (
                                suggestions.map((c) => (
                                    <div
                                        key={c.cca2}
                                        className="search-option"
                                        onClick={() => handleSelectCountry(c)}
                                    >
                                        <img
                                            src={c.flags.png}
                                            alt=""
                                            className="search-option-flag"
                                        />
                                        <span className="search-option-name">
                                            {c.name.common}
                                        </span>
                                        <span className="search-option-code">
                                            {c.cca2}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="search-empty">
                                    No se encontraron países
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* País seleccionado */}
                {selectedCountry && (
                    <div className="selected-country-card">

                        <img
                            src={selectedCountry.flags.svg}
                            alt=""
                            className="selected-country-flag"
                        />

                        <div className="selected-country-info">

                            <strong className="selected-country-name">
                                {selectedCountry.name.common}
                            </strong>

                            <span className="selected-country-meta">
                                🏛 {selectedCountry.capital?.[0] ?? "—"}
                                · 🌍 {selectedCountry.region}
                                · 👥 {(selectedCountry.population / 1_000_000).toFixed(1)}M
                            </span>

                        </div>

                    </div>
                )}

                {/* ¿Con quién viajas? */}
                <div className="travelers-section">

                    <label className="section-label">
                        ¿Con quién viajas?
                    </label>

                    <div className="travelers-options">

                        {travelerOptions.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTravelerType(key)}
                                className={`traveler-btn ${travelerType === key ? "active" : ""
                                    }`}
                            >
                                {label}
                            </button>
                        ))}

                    </div>
                </div>

                {/* Presupuesto */}
                <div className="budget-section">
                    <label className="section-label">
                        Presupuesto
                    </label>
                    {budgetMode === "preset" ? (
                        <>
                            <div className="budget-options">

                                {budgetOptions.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setPresetBudget(key)}
                                        className={`budget-btn ${presetBudget === key ? "active" : ""
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}

                            </div>
                            <button
                                onClick={() => setBudgetMode("exact")}
                                className="budget-link"
                            >
                                Ingresar cantidad exacta en MXN →
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="budget-input-wrapper">
                                <span className="budget-currency-left">
                                    $
                                </span>
                                <input
                                    type="number"
                                    placeholder="Ej. 15000"
                                    value={exactBudget}
                                    onChange={(e) => setExactBudget(e.target.value)}
                                    className="budget-input"
                                />

                                <span className="budget-currency-right">
                                    MXN
                                </span>

                            </div>
                            <button
                                onClick={() => setBudgetMode("preset")}
                                className="budget-link secondary"
                            >
                                ← Volver a perfiles de presupuesto
                            </button>
                        </>
                    )}
                </div>
                {genError && (
                    <p className="generate-error">
                        {genError}
                    </p>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className={`generate-btn ${generating ? "disabled" : ""
                        }`}
                >
                    {generating
                        ? "Generando…"
                        : "✨ Generar Itinerario Personalizado"}
                </button>
            </aside>

            {/* ══ PANEL DERECHO: Mapa compacto + Galería grande ══ */}
            <main className="planning-main-v2">

                {/* Mapa compacto */}
                <div className="planning-map-compact">
                    <MapContainer
                        center={defaultCenter} zoom={4}
                        style={{ width: "100%", height: "100%", zIndex: 1 }}
                        zoomControl={false}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution=""
                        />
                        <MapInvalidateSize />
                        <FlyToCountry latlng={mapCenter} zoom={mapZoom} />
                        {selectedCountry && (
                            <Marker position={[selectedCountry.latlng[0], selectedCountry.latlng[1]]}>
                                <Popup><strong>{selectedCountry.name.common}</strong></Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    {/* Overlay info */}
                    {selectedCountry ? (
                        <div className="planning-map-overlay">
                            <div className="planning-map-overlay__info">
                                <img src={selectedCountry.flags.svg} alt="" className="planning-map-overlay__flag" />
                                <div className="planning-map-overlay__text">
                                    <span className="planning-map-overlay__eyebrow">Destino seleccionado</span>
                                    <span className="planning-map-overlay__name">{selectedCountry.name.common}</span>
                                </div>
                            </div>
                            <div className="planning-map-overlay__pills">
                                <span className="planning-map-overlay__pill">{selectedCountry.region}</span>
                                {selectedCountry.subregion && <span className="planning-map-overlay__pill">{selectedCountry.subregion}</span>}
                            </div>
                        </div>
                    ) : (
                        <div className="planning-map-empty">
                            <div className="planning-map-empty__icon">🌍</div>
                            <div className="planning-map-empty__text">Selecciona un país para explorar</div>
                        </div>
                    )}
                </div>

                {/* Galería — el protagonista */}
                <div className="planning-gallery-section">
                    {selectedCountry ? (
                        <GalleryCarousel country={selectedCountry} images={images} loading={loadingImages} />
                    ) : (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#0e0c0b", color: "rgba(200,175,140,.5)" }}>
                            <span style={{ fontSize: "2.5rem", opacity: .3 }}>🖼️</span>
                            <p style={{ fontSize: "0.86rem", margin: 0, letterSpacing: ".02em" }}>Selecciona un país para ver su galería</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PlanningPage;
