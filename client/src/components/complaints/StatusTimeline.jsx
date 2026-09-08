import React from 'react';
import { formatTimeAgo, formatDate } from '../../utils/formatters';
import { CheckCircle2, Clock, AlertCircle, UserCheck, HardHat, FileCheck2 } from 'lucide-react';

const STAGES = [
  { key: 'Pending', label: 'Submitted', icon: Clock },
  { key: 'Under Review', label: 'Under Review', icon: AlertCircle },
  { key: 'Assigned', label: 'Worker Assigned', icon: HardHat },
  { key: 'In Progress', label: 'In Progress', icon: UserCheck },
  { key: 'Resolved', label: 'Resolved', icon: FileCheck2 },
  { key: 'Closed', label: 'Closed & Verified', icon: CheckCircle2 }
];

export const StatusTimeline = ({ timeline = [], currentStatus = 'Pending' }) => {
  const getStageStatus = (stageKey) => {
    const stageIndex = STAGES.findIndex((s) => s.key === stageKey);
    const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

    if (currentStatus === 'Rejected' && stageKey === 'Under Review') return 'rejected';
    if (currentStatus === 'Reopened' && stageKey === 'Resolved') return 'reopened';

    if (currentIndex >= stageIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Horizontal Progress Bar for Desktop */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          marginBottom: '2rem'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '20px',
            right: '20px',
            height: '4px',
            backgroundColor: 'var(--gray-200)',
            zIndex: 1
          }}
        />

        {STAGES.map((stage, index) => {
          const state = getStageStatus(stage.key);
          const Icon = stage.icon;

          let iconBg = 'var(--gray-200)';
          let iconColor = 'var(--gray-500)';
          let labelColor = 'var(--gray-500)';

          if (state === 'completed') {
            iconBg = 'var(--primary-600)';
            iconColor = '#ffffff';
            labelColor = 'var(--primary-700)';
          } else if (state === 'rejected') {
            iconBg = 'var(--danger-600)';
            iconColor = '#ffffff';
            labelColor = 'var(--danger-700)';
          }

          return (
            <div
              key={stage.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: iconBg,
                  color: iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: state === 'completed' ? '0 0 0 4px var(--primary-100)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: labelColor,
                  marginTop: '8px',
                  textAlign: 'center'
                }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Timeline Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-800)' }}>
          Detailed Activity History
        </h4>
        <div style={{ borderLeft: '2px solid var(--gray-200)', marginLeft: '1rem', paddingLeft: '1.25rem' }}>
          {timeline.map((item, index) => (
            <div key={index} style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-27px',
                  top: '2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-600)',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 0 2px var(--primary-200)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                  {item.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  {formatDate(item.timestamp, 'MMM dd, yyyy · HH:mm')} ({formatTimeAgo(item.timestamp)})
                </span>
              </div>
              {item.note && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: '4px' }}>
                  {item.note}
                </p>
              )}
              {item.updatedBy && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  {item.updatedBy.avatar && (
                    <img
                      src={item.updatedBy.avatar}
                      alt={item.updatedBy.name}
                      style={{ width: '18px', height: '18px', borderRadius: '50%' }}
                    />
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    by {item.updatedBy.name || 'System'} {item.updatedBy.role ? `(${item.updatedBy.role})` : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
