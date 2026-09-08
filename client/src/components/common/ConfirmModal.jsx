import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action? This cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="480px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            backgroundColor: variant === 'danger' ? 'var(--danger-50)' : 'var(--warning-50)',
            color: variant === 'danger' ? 'var(--danger-600)' : 'var(--warning-600)',
            padding: '10px',
            borderRadius: '50%',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: 1.5, marginTop: '4px' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
