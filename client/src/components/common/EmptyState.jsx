import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = Inbox,
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        border: '1px dashed var(--gray-300)',
        borderRadius: 'var(--radius-md)',
        margin: '1.5rem 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--gray-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gray-400)',
          marginBottom: '1rem'
        }}
      >
        <Icon size={28} />
      </div>
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.35rem' }}>
        {title}
      </h4>
      <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', maxWidth: '420px', marginBottom: actionLabel ? '1.25rem' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
