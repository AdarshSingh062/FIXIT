import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  User,
  Settings,
  Briefcase,
  History,
  Award,
  Users,
  HardHat,
  Tags,
  BarChart3,
  ScrollText,
  AlertCircle
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const renderNavLinks = () => {
    if (user.role === 'admin') {
      return (
        <>
          <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Operations & Analytics
          </div>
          <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={18} />
            <span>Issue Management</span>
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span>Analytics & KPIs</span>
          </NavLink>

          <div style={{ padding: '1.25rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Administration
          </div>
          <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Citizens</span>
          </NavLink>
          <NavLink to="/admin/workers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HardHat size={18} />
            <span>Field Specialists</span>
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Tags size={18} />
            <span>Categories & SLAs</span>
          </NavLink>
          <NavLink to="/admin/activity-logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ScrollText size={18} />
            <span>System Audit Logs</span>
          </NavLink>
        </>
      );
    }

    if (user.role === 'worker') {
      return (
        <>
          <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Field Operations
          </div>
          <NavLink to="/worker/tasks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Briefcase size={18} />
            <span>Assigned Tasks</span>
          </NavLink>
          <NavLink to="/worker/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <History size={18} />
            <span>Work History</span>
          </NavLink>
          <NavLink to="/worker/performance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Award size={18} />
            <span>My Performance</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <User size={18} />
            <span>Worker Profile</span>
          </NavLink>
        </>
      );
    }

    // Default: Citizen / User
    return (
      <>
        <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Citizen Hub
        </div>
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>My Overview</span>
        </NavLink>
        <NavLink to="/complaints/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <PlusCircle size={18} />
          <span>Report New Problem</span>
        </NavLink>
        <NavLink to="/my-complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <ClipboardList size={18} />
          <span>Track Complaints</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <User size={18} />
          <span>My Profile</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Account Settings</span>
        </NavLink>
      </>
    );
  };

  return (
    <aside className="dashboard-sidebar">
      <div style={{ padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <style>{`
          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.625rem 0.875rem;
            border-radius: var(--radius-sm);
            color: var(--gray-600);
            font-size: 0.9rem;
            font-weight: 500;
            transition: all var(--transition-fast);
          }
          .sidebar-link:hover {
            background-color: var(--gray-100);
            color: var(--gray-900);
          }
          .sidebar-link.active {
            background-color: var(--primary-50);
            color: var(--primary-700);
            font-weight: 600;
          }
        `}</style>
        {renderNavLinks()}
      </div>
    </aside>
  );
};

export default Sidebar;
