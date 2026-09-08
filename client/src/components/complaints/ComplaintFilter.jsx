import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../../utils/constants';

export const ComplaintFilter = ({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  priority,
  setPriority,
  categories = [],
  onReset
}) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        alignItems: 'flex-end'
      }}
    >
      {/* Search Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
          Search Issues
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '34px' }}
            placeholder="Search by title, description, or street..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
          Category
        </label>
        <select
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Dropdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
          Status
        </label>
        <select
          className="form-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.values(COMPLAINT_STATUS).map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Dropdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
          Priority
        </label>
        <select
          className="form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          {Object.values(COMPLAINT_PRIORITY).map((pr) => (
            <option key={pr} value={pr}>
              {pr}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Filter Button */}
      <div>
        <button
          onClick={onReset}
          className="btn btn-secondary"
          style={{ width: '100%', height: '42px' }}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
};

export default ComplaintFilter;
