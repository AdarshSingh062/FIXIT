import React, { useState, useEffect } from 'react';
import { workerService } from '../../services/workerService';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import StatCard from '../../components/dashboard/StatCard';
import Loader from '../../components/common/Loader';
import { Star, CheckCircle, Clock, Award, ThumbsUp, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const WorkerPerformancePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await workerService.getWorkerStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <Loader message="Loading performance metrics..." />;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Specialist Performance & Satisfaction</h1>
          <p className="page-subtitle">
            Track your efficiency metrics, SLA compliance, and community reviews.
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          title="Overall Rating"
          value={`${stats?.avgRating || 5.0} ★`}
          subtitle={`From ${stats?.totalRatings || 0} reviews`}
          icon={Star}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          title="Cases Solved"
          value={stats?.completedTasks || 0}
          subtitle="Citizen verified"
          icon={CheckCircle}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatCard
          title="Avg. Turnaround"
          value={`${stats?.avgResolutionHours || 18.5}h`}
          subtitle="Assignment to closure"
          icon={Clock}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          title="Quality Score"
          value="4.9 / 5"
          subtitle="Repair durability rating"
          icon={ShieldCheck}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
      </div>

      {/* Recent Citizen Reviews */}
      <Card title="Recent Citizen Feedback & Reviews" subtitle="Direct verified reviews from resident sign-offs">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(!stats?.recentReviews || stats.recentReviews.length === 0) ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              No reviews recorded yet
            </div>
          ) : (
            stats.recentReviews.map((rev) => (
              <div
                key={rev._id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= rev.rating ? '#f59e0b' : 'transparent'}
                        color={star <= rev.rating ? '#f59e0b' : '#cbd5e1'}
                      />
                    ))}
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', marginLeft: '4px' }}>
                      {rev.rating}.0
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                    {formatDate(rev.createdAt, 'MMM dd, yyyy')}
                  </span>
                </div>
                {rev.review ? (
                  <p style={{ color: 'var(--gray-700)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                    "{rev.review}"
                  </p>
                ) : (
                  <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', margin: 0 }}>
                    Rated without written comments
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkerPerformancePage;
