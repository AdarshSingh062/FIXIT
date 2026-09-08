import React from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { formatDate, formatTimeAgo, truncateText } from '../../utils/formatters';
import { MapPin, Calendar, User, ArrowRight, Image as ImageIcon } from 'lucide-react';

export const ComplaintCard = ({ complaint, linkPrefix = '/complaints' }) => {
  if (!complaint) return null;

  const coverImage = complaint.images && complaint.images.length > 0
    ? complaint.images[0]
    : 'https://images.unsplash.com/photo-1584463699039-389eb0625a58?auto=format&fit=crop&w=400&q=80';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--gray-200)'
      }}
    >
      <div style={{ position: 'relative', height: '160px', width: '100%', backgroundColor: 'var(--gray-100)' }}>
        <img
          src={coverImage}
          alt={complaint.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <PriorityBadge priority={complaint.priority} />
        </div>
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <StatusBadge status={complaint.status} />
        </div>
        {complaint.images && complaint.images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ImageIcon size={12} /> {complaint.images.length} photos
          </div>
        )}
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: complaint.category?.color || 'var(--primary-600)', textTransform: 'uppercase', marginBottom: '4px' }}>
          {complaint.category?.name || 'General'}
        </div>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {truncateText(complaint.title, 55)}
        </h4>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
          {truncateText(complaint.description, 85)}
        </p>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <MapPin size={14} color="var(--gray-400)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {complaint.location?.address || 'Reported Map Location'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="var(--gray-400)" />
              <span>{formatTimeAgo(complaint.createdAt)}</span>
            </div>

            <Link
              to={`${linkPrefix}/${complaint._id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--primary-600)',
                fontWeight: 600,
                fontSize: '0.825rem'
              }}
            >
              Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
