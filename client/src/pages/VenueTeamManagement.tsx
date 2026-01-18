import React, { useState } from 'react';
import { Plus, Trash2, Shield, Clock, MessageSquare } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'coordinator' | 'promoter' | 'viewer';
  joinedDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

const ROLE_PERMISSIONS = {
  admin: ['Manage team', 'View all data', 'Approve bookings', 'Manage settings'],
  coordinator: ['Manage bookings', 'View analytics', 'Communicate with artists'],
  promoter: ['View bookings', 'Communicate with artists'],
  viewer: ['View bookings', 'View analytics'],
};

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800',
  coordinator: 'bg-blue-100 text-blue-800',
  promoter: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export default function VenueTeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Manager',
      email: 'john@venue.com',
      role: 'admin',
      joinedDate: '2025-01-01',
      lastActive: '2 hours ago',
      status: 'active',
    },
    {
      id: '2',
      name: 'Sarah Coordinator',
      email: 'sarah@venue.com',
      role: 'coordinator',
      joinedDate: '2025-01-15',
      lastActive: '30 minutes ago',
      status: 'active',
    },
  ]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'coordinator' as const });
  const [selectedTab, setSelectedTab] = useState<'members' | 'activity' | 'permissions'>('members');

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
        status: 'active',
      };
      setTeamMembers([...teamMembers, member]);
      setNewMember({ name: '', email: '', role: 'coordinator' });
      setShowAddMember(false);
    }
  };

  const handleDeleteMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleUpdateRole = (id: string, newRole: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Management</h1>
        <p className="text-gray-600 mb-8">Manage your venue team members, roles, and permissions</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('members')}
            className={`px-4 py-2 font-medium ${selectedTab === 'members' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Team Members
          </button>
          <button
            onClick={() => setSelectedTab('activity')}
            className={`px-4 py-2 font-medium ${selectedTab === 'activity' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Activity Log
          </button>
          <button
            onClick={() => setSelectedTab('permissions')}
            className={`px-4 py-2 font-medium ${selectedTab === 'permissions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Permissions
          </button>
        </div>

        {/* Team Members Tab */}
        {selectedTab === 'members' && (
          <div className="space-y-6">
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Team Member
            </button>

            {showAddMember && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Add New Team Member</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="coordinator">Coordinator</option>
                    <option value="promoter">Promoter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[member.role]}`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{member.lastActive}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    >
                      <option value="admin">Admin</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="promoter">Promoter</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {selectedTab === 'permissions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
              <div key={role} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold capitalize">{role}</h3>
                </div>
                <ul className="space-y-2">
                  {permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
