import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem'
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-50)',
          color: 'var(--danger-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <AlertCircle size={40} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: 'var(--gray-900)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-700)', marginTop: '0.25rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--gray-500)', maxWidth: '420px', margin: '0.75rem 0 2rem' }}>
        The page you are looking for might have been moved, deleted, or does not exist on FixIt.
      </p>
      <Link to="/">
        <Button variant="primary" icon={ArrowLeft}>
          Back to Safety (Home)
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
