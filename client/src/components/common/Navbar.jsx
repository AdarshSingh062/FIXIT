import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { RoleBadge } from './Badge';
import { Wrench, PlusCircle, LogOut, LayoutDashboard, User } from 'lucide-react';
import Button from './Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'worker') return '/worker/tasks';
    return '/dashboard';
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" className="navbar-brand">
          <div
            style={{
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Wrench size={20} />
          </div>
          <span>FixIt</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/how-it-works" className="nav-link">How It Works</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {isAuthenticated ? (
          <>
            {user?.role === 'user' && (
              <Link to="/complaints/new">
                <Button variant="primary" size="sm" icon={PlusCircle}>
                  Report Problem
                </Button>
              </Link>
            )}

            <NotificationDropdown />

            <Link
              to={getDashboardRoute()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)'
              }}
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.2 }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <RoleBadge role={user?.role} />
              </div>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gray-500)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s'
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
