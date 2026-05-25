import { useEffect } from "react";
import { MapContainer,TileLayer,Marker,Popup,useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import type { CountryResult } from "../../types/planning.types.ts";
interface PlanningMapProps {
    selectedCountry: CountryResult | null;
    mapCenter: [number, number];
    mapZoom: number;
    defaultCenter: [number, number];
}
const iconProto = L.Icon.Default.prototype as unknown as Record<string, unknown>;
delete iconProto._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
function FlyToCountry({latlng, zoom,
}: {
    latlng: [number, number];
    zoom: number;
}) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(latlng, zoom, {
            duration: 1.8,
        });
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
}: PlanningMapProps) {

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
                    latlng={mapCenter}
                    zoom={mapZoom}
                />
                {selectedCountry && (
                    <Marker
                        position={[
                            selectedCountry.latlng[0],
                            selectedCountry.latlng[1],
                        ]}
                    >
                        <Popup>
                            <strong>
                                {selectedCountry.name.common}
                            </strong>
                        </Popup>
                    </Marker>
                )}
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
                    <div className="planning-map-overlay__pills">
                        <span className="planning-map-overlay__pill">
                            {selectedCountry.region}
                        </span>
                        {selectedCountry.subregion && (
                            <span className="planning-map-overlay__pill">
                                {selectedCountry.subregion}
                            </span>
                        )}
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