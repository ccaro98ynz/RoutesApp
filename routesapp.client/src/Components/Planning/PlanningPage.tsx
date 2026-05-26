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
function PlanningPage() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<CountryResult[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<CountryResult | null>(null);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [showDd, setShowDd] = useState(false);
    const [images, setImages] = useState<CountryImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);

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
            setSuggestions([]);
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

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
    }, [query]);

    useEffect(() => {
        if (!selectedCountry) { setImages([]); return; }
        let mounted = true;
        setLoadingImages(true);
        fetchCountryImages(selectedCountry.name.common)
            .then((imgs) => { if (mounted) setImages(imgs); })
            .finally(() => { if (mounted) setLoadingImages(false); });
        return () => { mounted = false; };
    }, [selectedCountry]);
    useEffect(() => {
        if (!selectedCountry) {
            setStates([]);
            setCities([]);
            setSelectedState("");
            setSelectedCity("");
            return;
        }

        fetchStatesByCountry(selectedCountry.name.common)
            .then(setStates)
            .catch(() => setStates([]));

    }, [selectedCountry]);
    useEffect(() => {
        if (!selectedCountry || !selectedState) {
            setCities([]);
            setSelectedCity("");
            return;
        }

        fetchCitiesByState(
            selectedCountry.name.common,
            selectedState
        )
            .then(setCities)
            .catch(() => setCities([]));

    }, [selectedCountry, selectedState]);

    const handleSelectCountry = (country: CountryResult) => {
        setSelectedCountry(country);
        setQuery(country.name.common);
        setShowDd(false);

        setSelectedState("");
        setSelectedCity("");
        setStates([]);
        setCities([]);

        if (country.latlng?.length >= 2) {
            setMapCenter([country.latlng[0], country.latlng[1]]);
            setMapZoom(5);
        }
    };
    const handleGenerate = async () => {
        if (!selectedCountry) { setGenError("Selecciona un país primero."); return; }
        if (!selectedState) {setGenError("Selecciona un estado/departamento.");return;}
        if (!selectedCity) {setGenError("Selecciona una ciudad.");return;}
        if (!startDate || !endDate) { setGenError("Elige las fechas del viaje."); return; }
        if (endDate <= startDate) { setGenError("La fecha de regreso debe ser posterior a la de salida."); return; }
        setGenError("");
        setGenerating(true);
        try {
            const attractions = await fetchPlacesByCity(
                selectedCity,
                selectedState,
                selectedCountry.cca2,
                "attraction",
                20
            );

            const restaurants = await fetchPlacesByCity(
                selectedCity,
                selectedState,
                selectedCountry.cca2,
                "restaurant",
                10
            );

            console.log("Atracciones:", attractions);
            console.log("Restaurantes:", restaurants);
        } catch {
            setGenError("Error al generar el itinerario. Intenta de nuevo.");
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
            />

            <main className="planning-main-v2">
                <div className="planning-map-wrapper">
                    <MapLayout
                        selectedCountry={selectedCountry}
                        mapCenter={mapCenter}
                        mapZoom={mapZoom}
                        defaultCenter={defaultCenter}
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
