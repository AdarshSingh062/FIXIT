import React from 'react';
import Card from '../common/Card';
import { Star, CheckCircle, Award } from 'lucide-react';

export const WorkerLeaderboard = ({ workers = [] }) => {
  return (
    <Card title="Top Performing Field Specialists" subtitle="Ranked by completed tasks and citizen satisfaction">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {workers.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
            No worker records available
          </div>
        ) : (
          workers.slice(0, 5).map((worker, idx) => (
            <div
              key={worker._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-100)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: idx === 0 ? '#fef3c7' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#ffedd5' : 'transparent',
                    color: idx === 0 ? '#b45309' : idx === 1 ? '#475569' : idx === 2 ? '#c2410c' : 'var(--gray-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  #{idx + 1}
                </div>

                <img
                  src={worker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={worker.name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />

                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
                    {worker.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {worker.department || 'Field Services'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-600)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle size={14} /> {worker.completedTasks || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Solved</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning-600)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={14} fill="#f59e0b" /> {worker.avgRating || 5.0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Rating</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default WorkerLeaderboard;
