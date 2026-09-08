import { format, formatDistanceToNow, isValid } from 'date-fns';

export const formatDate = (dateString, pattern = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isValid(date) ? format(date, pattern) : 'N/A';
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '';
};

export const truncateText = (text = '', maxLength = 80) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const getStatusBadgeClass = (status = '') => {
  const normalized = status.toLowerCase().replace(/\s+/g, '-');
  return `badge badge-status-${normalized}`;
};

export const getPriorityBadgeClass = (priority = '') => {
  const normalized = priority.toLowerCase();
  return `badge badge-priority-${normalized}`;
};
