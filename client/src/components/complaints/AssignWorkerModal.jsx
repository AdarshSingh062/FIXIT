import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import { HardHat, Star, CheckCircle2, User } from 'lucide-react';
import Loader from '../common/Loader';

export const AssignWorkerModal = ({
  isOpen,
  onClose,
  complaintId,
  complaintCategory,
  onAssignedSuccess
}) => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [instructionNote, setInstructionNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllWorkers();
      if (res.success) {
        setWorkers(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load workers roster');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      toast.warning('Please select a worker to assign');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminService.assignWorker(complaintId, selectedWorkerId, instructionNote);
      if (res.success) {
        toast.success(res.message || 'Worker assigned successfully');
        if (onAssignedSuccess) onAssignedSuccess(res.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Field Specialist"
      maxWidth="600px"
    >
      {loading ? (
        <Loader message="Loading available specialists..." />
      ) : (
        <form onSubmit={handleAssign}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Select an active municipal specialist from the department pool to dispatch:
          </p>

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {workers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                No active workers registered
              </div>
            ) : (
              workers.map((worker) => {
                const isSelected = selectedWorkerId === worker._id;
                return (
                  <div
                    key={worker._id}
                    onClick={() => setSelectedWorkerId(worker._id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--gray-100)',
                      backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                      borderLeft: isSelected ? '4px solid var(--primary-600)' : '4px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={worker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt={worker.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--gray-900)' }}>
                          {worker.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                          {worker.workerDetails?.department || 'Field Services'} · {worker.workerDetails?.specialization || 'General'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning-600)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={12} fill="#f59e0b" /> {worker.workerDetails?.avgRating || 5.0} ({worker.workerDetails?.totalRatings || 0})
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        Active Tasks: <strong>{worker.workerDetails?.activeTasks || 0}</strong>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Dispatch Instructions / Priority Note (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Bring asphalt asphalt roller; site has high pedestrian traffic..."
              value={instructionNote}
              onChange={(e) => setInstructionNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} disabled={!selectedWorkerId}>
              Confirm Dispatch Assignment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AssignWorkerModal;
