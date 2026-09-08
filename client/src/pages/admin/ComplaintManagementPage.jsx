import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { categoryService } from '../../services/categoryService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import ComplaintFilter from '../../components/complaints/ComplaintFilter';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import AssignWorkerModal from '../../components/complaints/AssignWorkerModal';
import Modal from '../../components/common/Modal';
import { formatDate, truncateText } from '../../utils/formatters';
import { COMPLAINT_PRIORITY, COMPLAINT_STATUS } from '../../utils/constants';
import { UserCheck, ShieldAlert, Eye, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export const ComplaintManagementPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [assignModalData, setAssignModalData] = useState({ isOpen: false, complaintId: null });
  const [priorityModalData, setPriorityModalData] = useState({ isOpen: false, complaintId: null, currentPriority: 'Medium', reason: '' });
  const [statusModalData, setStatusModalData] = useState({ isOpen: false, complaintId: null, currentStatus: 'Pending', note: '' });

  const debouncedSearch = useDebounce(search, 400);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: debouncedSearch,
        category,
        status,
        priority
      };
      const res = await complaintService.getComplaints(params);
      if (res.success) {
        setComplaints(res.data || []);
        setPagination(res.pagination || { total: 0, totalPages: 1, limit: 12 });
      }
    } catch (err) {
      toast.error('Failed to load complaints table');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, status, priority, toast]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPriority('');
    setPage(1);
  };

  const handlePriorityOverride = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.overridePriority(
        priorityModalData.complaintId,
        priorityModalData.currentPriority,
        priorityModalData.reason
      );
      if (res.success) {
        toast.success(res.message || 'Priority updated');
        setPriorityModalData({ isOpen: false, complaintId: null, currentPriority: 'Medium', reason: '' });
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to override priority');
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.updateComplaintStatus(
        statusModalData.complaintId,
        statusModalData.currentStatus,
        statusModalData.note
      );
      if (res.success) {
        toast.success(res.message || 'Status updated');
        setStatusModalData({ isOpen: false, complaintId: null, currentStatus: 'Pending', note: '' });
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Issue Management & Dispatch</h1>
          <p className="page-subtitle">
            Assign specialists, adjust priority levels, and oversee complaint resolution lifecycles.
          </p>
        </div>
      </div>

      <ComplaintFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        categories={categories}
        onReset={handleReset}
      />

      {loading ? (
        <Loader message="Loading complaints table..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="Try broadening your search query or reset your active filters."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket / Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Assigned Specialist</th>
                  <th>Reported Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                        {truncateText(c.title, 35)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        #{c._id.slice(-6).toUpperCase()} · {truncateText(c.location?.address || 'Map', 25)}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: c.category?.color || 'var(--primary-600)' }}>
                        {c.category?.name}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setPriorityModalData({ isOpen: true, complaintId: c._id, currentPriority: c.priority, reason: '' })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to override priority"
                      >
                        <PriorityBadge priority={c.priority} />
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => setStatusModalData({ isOpen: true, complaintId: c._id, currentStatus: c.status, note: '' })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to transition status"
                      >
                        <StatusBadge status={c.status} />
                      </button>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {c.createdBy?.name || 'Anonymous'}
                      </div>
                    </td>
                    <td>
                      {c.assignedWorker ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img
                            src={c.assignedWorker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={c.assignedWorker.name}
                            style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                          />
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {c.assignedWorker.name}
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={UserCheck}
                          onClick={() => setAssignModalData({ isOpen: true, complaintId: c._id })}
                        >
                          Assign
                        </Button>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                      {formatDate(c.createdAt, 'MMM dd, yyyy')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={UserCheck}
                          onClick={() => setAssignModalData({ isOpen: true, complaintId: c._id })}
                          title="Reassign Worker"
                        />
                        <Link to={`/complaints/${c._id}`}>
                          <Button variant="primary" size="sm" icon={Eye} title="Inspect Details" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}

      {/* Assign Worker Modal */}
      <AssignWorkerModal
        isOpen={assignModalData.isOpen}
        onClose={() => setAssignModalData({ isOpen: false, complaintId: null })}
        complaintId={assignModalData.complaintId}
        onAssignedSuccess={() => fetchComplaints()}
      />

      {/* Override Priority Modal */}
      {priorityModalData.isOpen && (
        <Modal
          isOpen={priorityModalData.isOpen}
          onClose={() => setPriorityModalData({ ...priorityModalData, isOpen: false })}
          title="Manual Priority Override"
          maxWidth="480px"
        >
          <form onSubmit={handlePriorityOverride}>
            <div className="form-group">
              <label className="form-label">Set Priority Level</label>
              <select
                className="form-select"
                value={priorityModalData.currentPriority}
                onChange={(e) => setPriorityModalData({ ...priorityModalData, currentPriority: e.target.value })}
              >
                {Object.values(COMPLAINT_PRIORITY).map((pr) => (
                  <option key={pr} value={pr}>{pr}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Justification / Reason for Override</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. On-site inspection confirmed traffic hazard severity..."
                value={priorityModalData.reason}
                onChange={(e) => setPriorityModalData({ ...priorityModalData, reason: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Button variant="secondary" onClick={() => setPriorityModalData({ ...priorityModalData, isOpen: false })}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Apply Priority Override
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Status Transition Modal */}
      {statusModalData.isOpen && (
        <Modal
          isOpen={statusModalData.isOpen}
          onClose={() => setStatusModalData({ ...statusModalData, isOpen: false })}
          title="Update Complaint Status"
          maxWidth="480px"
        >
          <form onSubmit={handleStatusChange}>
            <div className="form-group">
              <label className="form-label">Transition Status To</label>
              <select
                className="form-select"
                value={statusModalData.currentStatus}
                onChange={(e) => setStatusModalData({ ...statusModalData, currentStatus: e.target.value })}
              >
                {Object.values(COMPLAINT_STATUS).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status Update Note</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Case reviewed by municipal supervisor..."
                value={statusModalData.note}
                onChange={(e) => setStatusModalData({ ...statusModalData, note: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Button variant="secondary" onClick={() => setStatusModalData({ ...statusModalData, isOpen: false })}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Status
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ComplaintManagementPage;
