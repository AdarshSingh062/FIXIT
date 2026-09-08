import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useToast } from '../../hooks/useToast';

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been routed to Municipal Support.');
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
          Get In Touch
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.5rem' }}>
          Contact Municipal Support & Operations
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '1.05rem', maxWidth: '580px', margin: '0.5rem auto 0' }}>
          Have feedback on the platform or need direct assistance with an emergency civic issue?
        </p>
      </div>

      <div className="grid-2">
        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Direct Contact Channels">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Municipal Operations Hotline</div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>+1 (800) 555-FIXIT</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--info-50)', color: 'var(--info-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Support & Inquiries Email</div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>support@fixit.org</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Central Dispatch Headquarters</div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>100 Civic Center Plaza, Metropolis</div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Emergency Situations" style={{ borderLeft: '4px solid var(--danger-500)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>
              For active fires, medical emergencies, gas leaks with smell, or immediate life-threatening situations, always dial <strong>911 / 112</strong> before reporting on the app.
            </p>
          </Card>
        </div>

        {/* Contact Form */}
        <Card title="Send Us a Message">
          <form onSubmit={handleSubmit}>
            <Input
              label="Your Name"
              placeholder="Sarah Jenkins"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Your Email"
              type="email"
              placeholder="sarah@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Subject"
              placeholder="General inquiry / Ward 4 suggestion"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="How can our civic platform team assist you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" variant="primary" icon={Send} style={{ width: '100%' }}>
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
