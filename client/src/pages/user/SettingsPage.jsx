import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { Bell, Shield, Smartphone, Globe } from 'lucide-react';

export const SettingsPage = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const { toast } = useToast();

  const handleSavePreferences = () => {
    toast.success('Notification preferences saved successfully');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notification & Account Settings</h1>
          <p className="page-subtitle">
            Configure how and when FixIt notifies you of issue progress updates.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Card title="Alert Channels & Subscriptions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={20} color="var(--primary-600)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
                    Email Notifications
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                    Receive emails when an issue is assigned, status changes, or work is completed.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={20} color="var(--success-600)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
                    In-App Real-Time Web Push Alerts
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                    Show instant notification popup banners via WebSockets while using FixIt.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
              />
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Smartphone size={20} color="var(--warning-600)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
                    SMS Text Alerts (Emergency Only)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                    Receive emergency SMS alerts for critical public hazards in your ward.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
              />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button variant="primary" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
