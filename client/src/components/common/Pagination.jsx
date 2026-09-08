import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 0',
        marginTop: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}
    >
      <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
        Showing <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{startItem}</span> to{' '}
        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{endItem}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{totalItems}</span> results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)', padding: '0 0.5rem' }}>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
