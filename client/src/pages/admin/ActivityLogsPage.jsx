import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import { ScrollText, Filter } from 'lucide-react';

export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getActivityLogs({ page, limit: 20, entityType });
      if (res.success) {
        setLogs(res.data || []);
        setPagination(res.pagination || { total: 0, totalPages: 1, limit: 20 });
      }
    } catch (err) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [page, entityType, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Activity & Audit Logs</h1>
          <p className="page-subtitle">
            Immutable, real-time audit trail of all dispatch assignments, priority adjustments, status changes, and logins.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'Complaint', 'User', 'Category', 'Rating', 'System'].map((type) => (
          <button
            key={type}
            onClick={() => { setEntityType(type); setPage(1); }}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: entityType === type ? '1px solid var(--primary-600)' : '1px solid var(--gray-200)',
              backgroundColor: entityType === type ? 'var(--primary-50)' : '#ffffff',
              color: entityType === type ? 'var(--primary-700)' : 'var(--gray-600)',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer'
            }}
          >
            {type || 'All Activity'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader message="Fetching audit logs..." />
      ) : logs.length === 0 ? (
        <EmptyState title="No logs found" description="No activity recorded for this entity filter." />
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / User</th>
                  <th>Action Event</th>
                  <th>Entity Type</th>
                  <th>Details & Payload</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                      {formatDate(log.createdAt, 'MMM dd, yyyy · HH:mm:ss')}
                    </td>
                    <td>
                      {log.user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={log.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
                            alt={log.user.name}
                            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                          />
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.user.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>System Worker</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary-700)', backgroundColor: 'var(--primary-50)', padding: '2px 8px', borderRadius: '4px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{log.entityType}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-600)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                      {log.ipAddress || '127.0.0.1'}
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
    </div>
  );
};

export default ActivityLogsPage;
