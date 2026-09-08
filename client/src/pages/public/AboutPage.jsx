import React from 'react';
import { Wrench, Shield, Users, Target, HeartHandshake } from 'lucide-react';
import Card from '../../components/common/Card';

export const AboutPage = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
          Our Mission
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.5rem' }}>
          Building Smarter, Cleaner, and Safer Cities
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '1.1rem', maxWidth: '640px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
          FixIt was built to solve the frustration of unaccountable civic maintenance. We create seamless, transparent connection between residents, service teams, and municipal leadership.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: '3rem' }}>
        <Card title="The Problem" subtitle="Why traditional complaint systems fail">
          <p style={{ color: 'var(--gray-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
            In most municipalities, citizens have no central way to report issues. Complaints get lost in bureaucratic silos, workers receive ambiguous location descriptions, and there is zero verification of whether an issue was actually fixed or merely marked done on paper.
          </p>
        </Card>

        <Card title="The Solution" subtitle="How FixIt transforms municipal services">
          <p style={{ color: 'var(--gray-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
            FixIt introduces complete end-to-end accountability. From exact GPS map pins, automated severity triage, real-time WebSocket updates, to mandatory photo evidence and citizen satisfaction sign-offs.
          </p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '1.75rem 1rem' }}>
          <Shield size={36} color="var(--primary-600)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Full Transparency</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Every action is logged in an immutable system audit trail.</p>
        </div>

        <div className="card" style={{ padding: '1.75rem 1rem' }}>
          <Target size={36} color="var(--success-600)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Strict SLAs</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Turnaround deadlines enforced with automatic priority escalation.</p>
        </div>

        <div className="card" style={{ padding: '1.75rem 1rem' }}>
          <HeartHandshake size={36} color="var(--warning-600)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Community Driven</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Citizens verify outcomes and hold public services accountable.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
