import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import Card from '../common/Card';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

export const CategoryChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    name: item.name.length > 16 ? `${item.name.slice(0, 14)}...` : item.name,
    fullName: item.name,
    Total: item.count,
    Resolved: item.resolved,
    Pending: item.pending
  }));

  return (
    <Card title="Complaints by Category" subtitle="Distribution of reported issues across departments">
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-200)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} angle={-25} textAnchor="end" />
            <YAxis tick={{ fontSize: 11, fill: 'var(--gray-500)' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-md)' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const StatusDonutChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count
  }));

  const COLORS = ['#b45309', '#4338ca', '#0369a1', '#1d4ed8', '#a16207', '#15803d', '#334155', '#b91c1c'];

  return (
    <Card title="Issue Status Breakdown" subtitle="Current workflow distribution">
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--gray-200)' }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const MonthlyTrendsChart = ({ data = [] }) => {
  return (
    <Card title="Monthly Resolution Velocity" subtitle="Reported vs. Resolved trends over time">
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-200)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--gray-500)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--gray-500)' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--gray-200)' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="reported"
              name="Reported Issues"
              stroke="#2563eb"
              fillOpacity={1}
              fill="url(#colorReported)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              name="Resolved Issues"
              stroke="#059669"
              fillOpacity={1}
              fill="url(#colorResolved)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
