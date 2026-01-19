import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Users } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'artist' | 'venue' | 'admin' | 'user';
  createdAt: string;
  // Note: status field removed as it doesn't exist in the users table schema
}

export const AdminUserManagement: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedRole, setEditedRole] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // TRPC queries and mutations
  const getAllUsersQuery = trpc.adminUsers.getAllUsers.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const updateUserMutation = trpc.adminUsers.updateUser.useMutation({
    onSuccess: () => {
      // Refetch users after update
      getAllUsersQuery.refetch();
      setEditingUser(null);
      alert('User role updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + error.message);
    },
  });

  // Load users on component mount
  useEffect(() => {
    if (getAllUsersQuery.data) {
      setUsers(getAllUsersQuery.data);
      setLoading(false);
    }
  }, [getAllUsersQuery.data]);

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
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        role: editedRole as 'artist' | 'venue' | 'admin' | 'user',
        status: 'active', // Default status since it doesn't exist in schema
      });
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Users size={28} style={{ color: '#7c3aed' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>User Management</h1>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>Manage user roles, status, and permissions</p>
      </div>

      {/* Search and Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
      }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          <option value="all">All Roles</option>
          <option value="artist">Artist</option>
          <option value="venue">Venue</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>


      </div>

      {/* Users Table */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Role</th>

              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Joined</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{u.name}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: u.role === 'admin' ? '#fecaca' : u.role === 'artist' ? '#bfdbfe' : '#d1d5db',
                      color: u.role === 'admin' ? '#7f1d1d' : u.role === 'artist' ? '#1e40af' : '#374151',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {u.role}
                    </span>
                  </td>

                  <td style={{ padding: '12px', color: '#6b7280' }}>{u.createdAt}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setEditedRole(u.role);
                      }}
                      style={{
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Edit User: {editingUser.name}
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Role</label>
              <select
                value={editedRole}
                onChange={(e) => setEditedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                <option value="artist">Artist</option>
                <option value="venue">Venue</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>



            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={updateUserMutation.isPending}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updateUserMutation.isPending ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: updateUserMutation.isPending ? 0.7 : 1,
                }}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
