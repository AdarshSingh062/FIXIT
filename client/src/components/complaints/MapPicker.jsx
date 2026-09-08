import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { useGeolocation } from '../../hooks/useGeolocation';

// Custom Pin Icon using HTML/SVG
const createCustomPin = (color = '#2563eb') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
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
};

// Map click listener component
const LocationMarker = ({ position, setPosition, onLocationSelected }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      if (onLocationSelected) {
        onLocationSelected(lat, lng);
      }
    }
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom() > 14 ? map.getZoom() : 15);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={createCustomPin('#ef4444')} />
  );
};

export const MapPicker = ({
  initialLat = 40.7128,
  initialLng = -74.0060,
  onLocationChange
}) => {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [addressDetails, setAddressDetails] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const { getCurrentLocation, loading: geoLoading } = useGeolocation();

  // Reverse geocode lat/lng to readable street address using OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      setGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      const formattedAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddressDetails(formattedAddress);

      if (onLocationChange) {
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: formattedAddress,
          city: data.address?.city || data.address?.town || data.address?.suburb || '',
          postalCode: data.address?.postcode || '',
          landmark: data.address?.road || data.address?.amenity || ''
        });
      }
    } catch (err) {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddressDetails(fallback);
      if (onLocationChange) {
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: fallback
        });
      }
    } finally {
      setGeocoding(false);
    }
  };

  const handleLocationSelected = (lat, lng) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const handleUseMyLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setPosition([coords.latitude, coords.longitude]);
      reverseGeocode(coords.latitude, coords.longitude);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={16} color="var(--primary-600)" />
          <span>Click anywhere on the map to pinpoint exact location</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUseMyLocation}
          loading={geoLoading}
          icon={Navigation}
        >
          Use My GPS Location
        </Button>
      </div>

      <div style={{ height: '320px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-300)' }}>
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationSelected={handleLocationSelected}
          />
        </MapContainer>
      </div>

      <div
        style={{
          backgroundColor: 'var(--gray-50)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'var(--gray-700)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {geocoding ? (
            <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <MapPin size={16} color="var(--danger-500)" style={{ flexShrink: 0 }} />
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {addressDetails || `${position[0].toFixed(5)}, ${position[1].toFixed(5)}`}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
          Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
        </span>
      </div>
    </div>
  );
};

export default MapPicker;
