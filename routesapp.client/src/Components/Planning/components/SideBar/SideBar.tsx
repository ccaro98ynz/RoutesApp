import "./SideBar.css";
import "./PlaceCategories.css";
import type { CountryResult, TravelerKey } from "../../types/planning.types.ts";
import type { StateResult } from "../../services/location.service.ts";
import { travelerOptions } from "../../constants/planning.constants";
import {
    placeCategoryOptions,
    type PlaceCategoryKey,
} from "../../constants/planning.constants";

// ── Helpers de fecha ─────────────────────────────────────────────────────────
const toDateStr = (d: Date) => d.toISOString().split("T")[0];
const today = () => toDateStr(new Date());


interface SideBarProps {
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    suggestions: CountryResult[];
    selectedCountry: CountryResult | null;
    loadingSuggest: boolean;
    showDd: boolean;
    setShowDd: React.Dispatch<React.SetStateAction<boolean>>;
    searchRef: React.RefObject<HTMLDivElement | null>;
    handleSelectCountry: (country: CountryResult) => void;
    startDate: string;
    setStartDate: React.Dispatch<React.SetStateAction<string>>;
    endDate: string;
    setEndDate: React.Dispatch<React.SetStateAction<string>>;
    travelerType: TravelerKey;
    setTravelerType: React.Dispatch<React.SetStateAction<TravelerKey>>;
    totalGuests: number;
    setTotalGuests: React.Dispatch<React.SetStateAction<number>>;
    generating: boolean;
    genError: string;
    handleGenerate: () => void;
    states: StateResult[];
    cities: string[];
    selectedState: string;
    setSelectedState: React.Dispatch<React.SetStateAction<string>>;
    selectedCity: string;
    setSelectedCity: React.Dispatch<React.SetStateAction<string>>;
    /** Categorías seleccionadas — controlado desde el padre */
    selectedCategories?: PlaceCategoryKey[];
    setSelectedCategories?: React.Dispatch<React.SetStateAction<PlaceCategoryKey[]>>;
}

function SideBar({
    query, setQuery, suggestions, selectedCountry, loadingSuggest,
    showDd, setShowDd, searchRef, handleSelectCountry,
    startDate, setStartDate, endDate, setEndDate,
    travelerType, setTravelerType,
    totalGuests, setTotalGuests,
    generating, genError, handleGenerate,
    states, cities, selectedState, setSelectedState, selectedCity, setSelectedCity,
    selectedCategories = [],
    setSelectedCategories = () => { },
}: SideBarProps) {

    // ── Validación de fechas ────────────────────────────────────────────────
    const dateInvalid = startDate && endDate && startDate >= endDate;

    // ── Toggle de categoría ────────────────────────────────────────────────
    const toggleCategory = (key: PlaceCategoryKey) => {
        setSelectedCategories((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    return (
        <aside className="planner-sidebar">
            <div className="planner-header">
                <span className="planner-brand">Omawe</span>
                <h2 className="planner-title">Explora el mundo a tu medida</h2>
            </div>

            {/* ── Destino ─────────────────────────────────────────────────── */}
            <div className="planner-section dynamic-search-zone" ref={searchRef}>
                <label className="section-label">¿A dónde quieres ir?</label>
                <div className="search-input-wrapper">
                    <input
                        className="search-place"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowDd(true)}
                        placeholder="Busca un país..."
                        autoComplete="off"
                    />
                    {loadingSuggest && <span className="search-loader">⏳</span>}
                </div>

                {/* ── Dropdown de Sugerencias Corregido ── */}
                {showDd && suggestions.length > 0 && (
                    <div className="search-dropdown" style={{ display: 'block', zIndex: 9999 }}>
                        {suggestions.map((c) => {
                            const flagUrl = c.flags?.png || c.flags?.svg || "";
                            const countryName = c.name?.common || "País desconocido";
                            const countryCode = c.cca2 || "";

                            return (
                                <div
                                    key={countryCode || countryName}
                                    className="search-option"
                                    onClick={() => handleSelectCountry(c)}
                                >
                                    {flagUrl && <img src={flagUrl} alt="" className="search-option-flag" />}
                                    <span className="search-option-name">{countryName}</span>
                                    <span className="search-option-code">{countryCode}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Si el usuario escribió algo, no está cargando y el array está vacío */}
                {showDd && query.trim() && suggestions.length === 0 && !loadingSuggest && (
                    <div className="search-dropdown">
                        <div className="search-empty">No se encontraron países</div>
                    </div>
                )}

                {/* Tarjeta de país seleccionado (¡Cierre Corregido aquí!) */}
                {selectedCountry && (
                    <div className="selected-country-card">
                        <img src={selectedCountry.flags.svg || selectedCountry.flags.png} alt="" className="selected-country-flag" />
                        <div className="selected-country-info">
                            <strong className="selected-country-name">{selectedCountry.name.common}</strong>
                            <span className="selected-country-meta">
                                👥 {(selectedCountry.population / 1_000_000).toFixed(1)}M hab.
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Estado / Ciudad ─────────────────────────────────────────── */}
            {selectedCountry && (
                <div className="planner-section location-inline-grid">
                    <div className="field-group">
                        <span className="field-label">Estado</span>
                        <select
                            className="location-select"
                            value={selectedState}
                            onChange={(e) => {
                                setSelectedState(e.target.value);
                                setSelectedCity("");
                            }}
                        >
                            <option value="">— Selecciona —</option>
                            {states.map((s) => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field-group">
                        <span className="field-label">Ciudad</span>
                        <select
                            className="location-select"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            disabled={!selectedState || cities.length === 0}
                        >
                            <option value="">— Selecciona —</option>
                            {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* ── Fechas + Viajeros ───────────────────────────────────────── */}
            <div className="planner-section dates-guests-row">
                <div className="date-field">
                    <span className="field-label">Salida</span>
                    <input
                        type="date"
                        className={`date-input${dateInvalid ? " date-input--error" : ""}`}
                        value={startDate}
                        min={today()}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="date-field">
                    <span className="field-label">Regreso</span>
                    <input
                        type="date"
                        className={`date-input${dateInvalid ? " date-input--error" : ""}`}
                        value={endDate}
                        min={startDate || today()}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="guests-field">
                    <span className="field-label">Viajeros</span>
                    <div className="guests-counter">
                        <button type="button" className="guests-btn" onClick={() => setTotalGuests(Math.max(1, totalGuests - 1))} disabled={totalGuests <= 1}>−</button>
                        <span className="guests-value">{totalGuests}</span>
                        <button type="button" className="guests-btn" onClick={() => setTotalGuests(totalGuests + 1)}>+</button>
                    </div>
                </div>
            </div>

            {/* ── Advertencia de fechas ──────────────────────────────────── */}
            {dateInvalid && (
                <div className="date-warning">
                    <span className="date-warning-icon">⚠️</span>
                    La fecha de regreso debe ser posterior a la de salida.
                </div>
            )}

            {/* ── Categorías de lugares ──────────────────────────────────── */}
            <div className="planner-section companion-zone">
                <label className="section-label">¿Qué quieres hacer?</label>
                <div className="place-categories-grid">
                    {/* Quitamos 'emoji' de la desestructuración ya que no lo usaremos */}
                    {placeCategoryOptions.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            className={`place-cat-chip${selectedCategories.includes(key) ? " active" : ""}`}
                            onClick={() => toggleCategory(key)}
                        >
                            {/* Dejamos únicamente el texto de la categoría */}
                            <span className="place-cat-label">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tipo de acompañante ────────────────────────────────────── */}
            <div className="planner-section companion-zone">
                <label className="section-label">¿Con quién viajas?</label>
                <div className="travelers-options">
                    {travelerOptions.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTravelerType(key)}
                            className={`traveler-btn ${travelerType === key ? "active" : ""}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <div className="planner-footer">
                {genError && <p className="generate-error">{genError}</p>}
                <button
                    onClick={handleGenerate}
                    disabled={generating || !!dateInvalid}
                    className={`generate-btn ${(generating || dateInvalid) ? "disabled" : ""}`}
                >
                    {generating ? "Generando…" : "Generar Itinerario"}
                </button>
            </div>
        </aside>
    );
}

export default SideBar;