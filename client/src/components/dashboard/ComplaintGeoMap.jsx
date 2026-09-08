import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Card from '../common/Card';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Link } from 'react-router-dom';
import { ExternalLink, MapPin } from 'lucide-react';
import { STATUS_COLORS } from '../../utils/constants';

const createMapIcon = (status = 'Pending') => {
  const color = STATUS_COLORS[status] || '#3b82f6';
  return L.divIcon({
    className: 'custom-geo-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
      ">
        <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const ComplaintGeoMap = ({ complaints = [], height = '380px' }) => {
  const center = complaints.length > 0 && complaints[0].latitude
    ? [complaints[0].latitude, complaints[0].longitude]
    : [40.7128, -74.0060];

  return (
    <Card title="Citywide Issue Geographical Distribution" subtitle="Real-time map view of reported local civic issues">
      <div style={{ height, width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {complaints.map((item) => {
            const lat = item.latitude || item.location?.coordinates?.[1];
            const lng = item.longitude || item.location?.coordinates?.[0];
            if (!lat || !lng) return null;

            return (
              <Marker key={item._id} position={[lat, lng]} icon={createMapIcon(item.status)}>
                <Popup>
                  <div style={{ minWidth: '220px', padding: '4px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <PriorityBadge priority={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                    <h5 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 700 }}>
                      {item.title}
                    </h5>
                    <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748b' }}>
                      {item.location?.address}
                    </p>
                    <Link
                      to={`/admin/complaints/${item._id}`}
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--primary-600)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Inspect Case <ExternalLink size={12} />
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </Card>
  );
};

export default ComplaintGeoMap;
