import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import StatCard from '../../components/dashboard/StatCard';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserComplaints = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getMyComplaints({ limit: 6 });
        if (res.success) {
          setComplaints(res.data || []);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchUserComplaints();
  }, []);

  const pendingCount = complaints.filter((c) => ['Pending', 'Under Review'].includes(c.status)).length;
  const inProgressCount = complaints.filter((c) => ['Assigned', 'Accepted', 'In Progress'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;
  const needsActionCount = complaints.filter((c) => c.status === 'Resolved').length;

  if (loading) {
    return <Loader message="Loading your citizen dashboard..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Citizen Hub Overview</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name}</strong>. Here is the real-time status of your reported local issues.
          </p>
        </div>
        <Link to="/complaints/new">
          <Button variant="primary" icon={PlusCircle}>
            Report New Problem
          </Button>
        </Link>
      </div>

      {/* Action Banner if issues need citizen verification */}
      {needsActionCount > 0 && (
        <div
          style={{
            backgroundColor: 'var(--success-50)',
            border: '1px solid #86efac',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--success-500)', color: '#ffffff', padding: '8px', borderRadius: '50%' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--success-700)', fontSize: '0.95rem' }}>
                Action Required: {needsActionCount} issue{needsActionCount > 1 ? 's' : ''} marked Resolved!
              </h4>
              <p style={{ color: 'var(--success-600)', fontSize: '0.85rem' }}>
                Please inspect resolution photos and rate worker service to complete closure.
              </p>
            </div>
          </div>
          <Link to="/my-complaints?status=Resolved">
            <Button variant="success" size="sm">
              Review Resolutions
            </Button>
          </Link>
        </div>
      )}

      {/* Key Metric Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          title="Total Reported"
          value={complaints.length}
          subtitle="All-time submissions"
          icon={ClipboardList}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Assigned to specialists"
          icon={Clock}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Fixed issues"
          icon={CheckCircle2}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          subtitle="Awaiting dispatcher review"
          icon={AlertTriangle}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
      </div>

      {/* Recent Complaints Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
          My Recent Issues
        </h2>
        {complaints.length > 0 && (
          <Link
            to="/my-complaints"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            View all my complaints <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {complaints.length === 0 ? (
        <EmptyState
          title="You haven't reported any issues yet"
          description="Notice a broken streetlight, pothole, or garbage pile? Report it now and help improve your neighborhood."
          actionLabel="Report Your First Issue"
          onAction={() => window.location.href = '/complaints/new'}
        />
      ) : (
        <div className="grid-3">
          {complaints.map((item) => (
            <ComplaintCard key={item._id} complaint={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
