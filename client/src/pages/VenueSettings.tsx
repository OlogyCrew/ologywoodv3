import React, { useState } from 'react';
import { Save, Bell, Lock, CreditCard, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

interface VenueSettings {
  venueName: string;
  location: string;
  capacity: number;
  amenities: string[];
  autoAcceptBookings: boolean;
  paymentTerms: 'immediate' | '30days' | '60days';
  notifyNewRequests: boolean;
  notifyAvailability: boolean;
  notifyPayments: boolean;
  calendarSync: boolean;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'check';
}

const AMENITIES = [
  'Sound System',
  'Stage',
  'Lighting',
  'Green Room',
  'Parking',
  'Accessibility',
  'WiFi',
  'Catering',
];

export default function VenueSettings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Check if user is a venue
  if (user?.role !== 'venue' && user?.role !== 'admin') {
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
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Venue Access Required</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            This page is only available for venue accounts.
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
  const [settings, setSettings] = useState<VenueSettings>({
    venueName: 'Main Hall Venue',
    location: 'New York, NY',
    capacity: 500,
    amenities: ['Sound System', 'Stage', 'Lighting'],
    autoAcceptBookings: false,
    paymentTerms: '30days',
    notifyNewRequests: true,
    notifyAvailability: true,
    notifyPayments: true,
    calendarSync: true,
    paymentMethod: 'credit_card',
  });

  const [selectedTab, setSelectedTab] = useState<'profile' | 'booking' | 'notifications' | 'payments'>('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleAmenity = (amenity: string) => {
    setSettings({
      ...settings,
      amenities: settings.amenities.includes(amenity)
        ? settings.amenities.filter(a => a !== amenity)
        : [...settings.amenities, amenity],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Venue Settings</h1>
        <p className="text-gray-600 mb-8">Customize your venue preferences and manage integrations</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('profile')}
            className={`px-4 py-2 font-medium ${selectedTab === 'profile' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setSelectedTab('booking')}
            className={`px-4 py-2 font-medium ${selectedTab === 'booking' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Booking Preferences
          </button>
          <button
            onClick={() => setSelectedTab('notifications')}
            className={`px-4 py-2 font-medium ${selectedTab === 'notifications' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Notifications
          </button>
          <button
            onClick={() => setSelectedTab('payments')}
            className={`px-4 py-2 font-medium ${selectedTab === 'payments' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Payments
          </button>
        </div>

        {/* Profile Tab */}
        {selectedTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
              <input
                type="text"
                value={settings.venueName}
                onChange={(e) => setSettings({ ...settings, venueName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={settings.capacity}
                  onChange={(e) => setSettings({ ...settings, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AMENITIES.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Booking Preferences Tab */}
        {selectedTab === 'booking' && (
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Auto-Accept Bookings</h3>
                <p className="text-sm text-gray-600">Automatically accept all booking requests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAcceptBookings}
                  onChange={(e) => setSettings({ ...settings, autoAcceptBookings: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
              <select
                value={settings.paymentTerms}
                onChange={(e) => setSettings({ ...settings, paymentTerms: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="immediate">Immediate Payment</option>
                <option value="30days">Net 30 Days</option>
                <option value="60days">Net 60 Days</option>
              </select>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {selectedTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">New Booking Requests</h3>
                  <p className="text-sm text-gray-600">Notify when artists request bookings</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyNewRequests}
                  onChange={(e) => setSettings({ ...settings, notifyNewRequests: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Artist Availability</h3>
                  <p className="text-sm text-gray-600">Notify when favorited artists become available</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyAvailability}
                  onChange={(e) => setSettings({ ...settings, notifyAvailability: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Updates</h3>
                  <p className="text-sm text-gray-600">Notify about payments and invoices</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyPayments}
                  onChange={(e) => setSettings({ ...settings, notifyPayments: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {selectedTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CreditCard size={16} />
                Default Payment Method
              </label>
              <select
                value={settings.paymentMethod}
                onChange={(e) => setSettings({ ...settings, paymentMethod: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Calendar Sync</h3>
                  <p className="text-sm text-gray-600">Sync bookings to your calendar</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.calendarSync}
                  onChange={(e) => setSettings({ ...settings, calendarSync: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Save size={20} />
            Save Changes
          </button>
          {saved && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg">
              ✓ Settings saved successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
