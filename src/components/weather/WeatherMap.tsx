/**
 * Leaflet map centred on the searched location.
 * Browser-only: this module is lazy-loaded behind <ClientOnly>, so the
 * `leaflet` import never runs during SSR.
 */
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Default marker assets ship as bundler-relative URLs; point them at the CDN.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 10, { duration: 1.2 });
  }, [lat, lon, map]);
  return null;
}

export function WeatherMap({
  lat,
  lon,
  label,
}: {
  lat: number;
  lon: number;
  label: string;
}) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={10}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-2xl"
      style={{ background: "transparent" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[lat, lon]} icon={markerIcon}>
        <Popup>{label}</Popup>
      </Marker>
      <Recenter lat={lat} lon={lon} />
    </MapContainer>
  );
}

export default WeatherMap;