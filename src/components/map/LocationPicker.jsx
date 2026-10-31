import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pin = L.divIcon({ className: "", html: '<div class="pin-elegant"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      map.flyTo([lat, lng], zoom ?? map.getZoom(), { duration: 0.9 });
    }
  }, [lat, lng, zoom, map]);
  return null;
}

export default function LocationPicker({ lat, lng, onChange, height = 340 }) {
  const hasPin = typeof lat === "number" && typeof lng === "number";
  const center = hasPin ? [lat, lng] : [20.5937, 78.9629];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70" style={{ height }}>
      <MapContainer center={center} zoom={hasPin ? 13 : 5} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        <Recenter lat={lat} lng={lng} />
        {hasPin && (
          <Marker
            position={[lat, lng]}
            icon={pin}
            draggable
            eventHandlers={{
              dragend(e) {
                const p = e.target.getLatLng();
                onChange(p.lat, p.lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}