import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Wrench,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Droplets,
  Construction,
  Trash2,
  HardHat,
  Users
} from 'lucide-react';
import Button from '../../components/common/Button';
import { categoryService } from '../../services/categoryService';
import { complaintService } from '../../services/complaintService';

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, compRes] = await Promise.all([
          categoryService.getCategories(),
          complaintService.getComplaints({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' })
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (compRes.success) setRecentComplaints(compRes.data || []);
      } catch (err) {
        // ignore
      }
    };
    fetchData();
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/complaints/new';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'worker') return '/worker/tasks';
    return '/complaints/new';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
          color: '#ffffff',
          padding: '5rem 1.5rem 6rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                marginBottom: '1.5rem'
              }}
            >
              <ShieldCheck size={16} /> Verified Civic Issue Resolution Platform
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem'
              }}
            >
              Transform Your City. <br />
              <span style={{ color: '#93c5fd' }}>Report, Track & Verify.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#dbeafe', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '540px' }}>
              FixIt bridges the gap between citizens, municipal service workers, and city administration. Pin issues on a map, watch real-time progress, and verify resolution quality.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={getDashboardLink()}>
                <Button variant="primary" size="lg" style={{ backgroundColor: '#ffffff', color: '#1d4ed8', fontWeight: 700 }}>
                  Report an Issue Now <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button
                  variant="secondary"
                  size="lg"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                >
                  How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Hero Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              color: 'var(--gray-800)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)' }}>Live Dispatch Feed</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Ward 4 District</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--gray-50)', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#d97706' }}>
                  <span>Pothole Repair</span>
                  <span>In Progress</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)', marginTop: '2px' }}>
                  422 5th Avenue Crossing
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                  Assigned Specialist: Marcus Vance (Asphalt Crew)
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--gray-50)', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>
                  <span>Streetlight Restored</span>
                  <span>Verified & Closed</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)', marginTop: '2px' }}>
                  Corner of Elm St & 8th Lane
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                  Rated 5.0 ★ by Sarah Jenkins
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section style={{ maxWidth: '1200px', margin: '-5.5rem auto 0', padding: '0 1.5rem', width: '100%', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--gray-200)',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              94.8%
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-700)', marginTop: '4px' }}>
              Resolution Rate
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Across all city wards</div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--success-600)' }}>
              &lt; 24h
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-700)', marginTop: '4px' }}>
              Avg. Turnaround
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>For Critical & High issues</div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--warning-600)' }}>
              150+
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-700)', marginTop: '4px' }}>
              Active Specialists
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Certified field engineers</div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>
              10,000+
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-700)', marginTop: '4px' }}>
              Citizens Empowered
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Active neighborhood participants</div>
          </div>
        </div>
      </section>

      {/* 4-Step How It Works */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Transparent Process
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.5rem' }}>
            How FixIt Solves Neighborhood Issues
          </h2>
        </div>

        <div className="grid-4">
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <MapPin size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Snap & Pin</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Take photos of the issue, select the precise street coordinates on the interactive map, and submit.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Zap size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Smart Triage</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              The Smart Priority Engine analyzes hazards and assigns urgent tasks immediately to the right municipal crew.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--info-50)', color: 'var(--info-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <HardHat size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Field Action</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Field specialists accept the task, post live status updates, and upload before/after photographic proof.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. Verify & Rate</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              You inspect the resolution photos, rate the quality of work, and officially close the ticket.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories Showcase */}
      <section style={{ backgroundColor: 'var(--gray-100)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
                Civic Service Domains
              </span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem' }}>
                Supported Problem Categories
              </h2>
            </div>
            <Link to="/complaints/new">
              <Button variant="secondary" size="sm">
                Report Other Issue <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <div className="grid-4">
            {categories.slice(0, 8).map((cat) => (
              <div
                key={cat._id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  backgroundColor: '#ffffff',
                  borderTop: `4px solid ${cat.color || 'var(--primary-600)'}`
                }}
              >
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {cat.name}
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--gray-500)', lineHeight: 1.5, flex: 1 }}>
                  {cat.description || 'Public service domain'}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600 }}>
                  Standard SLA: {cat.slaHours} hours
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
