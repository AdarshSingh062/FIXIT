import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  icon: Icon,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--gray-400)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`form-input ${className}`}
          style={Icon ? { paddingLeft: '38px' } : {}}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {!error && helperText && (
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export const Select = ({
  label,
  error,
  options = [],
  className = '',
  id,
  children,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select id={selectId} className={`form-select ${className}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default Input;
