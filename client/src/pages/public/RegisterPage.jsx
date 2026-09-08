import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input, Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Wrench, Mail, Lock, User, Phone, HardHat } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    department: 'Roads & Infrastructure',
    specialization: 'Civil & Asphalt Works'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.warning('Please complete all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        toast.success(`Welcome to FixIt, ${res.user.name}!`);
        if (res.user.role === 'worker') {
          navigate('/worker/tasks');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        backgroundColor: 'var(--gray-50)'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
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
            Join the FixIt Network
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Report issues, track progress, or join as a service specialist
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role selector tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              backgroundColor: 'var(--gray-100)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}
          >
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'user' })}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: formData.role === 'user' ? '#ffffff' : 'transparent',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: formData.role === 'user' ? 'var(--primary-600)' : 'var(--gray-600)',
                boxShadow: formData.role === 'user' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <User size={16} /> Citizen / Resident
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'worker' })}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: formData.role === 'worker' ? '#ffffff' : 'transparent',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: formData.role === 'worker' ? 'var(--primary-600)' : 'var(--gray-600)',
                boxShadow: formData.role === 'worker' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <HardHat size={16} /> Service Specialist
            </button>
          </div>

          <Input
            label="Full Name"
            name="name"
            placeholder="Sarah Jenkins"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="sarah@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            required
          />

          <div className="grid-2">
            <Input
              label="Password (min 6 chars)"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+1 (555) 019-3322"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
            />
          </div>

          {formData.role === 'worker' && (
            <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.75rem' }}>
                Specialist Dispatch Information
              </div>
              <div className="form-group">
                <label className="form-label">Municipal Department</label>
                <select
                  className="form-select"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Power & Grid Utilities">Power & Grid Utilities</option>
                  <option value="Sanitation & Environment">Sanitation & Environment</option>
                  <option value="Water Supply & Sewerage">Water Supply & Sewerage</option>
                  <option value="Traffic Police & Safety">Traffic Police & Safety</option>
                  <option value="Civic Maintenance">Civic Maintenance</option>
                </select>
              </div>

              <Input
                label="Primary Specialization / Skills"
                name="specialization"
                placeholder="e.g. High-Voltage Wiring, Asphalt Patching"
                value={formData.specialization}
                onChange={handleChange}
              />
            </div>
          )}

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.75rem' }} loading={loading}>
            Create Account
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
