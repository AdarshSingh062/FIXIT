import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import { RoleBadge } from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';
import { Search, UserCheck, UserX, Shield, Users } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 400);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers({
        page,
        limit: 12,
        search: debouncedSearch,
        role,
        status
      });
      if (res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination || { total: 0, totalPages: 1, limit: 12 });
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, role, status, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminService.updateUserStatus(userId, newStatus);
      if (res.success) {
        toast.success(`User status updated to ${newStatus}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Citizen & User Management</h1>
          <p className="page-subtitle">
            Manage resident accounts, monitor registration activity, and handle account suspensions.
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
            Search Users
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px' }}
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
            Role
          </label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="user">Citizen</option>
            <option value="worker">Field Specialist</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>
            Account Status
          </label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching users directory..." />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search criteria." />
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User / Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                          alt={u.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{u.name}</div>
                          {u.phone && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: u.status === 'active' ? '#ecfdf5' : '#fef2f2',
                          color: u.status === 'active' ? '#059669' : '#dc2626',
                          textTransform: 'uppercase'
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                      {formatDate(u.createdAt, 'MMM dd, yyyy')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.status === 'active' ? 'danger' : 'success'}
                          size="sm"
                          icon={u.status === 'active' ? UserX : UserCheck}
                          onClick={() => handleToggleStatus(u._id, u.status)}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      )}
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

export default UserManagementPage;
