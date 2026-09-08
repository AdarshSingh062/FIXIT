import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { complaintService } from '../../services/complaintService';
import StatCard from '../../components/dashboard/StatCard';
import { CategoryChart, StatusDonutChart, MonthlyTrendsChart } from '../../components/dashboard/AnalyticsCharts';
import WorkerLeaderboard from '../../components/dashboard/WorkerLeaderboard';
import ComplaintGeoMap from '../../components/dashboard/ComplaintGeoMap';
import Loader from '../../components/common/Loader';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  HardHat,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, compRes] = await Promise.all([
          adminService.getDashboardAnalytics(),
          complaintService.getComplaints({ limit: 50 })
        ]);
        if (dashRes.success) setData(dashRes.data);
        if (compRes.success) setRecentComplaints(compRes.data || []);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader message="Compiling municipal intelligence and analytics..." />;
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const workers = data?.workerLeaderboard || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Municipal Command & Operations Dashboard</h1>
          <p className="page-subtitle">
            Centralized citywide issue dispatching, SLA tracking, and resolution analytics.
          </p>
        </div>
      </div>

      {/* Top 4 Primary KPI Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Issues"
          value={metrics.totalComplaints || 0}
          subtitle="All-time recorded"
          icon={ClipboardList}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          title="Resolution Rate"
          value={`${metrics.resolutionPercentage || 0}%`}
          subtitle="Cases closed successfully"
          icon={TrendingUp}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatCard
          title="Pending Triage"
          value={metrics.pendingComplaints || 0}
          subtitle="Awaiting specialist assignment"
          icon={AlertTriangle}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          title="Avg. Turnaround"
          value={`${metrics.avgResolutionHours || 0}h`}
          subtitle="Overall mean resolution time"
          icon={Clock}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
      </div>

      {/* Citywide Interactive Geo Map */}
      <div style={{ marginBottom: '2rem' }}>
        <ComplaintGeoMap complaints={recentComplaints} height="380px" />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <CategoryChart data={charts.byCategory || []} />
        <StatusDonutChart data={charts.byStatus || []} />
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <MonthlyTrendsChart data={charts.monthlyTrends || []} />
        <WorkerLeaderboard workers={workers} />
      </div>
    </div>
  );
};

export default AdminDashboard;
