import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Users, BarChart3, AlertCircle, Settings, TrendingUp, Clock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'support' | 'analytics' | 'settings'>('overview');

  // Check if user is an admin
  if (user?.role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '400px',
          textAlign: 'center',
          padding: '40px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Admin Access Required</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            This page is only available for administrators.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#1f2937' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Manage Ologywood platform, users, and support</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 20px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '30px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'support', label: 'Support', icon: '🆘' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '15px 0',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #7c3aed' : 'none',
                color: activeTab === tab.id ? '#7c3aed' : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ marginRight: '6px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px' }}>
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Platform Overview</h2>
            
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}>
              {[
                { label: 'Total Users', value: '1,234', icon: '👥', color: '#3b82f6' },
                { label: 'Active Artists', value: '456', icon: '🎵', color: '#10b981' },
                { label: 'Active Venues', value: '89', icon: '🏢', color: '#f59e0b' },
                { label: 'Pending Support', value: '12', icon: '🆘', color: '#ef4444' },
              ].map((stat, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>{stat.label}</p>
                      <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{stat.value}</p>
                    </div>
                    <span style={{ fontSize: '32px' }}>{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', margin: '0 0 15px 0' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {[
                  { label: 'View Support Tickets', action: () => navigate('/admin/sla-tracking') },
                  { label: 'Manage Users', action: () => alert('User management coming soon') },
                  { label: 'View Analytics', action: () => alert('Analytics coming soon') },
                  { label: 'Platform Settings', action: () => alert('Settings coming soon') },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6d28d9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>User Management</h2>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <p>User management interface coming soon</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>You'll be able to manage users, roles, and permissions here</p>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Support Management</h2>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}>
              <button
                onClick={() => navigate('/admin/sla-tracking')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '20px',
                }}
              >
                View SLA Tracking Dashboard
              </button>
              <p style={{ color: '#6b7280' }}>Manage support tickets, track SLAs, and monitor team performance</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Platform Analytics</h2>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <p>Analytics dashboard coming soon</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>Track platform usage, revenue, and user engagement metrics</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Platform Settings</h2>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <p>Platform settings coming soon</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>Configure platform features, email settings, and system preferences</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
