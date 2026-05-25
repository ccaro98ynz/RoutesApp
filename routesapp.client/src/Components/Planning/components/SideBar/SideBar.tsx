import "./SideBar.css";
import type { CountryResult, TravelerKey } from "../../types/planning.types";
import { travelerOptions } from "../../constants/planning.constants.ts";

interface SideBarProps {
    // Búsqueda de país
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    suggestions: CountryResult[];
    selectedCountry: CountryResult | null;
    loadingSuggest: boolean;
    showDd: boolean;
    setShowDd: React.Dispatch<React.SetStateAction<boolean>>;
    searchRef: React.RefObject<HTMLDivElement | null>;
    handleSelectCountry: (country: CountryResult) => void;

    // Campos de Routes
    startDate: string;                                           // start_date
    setStartDate: React.Dispatch<React.SetStateAction<string>>;
    endDate: string;                                             // end_date
    setEndDate: React.Dispatch<React.SetStateAction<string>>;
    travelerType: TravelerKey;                                   // traveler_type
    setTravelerType: React.Dispatch<React.SetStateAction<TravelerKey>>;
    totalGuests: number;                                         // total_guests
    setTotalGuests: React.Dispatch<React.SetStateAction<number>>;

    // Control de generación
    generating: boolean;
    genError: string;
    handleGenerate: () => void;
}

function SideBar({
    query,
    setQuery,
    suggestions,
    selectedCountry,
    loadingSuggest,
    showDd,
    setShowDd,
    searchRef,
    handleSelectCountry,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    travelerType,
    setTravelerType,
    totalGuests,
    setTotalGuests,
    generating,
    genError,
    handleGenerate,
}: SideBarProps) {
    return (
        <aside className="planner-sidebar">
            <div className="planner-header">
                <span className="planner-brand">Omawe</span>
                <h2 className="planner-title">Explora el mundo a tu medida</h2>
            </div>

            {/* Buscador de país */}
            <div className="search-box" ref={searchRef}>
                <label className="search-label">¿A dónde quieres ir?</label>
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
                {showDd && query.trim() && !loadingSuggest && (
                    <div className="search-dropdown">
                        {suggestions.length > 0 ? (
                            suggestions.map((c) => (
                                <div
                                    key={c.cca2}
                                    className="search-option"
                                    onClick={() => handleSelectCountry(c)}
                                >
                                    <img src={c.flags.png} alt="" className="search-option-flag" />
                                    <span className="search-option-name">{c.name.common}</span>
                                    <span className="search-option-code">{c.cca2}</span>
                                </div>
                            ))
                        ) : (
                            <div className="search-empty">No se encontraron países</div>
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

            {/* Fechas del viaje → start_date / end_date */}
            <div className="dates-section">
                <label className="section-label">Fechas del viaje</label>
                <div className="dates-row">
                    <div className="date-field">
                        <span className="date-field-label">Salida</span>
                        <input
                            type="date"
                            className="date-input"
                            value={startDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="date-field">
                        <span className="date-field-label">Regreso</span>
                        <input
                            type="date"
                            className="date-input"
                            value={endDate}
                            min={startDate || new Date().toISOString().split("T")[0]}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tipo de viajero → traveler_type */}
            <div className="travelers-section">
                <label className="section-label">¿Con quién viajas?</label>
                <div className="travelers-options">
                    {travelerOptions.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setTravelerType(key)}
                            className={`traveler-btn ${travelerType === key ? "active" : ""}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Total de viajeros → total_guests */}
            <div className="guests-section">
                <label className="section-label">¿Cuántos viajan?</label>
                <div className="guests-counter">
                    <button
                        className="guests-btn"
                        onClick={() => setTotalGuests(Math.max(1, totalGuests - 1))}
                        disabled={totalGuests <= 1}
                    >
                        −
                    </button>
                    <span className="guests-value">{totalGuests}</span>
                    <button
                        className="guests-btn"
                        onClick={() => setTotalGuests(totalGuests + 1)}
                    >
                        +
                    </button>
                </div>
            </div>

            {genError && <p className="generate-error">{genError}</p>}

            <button
                onClick={handleGenerate}
                disabled={generating}
                className={`generate-btn ${generating ? "disabled" : ""}`}
            >
                {generating ? "Generando…" : "✨ Generar Itinerario Personalizado"}
            </button>
        </aside>
    );
}

export default SideBar;