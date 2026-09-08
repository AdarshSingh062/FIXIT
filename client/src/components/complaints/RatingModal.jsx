import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Star } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { complaintService } from '../../services/complaintService';

export const RatingModal = ({
  isOpen,
  onClose,
  complaintId,
  workerName = 'Specialist',
  onRatingSuccess
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [punctuality, setPunctuality] = useState(5);
  const [quality, setQuality] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await complaintService.submitRating(complaintId, {
        rating,
        review,
        punctuality,
        quality
      });

      if (res.success) {
        toast.success('Thank you! Your feedback has been recorded and issue is closed.');
        if (onRatingSuccess) onRatingSuccess(res.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Resolution & Rate Service"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit}>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Please rate the service provided by <strong>{workerName}</strong>. Your verification officially closes this issue ticket.
        </p>

        {/* Star Rating Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '1rem 0 1.5rem' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: star <= (hoverRating || rating) ? '#f59e0b' : '#cbd5e1',
                  transition: 'transform 0.1s'
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star size={36} fill={star <= (hoverRating || rating) ? '#f59e0b' : 'transparent'} />
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-700)' }}>
            {rating === 5 ? 'Excellent 🌟' : rating === 4 ? 'Good 👍' : rating === 3 ? 'Average 👌' : rating === 2 ? 'Poor 👎' : 'Terrible ⚠️'}
          </span>
        </div>

        {/* Quality and Punctuality Selectors */}
        <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
          <div>
            <label className="form-label">Repair Quality (1-5)</label>
            <select
              className="form-select"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
            >
              <option value="5">5 - Flawless</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Acceptable</option>
              <option value="2">2 - Subpar</option>
              <option value="1">1 - Defective</option>
            </select>
          </div>
          <div>
            <label className="form-label">Timeliness / Speed (1-5)</label>
            <select
              className="form-select"
              value={punctuality}
              onChange={(e) => setPunctuality(Number(e.target.value))}
            >
              <option value="5">5 - Very Fast</option>
              <option value="4">4 - On Time</option>
              <option value="3">3 - Moderate</option>
              <option value="2">2 - Delayed</option>
              <option value="1">1 - Very Slow</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Feedback / Review (Optional)</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Share details of your experience with the repair team..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Submit Rating & Close Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RatingModal;
