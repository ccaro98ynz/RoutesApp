import { useState, useEffect, useRef } from "react";
import "./Planning.css";
import SideBar from "./components/SideBar/SideBar";
import MapLayout from "./components/Map/MapLayout.tsx";
import GalleryCarousel from "./components/Gallery/GalleryCarousel";
import { fetchCountryImages } from "./services/images.service.ts";
import type { CountryResult, CountryImage, TravelerKey } from "./types/planning.types";
import { searchCountries } from "./services/countryInfo.service.ts";
import { fetchStatesByCountry, fetchCitiesByState, type StateResult } from "./services/location.service.ts";
import { fetchPlacesByCity } from "./services/place.service.ts";
import type { OverpassPlace } from "./services/place.service.ts";
import type { PlaceCategoryKey } from "./constants/planning.constants.tsx";
import { createRoute, mapPlacesToRouteDTO } from "./services/routes.service.ts";
const interestMap: Record<string, number> = {
    tourism: 1,
    gastronomy: 2,
    nature: 3,
    culture: 4,
    nightlife: 5,
    shopping: 6,
    sport: 7,
    wellness: 8
};
function PlanningPage() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<CountryResult[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<CountryResult | null>(null);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [showDd, setShowDd] = useState(false);
    const [images, setImages] = useState<CountryImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [places, setPlaces] = useState<OverpassPlace[]>([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [travelerType, setTravelerType] = useState<TravelerKey>("pareja");
    const [totalGuests, setTotalGuests] = useState(2);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState("");
    const [states, setStates] = useState<StateResult[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    // Categorías seleccionadas de forma global
    const [selectedCategories, setSelectedCategories] = useState<PlaceCategoryKey[]>([]);

    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const defaultCenter: [number, number] = [23.6345, -102.5528];
    const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
    const [mapZoom, setMapZoom] = useState(4);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setShowDd(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Debounce para búsqueda de países
    // 📌 Modifica este useEffect en tu PlanningPage.tsx
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        // 🔒 GUARD/CANDADO: Si la query es igual al país seleccionado,
        // significa que el usuario acaba de hacer clic en la sugerencia.
        // Salimos del efecto inmediatamente para que NO vuelva a buscar ni a abrir el dropdown.
        if (selectedCountry && query === selectedCountry.name.common) {
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoadingSuggest(true);
            try {
                const countries = await searchCountries(query);
                setSuggestions(countries);
                setShowDd(true);
            } catch {
                setSuggestions([]);
            } finally {
                setLoadingSuggest(false);
            }
        }, 350);

        // El efecto ahora vigila tanto la query como el cambio de país seleccionado
    }, [query, selectedCountry]);

    // Cargar imágenes del país seleccionado
    useEffect(() => {
        if (!selectedCountry) { setImages([]); return; }
        let mounted = true;
        setLoadingImages(true);
        fetchCountryImages(selectedCountry.name.common)
            .then((imgs) => { if (mounted) setImages(imgs); })
            .finally(() => { if (mounted) setLoadingImages(false); });
        return () => { mounted = false; };
    }, [selectedCountry]);

    // Cargar Estados por País
    useEffect(() => {
        if (!selectedCountry) {
            setStates([]); setCities([]); setSelectedState(""); setSelectedCity("");
            return;
        }
        fetchStatesByCountry(selectedCountry.name.common).then(setStates).catch(() => setStates([]));
    }, [selectedCountry]);

    // Cargar Ciudades por Estado
    useEffect(() => {
        if (!selectedCountry || !selectedState) {
            setCities([]); setSelectedCity("");
            return;
        }
        fetchCitiesByState(selectedCountry.name.common, selectedState).then(setCities).catch(() => setCities([]));
    }, [selectedCountry, selectedState]);

    // ✅ NUEVO EFFECT DE LIMPIEZA: Si cambian el destino, borramos marcadores previos 
    // para evitar que se queden pintados puntos de un viaje anterior en el nuevo mapa.
    useEffect(() => {
        setPlaces([]);
    }, [selectedCountry, selectedState, selectedCity]);


    const handleSelectCountry = (country: CountryResult) => {
        setSelectedCountry(country);
        setQuery(country.name.common);
        setShowDd(false);
        setSelectedState("");
        setSelectedCity("");
        setSelectedCategories([]);
        setStates([]);
        setCities([]);
        setPlaces([]);

        if (country.latlng?.length >= 2) {
            setMapCenter([country.latlng[0], country.latlng[1]]);
            setMapZoom(5);
        }
    };

    // ✅ MODIFICADO: Ahora este handler descarga los puntos de interés antes de crear la ruta
    const handleGenerate = async () => {
        if (!selectedCountry) { setGenError("Selecciona un país primero."); return; }
        if (!selectedState) { setGenError("Selecciona un estado/departamento."); return; }
        if (!selectedCity) { setGenError("Selecciona una ciudad."); return; }
        if (!startDate || !endDate) { setGenError("Elige las fechas del viaje."); return; }
        if (endDate <= startDate) { setGenError("La fecha de regreso debe ser posterior a la de salida."); return; }
        if (selectedCategories.length === 0) { setGenError("Selecciona al menos una categoría."); return; }

        const customerId = localStorage.getItem("customerId");
        if (!customerId) { setGenError("Debes iniciar sesión."); return; }

        setGenError("");
        setGenerating(true);
        setPlaces([]);

        try {
            // 1. Traer lugares en UNA sola consulta
            const newPlaces = await fetchPlacesByCity(
                selectedCity,
                selectedState,
                selectedCountry.cca2,
                selectedCategories,
                40,
                5
            );

            // 2. Dibujar puntos
            setPlaces(newPlaces);

            // 3. Guardar ruta usando los mismos lugares
            const payload = {
                idCustomer: Number(customerId),
                startDate,
                endDate,
                travelerType,
                totalGuests,
                interestIds: selectedCategories.map((c) => interestMap[c]),
                places: mapPlacesToRouteDTO(
                    newPlaces,
                    selectedCity,
                    selectedCountry.cca2
                )
            };

            const result = await createRoute(payload);

            console.log("Ruta creada:", result);
            alert("Ruta registrada correctamente");

        } catch (error) {
            console.error("Error al generar/registrar la ruta", error);
            setGenError("Error al generar o registrar la ruta.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="planner-layout">
            <SideBar
                query={query}
                setQuery={setQuery}
                suggestions={suggestions}
                loadingSuggest={loadingSuggest}
                showDd={showDd}
                setShowDd={setShowDd}
                selectedCountry={selectedCountry}
                searchRef={searchRef}
                handleSelectCountry={handleSelectCountry}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                travelerType={travelerType}
                setTravelerType={setTravelerType}
                totalGuests={totalGuests}
                setTotalGuests={setTotalGuests}
                generating={generating}
                genError={genError}
                handleGenerate={handleGenerate}
                states={states}
                cities={cities}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
            />

            <main className="planning-main-v2">
                <div className="planning-map-wrapper">
                    <MapLayout
                        selectedCountry={selectedCountry}
                        mapCenter={mapCenter}
                        mapZoom={mapZoom}
                        defaultCenter={defaultCenter}
                        places={places}
                    />
                </div>

                <div className="planning-gallery-section">
                    {selectedCountry ? (
                        <GalleryCarousel
                            country={selectedCountry}
                            images={images}
                            loading={loadingImages}
                        />
                    ) : (
                        <div className="planning-gallery-empty">
                            <span>🖼️</span>
                            <p>Selecciona un país para ver su galería</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PlanningPage;