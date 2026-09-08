import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      {(title || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
