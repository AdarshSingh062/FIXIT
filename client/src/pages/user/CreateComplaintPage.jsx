import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import { Input, Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import MapPicker from '../../components/complaints/MapPicker';
import MultiImageUploader from '../../components/complaints/MultiImageUploader';
import { PriorityBadge } from '../../components/common/Badge';
import { AlertTriangle, Sparkles, MapPin, Send, ArrowLeft, ShieldAlert } from 'lucide-react';

export const CreateComplaintPage = () => {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.0060);
  const [isEmergency, setIsEmergency] = useState(false);
  const [publicImpact, setPublicImpact] = useState(false);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data?.length > 0) {
          setCategories(res.data);
          setCategoryId(res.data[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load categories');
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, [toast]);

  // Live estimated priority calculation preview
  const getEstimatedPriority = () => {
    const combined = `${title} ${description}`.toLowerCase();
    if (isEmergency || /live wire|fire|gas leak|explosion|collapsed/i.test(combined)) {
      return { priority: 'Critical', note: 'Immediate safety hazard detected' };
    }
    if (publicImpact || /flood|sewage|broken traffic|burst pipe/i.test(combined)) {
      return { priority: 'High', note: 'High public impact or infrastructure risk' };
    }
    return { priority: 'Medium', note: 'Standard municipal SLA queue' };
  };

  const estimated = getEstimatedPriority();

  const handleLocationChange = (loc) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    if (loc.address) setAddress(loc.address);
    if (loc.landmark) setLandmark(loc.landmark);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !categoryId) {
      toast.warning('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', categoryId);
      formData.append('address', address || 'Map Location');
      formData.append('landmark', landmark);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('isEmergency', isEmergency);
      formData.append('publicImpact', publicImpact);

      for (const file of images) {
        formData.append('images', file);
      }

      const res = await complaintService.createComplaint(formData);
      if (res.success) {
        toast.success('Complaint submitted successfully! Municipal team notified.');
        navigate(`/complaints/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gray-500)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Report a Local Civic Problem</h1>
          <p className="page-subtitle">
            Provide issue details, pin the exact map location, and upload photo evidence.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Details Card */}
          <Card title="1. Issue Overview">
            <Input
              label="Issue Title"
              placeholder="e.g. Deep hazardous pothole outside supermarket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Be specific about the problem and location landmark"
              required
            />

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCats}
                required
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} (SLA: {cat.slaHours}h)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe the condition, exact spot, safety hazards, and how long it has persisted..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Smart Priority Live Preview Box */}
            <div
              style={{
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--primary-600)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Smart Engine Estimated Priority:
                </span>
                <PriorityBadge priority={estimated.priority} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                {estimated.note}
              </span>
            </div>
          </Card>

          {/* Urgency & Impact Toggles */}
          <Card title="2. Urgency & Public Impact">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isEmergency ? 'var(--danger-50)' : 'var(--gray-50)',
                  border: isEmergency ? '1px solid var(--danger-500)' : '1px solid var(--gray-200)',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isEmergency ? 'var(--danger-700)' : 'var(--gray-800)' }}>
                    Immediate Danger / Safety Hazard
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    Check this if there are exposed live wires, structural collapse risk, or immediate hazard to life.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: publicImpact ? 'var(--warning-50)' : 'var(--gray-50)',
                  border: publicImpact ? '1px solid var(--warning-500)' : '1px solid var(--gray-200)',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={publicImpact}
                  onChange={(e) => setPublicImpact(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: publicImpact ? 'var(--warning-700)' : 'var(--gray-800)' }}>
                    Affects High Public Transit / School Zone
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    Check this if the issue blocks a major highway, school crossing, or hospital access.
                  </div>
                </div>
              </label>
            </div>
          </Card>

          {/* Interactive Map Location Card */}
          <Card title="3. Pin Exact Map Location" subtitle="Click map to lock precise GPS coordinates">
            <MapPicker
              initialLat={latitude}
              initialLng={longitude}
              onLocationChange={handleLocationChange}
            />
            <div style={{ marginTop: '1rem' }}>
              <Input
                label="Street Address / Location Details"
                placeholder="422 5th Avenue"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Input
                label="Nearest Landmark (Optional)"
                placeholder="Opposite WholeMart Foods entrance"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
          </Card>

          {/* Image Evidence Upload */}
          <Card title="4. Photographic Evidence" subtitle="Clear photos help specialists arrive with the right tools">
            <MultiImageUploader
              files={images}
              setFiles={setImages}
              maxFiles={5}
            />
          </Card>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="lg" icon={Send} loading={submitting}>
              Submit Complaint Ticket
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaintPage;
