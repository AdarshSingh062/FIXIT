import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Wrench, Mail, Lock, Sparkles, Shield, HardHat, User } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (res.user.role === 'worker') {
          navigate('/worker/tasks');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--gray-50)'
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--gray-200)',
          padding: '2.5rem 2rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}
          >
            <Wrench size={24} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Sign In to FixIt
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Access your civic reporting and dispatch account
          </p>
        </div>

        {/* 1-Click Demo Logins for reviewers */}
        <div
          style={{
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '8px' }}>
            <Sparkles size={14} /> Quick Demo Account Autofill:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@fixit.com', 'Admin@123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 6px' }}
            >
              <Shield size={12} color="#dc2626" /> Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('worker.roads@fixit.com', 'Worker@123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 6px' }}
            >
              <HardHat size={12} color="#d97706" /> Worker
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen@fixit.com', 'User@123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 6px' }}
            >
              <User size={12} color="#2563eb" /> Citizen
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }} loading={loading}>
            Sign In
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
