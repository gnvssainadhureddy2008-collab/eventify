import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const venuePin = L.divIcon({ className: "", html: '<div class="pin-venue"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
const areaPin = L.divIcon({ className: "", html: '<div class="pin-elegant"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });

function Fit({ points, area }) {
  const map = useMap();
  useEffect(() => {
    const coords = points.filter((p) => typeof p.lat === "number").map((p) => [p.lat, p.lng]);
    if (area && typeof area.lat === "number") coords.push([area.lat, area.lng]);
    if (coords.length > 1) map.fitBounds(coords, { padding: [40, 40], maxZoom: 15 });
    else if (coords.length === 1) map.setView(coords[0], 14);
  }, [map, points, area]);
  return null;
}

export default function VenueMap({ venues = [], area, selectedId, onSelect, height = 420 }) {
  const center = area?.lat ? [area.lat, area.lng] : [20.5937, 78.9629];
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70" style={{ height }}>
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Fit points={venues} area={area} />
        {area?.lat && (
          <Marker position={[area.lat, area.lng]} icon={areaPin}>
            <Popup>Your event area</Popup>
          </Marker>
        )}
        {venues.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={venuePin}
            eventHandlers={{ click: () => onSelect?.(v) }}
          >
            <Popup>
              <span className="font-medium">{v.name}</span>
              <br />
              <span className="text-xs">{v.address}</span>
              {v.id === selectedId && <div className="mt-1 text-[11px]">Selected</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}