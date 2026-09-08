import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

const customViewerPin = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="
      background-color: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

export const MapViewer = ({
  latitude = 40.7128,
  longitude = -74.0060,
  address = '',
  title = '',
  height = '240px'
}) => {
  const position = [latitude || 40.7128, longitude || -74.0060];

  return (
    <div style={{ height, width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customViewerPin}>
          <Popup>
            <div style={{ fontSize: '0.85rem' }}>
              <strong>{title || 'Reported Location'}</strong>
              <p style={{ margin: '4px 0 0', color: '#64748b' }}>{address}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapViewer;
