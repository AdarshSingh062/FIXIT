import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { HardHat, Star, CheckCircle, Briefcase, Plus, UserPlus } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

export const WorkerManagementPage = () => {
  const [workers, setWorkers] = useState([]);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [editDept, setEditDept] = useState('');
  const [editSpec, setEditSpec] = useState('');
  const { toast } = useToast();

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllWorkers({ department });
      if (res.success) {
        setWorkers(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [department]);

  const handleOpenEdit = (worker) => {
    setSelectedWorker(worker);
    setEditDept(worker.workerDetails?.department || 'Roads & Infrastructure');
    setEditSpec(worker.workerDetails?.specialization || '');
    setIsEditModalOpen(true);
  };

  const handleSaveWorkerRole = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.updateUserRole(selectedWorker._id, {
        role: 'worker',
        department: editDept,
        specialization: editSpec
      });
      if (res.success) {
        toast.success('Worker details updated');
        setIsEditModalOpen(false);
        fetchWorkers();
      }
    } catch (err) {
      toast.error('Failed to update worker details');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Field Specialist Operations Roster</h1>
          <p className="page-subtitle">
            Monitor active technician workloads, customer satisfaction scores, and department assignments.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'Roads & Infrastructure', 'Power & Grid Utilities', 'Sanitation & Environment', 'Water Supply & Sewerage'].map((dept) => (
          <button
            key={dept}
            onClick={() => setDepartment(dept)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: department === dept ? '1px solid var(--primary-600)' : '1px solid var(--gray-200)',
              backgroundColor: department === dept ? 'var(--primary-50)' : '#ffffff',
              color: department === dept ? 'var(--primary-700)' : 'var(--gray-600)',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer'
            }}
          >
            {dept || 'All Departments'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader message="Loading specialist roster..." />
      ) : workers.length === 0 ? (
        <EmptyState title="No field specialists found" description="No specialists match the selected department filter." />
      ) : (
        <div className="grid-3">
          {workers.map((w) => (
            <Card key={w._id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={w.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                  alt={w.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {w.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    {w.workerDetails?.department || 'Field Services'}
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--gray-50)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--gray-400)', marginBottom: '2px' }}>Specialization</div>
                <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                  {w.workerDetails?.specialization || 'Civil Infrastructure Repair'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                    {w.workerDetails?.activeTasks || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Active Tasks</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-600)' }}>
                    {w.workerDetails?.completedTasks || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Solved</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    <Star size={14} fill="#f59e0b" /> {w.workerDetails?.avgRating || 5.0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Rating</div>
                </div>
              </div>

              <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(w)} style={{ width: '100%', marginTop: 'auto' }}>
                Edit Department / Specialization
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Worker Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Specialist: ${selectedWorker?.name}`}
          maxWidth="480px"
        >
          <form onSubmit={handleSaveWorkerRole}>
            <div className="form-group">
              <label className="form-label">Municipal Department</label>
              <select
                className="form-select"
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
              >
                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                <option value="Power & Grid Utilities">Power & Grid Utilities</option>
                <option value="Sanitation & Environment">Sanitation & Environment</option>
                <option value="Water Supply & Sewerage">Water Supply & Sewerage</option>
                <option value="Traffic Police & Safety">Traffic Police & Safety</option>
                <option value="Civic Maintenance">Civic Maintenance</option>
              </select>
            </div>

            <Input
              label="Specialization Focus"
              value={editSpec}
              onChange={(e) => setEditSpec(e.target.value)}
              placeholder="e.g. High-Voltage LED Lighting & Transformers"
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default WorkerManagementPage;
