import React, { useState, useEffect } from 'react';
import { workerService } from '../../services/workerService';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export const WorkHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 9 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await workerService.getWorkHistory({ page, limit: 9 });
        if (res.success) {
          setHistory(res.data || []);
          setPagination(res.pagination || { total: 0, totalPages: 1, limit: 9 });
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Work History & Completed Cases</h1>
          <p className="page-subtitle">
            Archive of all resolved and citizen-verified municipal service tickets.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading work history..." />
      ) : history.length === 0 ? (
        <EmptyState
          title="No completed cases yet"
          description="Resolved tasks that have been verified by citizens will appear here in your work portfolio."
        />
      ) : (
        <>
          <div className="grid-3">
            {history.map((task) => (
              <ComplaintCard key={task._id} complaint={task} linkPrefix="/worker/tasks" />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
};

export default WorkHistoryPage;
