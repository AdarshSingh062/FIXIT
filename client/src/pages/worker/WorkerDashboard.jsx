import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { workerService } from '../../services/workerService';
import StatCard from '../../components/dashboard/StatCard';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { Briefcase, CheckCircle, Clock, Star, ArrowRight, HardHat } from 'lucide-react';

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        setLoading(true);
        const [tasksRes, statsRes] = await Promise.all([
          workerService.getAssignedTasks({ limit: 6 }),
          workerService.getWorkerStats()
        ]);
        if (tasksRes.success) setTasks(tasksRes.data || []);
        if (statsRes.success) setStats(statsRes.data || null);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchWorkerData();
  }, []);

  if (loading) {
    return <Loader message="Loading field specialist dashboard..." />;
  }

  const awaitingAcceptance = tasks.filter((t) => t.status === 'Assigned').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Field Specialist Operations Portal</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name}</strong> · {user?.workerDetails?.department || 'Field Services'} ({user?.workerDetails?.specialization || 'General'})
          </p>
        </div>
        <Link to="/worker/tasks">
          <Button variant="primary" icon={Briefcase}>
            View All Assigned Tasks
          </Button>
        </Link>
      </div>

      {/* Urgent Dispatch Alert if tasks awaiting acceptance */}
      {awaitingAcceptance > 0 && (
        <div
          style={{
            backgroundColor: 'var(--warning-50)',
            border: '1px solid #fcd34d',
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
            <div style={{ backgroundColor: 'var(--warning-500)', color: '#ffffff', padding: '8px', borderRadius: '50%' }}>
              <HardHat size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--warning-700)', fontSize: '0.95rem' }}>
                {awaitingAcceptance} New Task{awaitingAcceptance > 1 ? 's' : ''} Awaiting Acceptance!
              </h4>
              <p style={{ color: 'var(--warning-600)', fontSize: '0.85rem' }}>
                Municipal dispatch assigned you new tasks. Please accept to initiate travel & preparation.
              </p>
            </div>
          </div>
          <Link to="/worker/tasks?status=Assigned">
            <Button variant="primary" size="sm">
              Review & Accept Tasks
            </Button>
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          title="Active Workload"
          value={stats?.activeTasks || tasks.filter((t) => ['Assigned', 'Accepted', 'In Progress'].includes(t.status)).length}
          subtitle="Tasks in queue"
          icon={Briefcase}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          title="Completed Solved"
          value={stats?.completedTasks || user?.workerDetails?.completedTasks || 0}
          subtitle="All-time closed issues"
          icon={CheckCircle}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatCard
          title="Citizen Rating"
          value={`${stats?.avgRating || user?.workerDetails?.avgRating || 5.0} ★`}
          subtitle={`From ${stats?.totalRatings || user?.workerDetails?.totalRatings || 0} reviews`}
          icon={Star}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          title="Avg. Turnaround"
          value={`${stats?.avgResolutionHours || 18.5}h`}
          subtitle="From assign to resolution"
          icon={Clock}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
      </div>

      {/* Recent Assigned Tasks Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
          Active Assigned Tasks
        </h2>
        {tasks.length > 0 && (
          <Link
            to="/worker/tasks"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Go to Task Board <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No active tasks assigned"
          description="You are currently all caught up! New dispatch allocations will appear here in real-time."
        />
      ) : (
        <div className="grid-3">
          {tasks.map((item) => (
            <ComplaintCard key={item._id} complaint={item} linkPrefix="/worker/tasks" />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
