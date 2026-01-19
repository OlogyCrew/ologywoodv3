import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, CheckCircle2, TrendingDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

interface TicketSLA {
  id: number;
  ticketId: number;
  subject: string;
  priority: string;
  status: string;
  assignedTo: string;
  createdAt: string;
  hoursRemaining: number;
  percentComplete: number;
  escalationLevel: 0 | 1 | 2;
  isOverdue: boolean;
}

export default function SLATrackingDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Initialize all hooks first (before any conditional returns)
  const [tickets] = useState<TicketSLA[]>([
    {
      id: 1,
      ticketId: 101,
      subject: 'Cannot book artist for event',
      priority: 'high',
      status: 'open',
      assignedTo: 'Sarah Johnson',
      createdAt: '2 hours ago',
      hoursRemaining: 2,
      percentComplete: 50,
      escalationLevel: 0,
      isOverdue: false,
    },
    {
      id: 2,
      ticketId: 102,
      subject: 'Payment processing issue',
      priority: 'urgent',
      status: 'open',
      assignedTo: 'Mike Chen',
      createdAt: '30 minutes ago',
      hoursRemaining: 0.5,
      percentComplete: 90,
      escalationLevel: 2,
      isOverdue: true,
    },
    {
      id: 3,
      ticketId: 103,
      subject: 'Profile verification delay',
      priority: 'medium',
      status: 'in-progress',
      assignedTo: 'Emma Davis',
      createdAt: '4 hours ago',
      hoursRemaining: 20,
      percentComplete: 30,
      escalationLevel: 0,
      isOverdue: false,
    },
    {
      id: 4,
      ticketId: 104,
      subject: 'Feature request: bulk messaging',
      priority: 'low',
      status: 'open',
      assignedTo: 'James Wilson',
      createdAt: '1 day ago',
      hoursRemaining: 48,
      percentComplete: 10,
      escalationLevel: 0,
      isOverdue: false,
    },
  ]);

  // Now check admin access
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

  const overdueTickets = tickets.filter(t => t.isOverdue).length;
  const escalatedTickets = tickets.filter(t => t.escalationLevel > 0).length;
  const avgResponseTime = (tickets.reduce((sum, t) => sum + t.hoursRemaining, 0) / tickets.length).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
            SLA Tracking Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>Monitor support ticket SLAs and response times</p>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          <Card>
            <CardContent style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <AlertTriangle style={{ width: '32px', height: '32px', color: '#ef4444', margin: '0 auto 10px' }} />
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Overdue Tickets</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{overdueTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <TrendingDown style={{ width: '32px', height: '32px', color: '#f59e0b', margin: '0 auto 10px' }} />
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Escalated</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{escalatedTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <Clock style={{ width: '32px', height: '32px', color: '#3b82f6', margin: '0 auto 10px' }} />
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Avg Response Time</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{avgResponseTime}h</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <CheckCircle2 style={{ width: '32px', height: '32px', color: '#10b981', margin: '0 auto 10px' }} />
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Compliance</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {Math.round(((tickets.length - overdueTickets) / tickets.length) * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SLA Policies */}
        <Card style={{ marginBottom: '30px' }}>
          <CardHeader>
            <CardTitle>SLA Response Time Policies</CardTitle>
            <CardDescription>Service level agreements by ticket priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {[
                { priority: 'Urgent', response: '1 hour', resolution: '4 hours', color: '#fee2e2', borderColor: '#fecaca' },
                { priority: 'High', response: '4 hours', resolution: '24 hours', color: '#fef3c7', borderColor: '#fcd34d' },
                { priority: 'Medium', response: '8 hours', resolution: '48 hours', color: '#dbeafe', borderColor: '#bfdbfe' },
                { priority: 'Low', response: '24 hours', resolution: '72 hours', color: '#dcfce7', borderColor: '#bbf7d0' },
              ].map((policy) => (
                <div
                  key={policy.priority}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: policy.color,
                    border: `1px solid ${policy.borderColor}`,
                  }}
                >
                  <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>{policy.priority}</p>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    <p style={{ marginBottom: '4px' }}>Response: <strong>{policy.response}</strong></p>
                    <p>Resolution: <strong>{policy.resolution}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tickets</CardTitle>
            <CardDescription>Showing {tickets.length} tickets with SLA tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: ticket.isOverdue ? '#fef2f2' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                        #{ticket.ticketId}: {ticket.subject}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Assigned to: {ticket.assignedTo} • {ticket.createdAt}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: ticket.priority === 'urgent' ? '#fee2e2' : ticket.priority === 'high' ? '#fef3c7' : '#dbeafe',
                        color: ticket.priority === 'urgent' ? '#991b1b' : ticket.priority === 'high' ? '#92400e' : '#1e40af',
                      }}>
                        {ticket.priority}
                      </span>
                      {ticket.isOverdue && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                        }}>
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>SLA Progress</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>
                        {ticket.hoursRemaining > 0
                          ? `${ticket.hoursRemaining.toFixed(1)}h remaining`
                          : 'Overdue'}
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: ticket.isOverdue ? '#ef4444' : '#10b981',
                          width: `${Math.min(100, ticket.percentComplete)}%`,
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      {ticket.percentComplete.toFixed(0)}% of SLA time used
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Escalation Rules */}
        <Card style={{ marginTop: '30px', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <AlertCircle style={{ width: '20px', height: '20px', color: '#1e40af', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <p style={{ fontWeight: '600', color: '#1e3a8a', marginBottom: '8px' }}>Automatic Escalation Rules</p>
                <ul style={{ fontSize: '14px', color: '#1e40af', margin: 0, paddingLeft: '20px' }}>
                  <li>When 50% of response time SLA is used</li>
                  <li>When 75% of response time SLA is used</li>
                  <li>When SLA response time is exceeded</li>
                  <li>Escalated tickets are automatically assigned to senior support staff</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
