import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const EmergencyMap = ({ emergencies }) => (
  <div className="h-96 mb-8">
    <MapContainer
      center={[40.7128, -74.006]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {emergencies.map((emergency) => (
        <Marker
          key={emergency.id}
          position={[emergency.latitude, emergency.longitude]}
        >
          <Popup>{emergency.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);

export default EmergencyMap;
