import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { CategoryChart, StatusDonutChart, MonthlyTrendsChart } from '../../components/dashboard/AnalyticsCharts';
import StatCard from '../../components/dashboard/StatCard';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardAnalytics();
        if (res.success) setData(res.data);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader message="Running aggregation pipelines..." />;
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Analytics & KPI Metrics</h1>
          <p className="page-subtitle">
            Deep-dive MongoDB aggregation insights across resolution rates, department velocity, and volume trends.
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Issues Handled"
          value={metrics.totalComplaints || 0}
          subtitle="Overall database count"
          icon={BarChart3}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          title="Success Resolution Rate"
          value={`${metrics.resolutionPercentage || 0}%`}
          subtitle="Closed & verified"
          icon={TrendingUp}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatCard
          title="Avg. Resolution Duration"
          value={`${metrics.avgResolutionHours || 0}h`}
          subtitle="Turnaround mean"
          icon={Clock}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
        <StatCard
          title="Reopened Rate"
          value={`${metrics.totalComplaints > 0 ? ((metrics.reopenedComplaints / metrics.totalComplaints) * 100).toFixed(1) : 0}%`}
          subtitle="Disputed resolutions"
          icon={CheckCircle}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <CategoryChart data={charts.byCategory || []} />
        <StatusDonutChart data={charts.byStatus || []} />
      </div>

      <div>
        <MonthlyTrendsChart data={charts.monthlyTrends || []} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
