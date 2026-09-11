import React, { useState, useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPicker.css";

// Fix default Leaflet marker icon asset paths broken by Webpack/Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to handle clicks directly on the map surface
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ lat, lng, onChange }) {
  const initialLat = Number(lat) || 12.1226;
  const initialLng = Number(lng) || 77.7770;

  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
  const markerRef = useRef(null);

  // Sync state if coordinates change externally (e.g. from GPS button)
  useEffect(() => {
    if (lat && lng) {
      setPosition({ lat: Number(lat), lng: Number(lng) });
    }
  }, [lat, lng]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onChange]
  );

  const handleMapClick = (clickLat, clickLng) => {
    setPosition({ lat: clickLat, lng: clickLng });
    onChange(clickLat, clickLng);
  };

  return (
    <div className="map-picker-wrapper">
      <div className="map-picker-instructions">
        <span>📍 Drag the marker or click on the map to pinpoint the exact property location.</span>
      </div>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="leaflet-picker-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[position.lat, position.lng]}
          ref={markerRef}
        />
        <MapClickHandler onLocationSelect={handleMapClick} />
      </MapContainer>
    </div>
  );
}