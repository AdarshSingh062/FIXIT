import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BrainCircuit, HardHat, CheckCircle2, ArrowRight, ShieldCheck, Clock, Zap } from 'lucide-react';
import Button from '../../components/common/Button';

export const HowItWorksPage = () => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Workflow Transparency
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.5rem' }}>
          How FixIt Resolves Civic Issues
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '1.1rem', maxWidth: '640px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
          From initial photo submission to field execution and citizen rating verification — a 100% auditable lifecycle.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* Step 1 */}
        <div className="card" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Citizen Incident Reporting
            </h3>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Whenever you notice a damaged road, broken street light, overflowing garbage, or open electrical wire, launch FixIt on your phone or computer. Take photos, select the category, and tap the interactive map to pin the exact coordinates.
            </p>
            <ul style={{ color: 'var(--gray-500)', fontSize: '0.9rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>GPS Geolocation with instant reverse geocoding</li>
              <li>Multi-image upload with client compression</li>
              <li>Optional safety emergency & public transit impact toggles</li>
            </ul>
          </div>
          <div style={{ backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={100} color="var(--primary-500)" />
          </div>
        </div>

        {/* Step 2 */}
        <div className="card" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={100} color="var(--warning-500)" />
          </div>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Smart Priority Engine & Triage
            </h3>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
              FixIt uses an automated scoring engine that parses critical keyword triggers (such as "live wire", "burst pipe", "collapsed") and scores issues into Low, Medium, High, or Critical urgency tiers.
            </p>
            <ul style={{ color: 'var(--gray-500)', fontSize: '0.9rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Instant triage and SLA calculation (e.g. 6h for traffic/safety hazards)</li>
              <li>Real-time push alerts to municipal dispatchers via WebSockets</li>
              <li>Admin override capability with transparent audit logs</li>
            </ul>
          </div>
        </div>

        {/* Step 3 */}
        <div className="card" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--info-50)', color: 'var(--info-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Specialist Dispatch & Work Execution
            </h3>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Field engineers and certified repair specialists receive assigned tasks on their dedicated portal. They accept tasks, mark tickets as "In Progress", communicate with citizens in comment threads, and upload before/after photographic proof upon completion.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardHat size={100} color="var(--info-500)" />
          </div>
        </div>

        {/* Step 4 */}
        <div className="card" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={100} color="var(--success-500)" />
          </div>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1rem' }}>
              4
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Citizen Verification & 5-Star Feedback
            </h3>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
              The reporting citizen gets a real-time notification to review the resolution photos. If satisfied, they rate the worker's punctuality and quality from 1 to 5 stars, closing the case. If dissatisfied, they can dispute and reopen the ticket.
            </p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link to="/register">
          <Button variant="primary" size="lg">
            Get Started on FixIt Today <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HowItWorksPage;
