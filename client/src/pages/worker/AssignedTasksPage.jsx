import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { workerService } from '../../services/workerService';
import { useToast } from '../../hooks/useToast';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../../utils/constants';
import { Search, RotateCcw } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export const AssignedTasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 9 });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 400);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        search: debouncedSearch,
        status,
        priority
      };
      const res = await workerService.getAssignedTasks(params);
      if (res.success) {
        setTasks(res.data || []);
        setPagination(res.pagination || { total: 0, totalPages: 1, limit: 9 });
      }
    } catch (err) {
      toast.error('Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, priority, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Field Tasks</h1>
          <p className="page-subtitle">
            Manage your service queue, accept incoming dispatches, and upload resolution proof.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
            Search Tasks
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px' }}
              placeholder="Search by title, location, or problem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
            Status
          </label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Assigned">Assigned (Awaiting Accept)</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
            Priority
          </label>
          <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {Object.values(COMPLAINT_PRIORITY).map((pr) => (
              <option key={pr} value={pr}>{pr}</option>
            ))}
          </select>
        </div>

        <div>
          <button onClick={handleReset} className="btn btn-secondary" style={{ width: '100%', height: '42px' }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your filter"
          description="There are currently no tasks matching your query."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          <div className="grid-3">
            {tasks.map((task) => (
              <ComplaintCard key={task._id} complaint={task} linkPrefix="/worker/tasks" />
            ))}
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
    </div>
  );
};

export default AssignedTasksPage;
