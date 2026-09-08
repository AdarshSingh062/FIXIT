import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import MultiImageUploader from './MultiImageUploader';
import { useToast } from '../../hooks/useToast';
import { workerService } from '../../services/workerService';

export const ResolutionModal = ({
  isOpen,
  onClose,
  complaintId,
  onResolvedSuccess
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionImages, setResolutionImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      toast.warning('Please provide detailed notes on the resolution actions taken');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('status', 'Resolved');
      formData.append('notes', resolutionNotes);

      for (const file of resolutionImages) {
        formData.append('resolutionImages', file);
      }

      const res = await workerService.updateTaskStatus(complaintId, formData);
      if (res.success) {
        toast.success('Resolution evidence submitted! Issue is now marked Resolved.');
        if (onResolvedSuccess) onResolvedSuccess(res.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resolution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Issue Resolution"
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Resolution Actions & Technical Notes</label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Describe the repair procedure, materials used, and safety checks performed..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            required
          />
        </div>

        <MultiImageUploader
          files={resolutionImages}
          setFiles={setResolutionImages}
          label="Resolution Proof Photos (After Repair)"
          description="Upload clear photos of completed repair for citizen verification"
          maxFiles={4}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={loading}>
            Complete & Submit Resolution
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ResolutionModal;
