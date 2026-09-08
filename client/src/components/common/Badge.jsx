import React from 'react';
import { getStatusBadgeClass, getPriorityBadgeClass } from '../../utils/formatters';
import { AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const PriorityBadge = ({ priority = 'Medium' }) => {
  const badgeClass = getPriorityBadgeClass(priority);

  let Icon = AlertCircle;
  if (priority === 'Critical') Icon = ShieldAlert;
  else if (priority === 'High') Icon = AlertTriangle;

  return (
    <span className={badgeClass}>
      <Icon size={13} />
      <span>{priority}</span>
    </span>
  );
};

export const StatusBadge = ({ status = 'Pending' }) => {
  const badgeClass = getStatusBadgeClass(status);

  let Icon = Clock;
  if (status === 'Resolved' || status === 'Closed') Icon = CheckCircle2;
  else if (status === 'Rejected') Icon = AlertCircle;

  return (
    <span className={badgeClass}>
      <Icon size={13} />
      <span>{status}</span>
    </span>
  );
};

export const RoleBadge = ({ role = 'user' }) => {
  const roleStyles = {
    admin: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: 'Admin' },
    worker: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', label: 'Field Specialist' },
    user: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', label: 'Citizen' }
  };

  const current = roleStyles[role] || roleStyles.user;

  return (
    <span
      style={{
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase'
      }}
    >
      {current.label}
    </span>
  );
};
