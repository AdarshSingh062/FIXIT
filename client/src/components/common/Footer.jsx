import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Heart, Shield, HelpCircle, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--gray-200)', marginTop: 'auto' }}>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '3rem 1.5rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            <Wrench size={22} />
            <span>FixIt</span>
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Empowering communities to report local civic issues, track real-time resolution workflows, and verify results.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Platform
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            <Link to="/how-it-works" style={{ color: 'inherit' }}>How It Works</Link>
            <Link to="/about" style={{ color: 'inherit' }}>About FixIt</Link>
            <Link to="/contact" style={{ color: 'inherit' }}>Contact & Support</Link>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Roles & Portals
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            <Link to="/login" style={{ color: 'inherit' }}>Citizen Portal</Link>
            <Link to="/login" style={{ color: 'inherit' }}>Service Provider Dispatch</Link>
            <Link to="/login" style={{ color: 'inherit' }}>Municipal Admin Command</Link>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Municipal Assistance
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
            Emergency Dial: <strong>911 / 112</strong>
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>
            Municipal Hotline: <strong>+1 (800) 555-FIXIT</strong>
          </p>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--gray-100)',
          padding: '1.25rem 1.5rem',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.825rem',
          color: 'var(--gray-400)'
        }}
      >
        <div>© {new Date().getFullYear()} FixIt Civic Platform. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Production-grade full-stack MERN platform</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
