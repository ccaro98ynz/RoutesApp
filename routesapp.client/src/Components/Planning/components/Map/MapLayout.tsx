import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { OverpassPlace } from "../../services/place.service.ts";
import "./Map.css";
import type { CountryResult } from "../../types/planning.types.ts";
import { placeCategoryOptions } from "../../constants/planning.constants";

interface PlanningMapProps {
    selectedCountry: CountryResult | null;
    mapCenter: [number, number];
    mapZoom: number;
    defaultCenter: [number, number];
    places: OverpassPlace[];
}

const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const getCategoryColor = (category: string) => {
    return (
        placeCategoryOptions.find((c) => c.key === category)?.color
        ?? "#2563eb"
    );
};

const createCategoryIcon = (category: string) => {
    const color = getCategoryColor(category);

    return L.divIcon({
        className: "",
        html: `
            <div style="
                width: 24px;
                height: 24px;
                background:${color};
                border:3px solid white;
                border-radius:999px;
                box-shadow:0 4px 10px rgba(0,0,0,.25);
                display:flex;
                align-items:center;
                justify-content:center;
            ">
                <div style="
                    width:8px;
                    height:8px;
                    background:white;
                    border-radius:999px;
                "></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

function FlyToCountry({ latlng, zoom }: { latlng: [number, number]; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        if (latlng && latlng[0] !== 0) {
            map.flyTo(latlng, zoom, {
                duration: 2.0,
                easeLinearity: 0.25
            });
        }
    }, [latlng, zoom, map]);

    return null;
}

function MapInvalidateSize() {
    const map = useMap();
    useEffect(() => {
        const container = map.getContainer();
        const observer = new ResizeObserver(() => {
            map.invalidateSize();
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [map]);
    return null;
}

function MapLayout({
    selectedCountry,
    mapCenter,
    mapZoom,
    defaultCenter,
    places,
}: PlanningMapProps) {

    const tieneLugares = places && places.length > 0;

    const centroDinamico: [number, number] = tieneLugares
        ? [places[0].lat, places[0].lon]
        : mapCenter;

    const zoomDinamico = tieneLugares ? 12 : mapZoom;

    return (
        <div className="planning-map-compact">
            <MapContainer
                center={defaultCenter}
                zoom={4}
                className="planning-map"
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapInvalidateSize />
                <FlyToCountry
                    latlng={centroDinamico}
                    zoom={zoomDinamico}
                />

                {/* 1. Marcador principal del País Seleccionado */}
                {/* ✅ CAMBIO AQUÍ: Añadida la condición "!tieneLugares" */}
                {selectedCountry && !tieneLugares && (
                    <Marker
                        position={[
                            selectedCountry.latlng[0],
                            selectedCountry.latlng[1],
                        ]}
                        icon={defaultIcon}
                    >
                        <Popup>
                            <strong>
                                {selectedCountry.name.common}
                            </strong>
                        </Popup>
                    </Marker>
                )}

                {/* 2. Marcadores específicos de lugares */}
                {selectedCountry && places && places.map((place) => {
                    if (!place.lat || !place.lon) return null;
                    return (
                        <Marker
                            key={place.id}
                            position={[place.lat, place.lon]}
                            icon={createCategoryIcon(place.category)}
                        >
                            <Popup>
                                <div className="map-popup-content">
                                    {/* ✅ CAMBIO: Quitamos el style hardcodeado, usa clase CSS */}
                                    <strong className="map-popup-title">
                                        {place.name || "Sitio de interés"}
                                    </strong>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

            </MapContainer>

            {selectedCountry ? (
                <div className="planning-map-overlay">
                    <div className="planning-map-overlay__info">
                        <img
                            src={selectedCountry.flags.svg}
                            alt=""
                            className="planning-map-overlay__flag"
                        />
                        <div className="planning-map-overlay__text">
                            <span className="planning-map-overlay__eyebrow">
                                Destino seleccionado
                            </span>
                            <span className="planning-map-overlay__name">
                                {selectedCountry.name.common}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="planning-map-empty">
                    <div className="planning-map-empty__icon">
                        🌍
                    </div>
                    <div className="planning-map-empty__text">
                        Selecciona un país para explorar
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapLayout;