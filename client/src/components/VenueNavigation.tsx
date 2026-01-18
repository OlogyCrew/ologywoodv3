import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  MessageSquare,
  CreditCard,
  Users,
  Settings,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Home,
  Search,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const VENUE_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/venue-dashboard',
    icon: <Home size={20} />,
    description: 'Overview and contracts',
  },
  {
    label: 'Discover Artists',
    path: '/discover-artists',
    icon: <Search size={20} />,
    description: 'Find and favorite artists',
  },
  {
    label: 'Analytics',
    path: '/venue/analytics',
    icon: <BarChart3 size={20} />,
    description: 'Bookings and revenue',
  },
  {
    label: 'Events',
    path: '/venue/events',
    icon: <Calendar size={20} />,
    description: 'Manage your events',
  },
  {
    label: 'Booking Requests',
    path: '/venue/booking-requests',
    icon: <MessageSquare size={20} />,
    description: 'Handle artist requests',
  },
  {
    label: 'Messages',
    path: '/venue/messages',
    icon: <MessageSquare size={20} />,
    description: 'Chat with artists',
  },
  {
    label: 'Billing',
    path: '/venue/billing',
    icon: <CreditCard size={20} />,
    description: 'Payments and invoices',
  },
  {
    label: 'Team',
    path: '/venue/team',
    icon: <Users size={20} />,
    description: 'Manage team members',
  },
  {
    label: 'Settings',
    path: '/venue/settings',
    icon: <Settings size={20} />,
    description: 'Preferences and integrations',
  },
  {
    label: 'Onboarding',
    path: '/venue/onboarding',
    icon: <CheckSquare size={20} />,
    description: 'Setup guide and tutorials',
  },
];

interface VenueNavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function VenueNavigation({ isOpen = true, onClose }: VenueNavigationProps) {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Group navigation items by section
  const sections = {
    'Core': VENUE_NAV_ITEMS.slice(0, 2),
    'Management': VENUE_NAV_ITEMS.slice(2, 6),
    'Operations': VENUE_NAV_ITEMS.slice(6, 9),
    'Setup': VENUE_NAV_ITEMS.slice(9),
  };

  const NavContent = () => (
    <div className="space-y-2">
      {Object.entries(sections).map(([sectionName, items]) => (
        <div key={sectionName} className="mb-6">
          <button
            onClick={() => setExpandedSection(expandedSection === sectionName ? null : sectionName)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
          >
            <span>{sectionName}</span>
            {expandedSection === sectionName ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSection === sectionName && (
            <div className="space-y-1 mt-2">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => mobileOpen && setMobileOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="mt-0.5">{item.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 w-80 h-screen bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Venue Management</h2>
          <p className="text-sm text-gray-600 mt-1">Navigate your venue operations</p>
        </div>
        <div className="p-4">
          <NavContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50">
          <div className="absolute left-0 top-0 w-72 h-screen bg-white overflow-y-auto shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Venue Management</h2>
              <p className="text-sm text-gray-600 mt-1">Navigate your venue operations</p>
            </div>
            <div className="p-4">
              <NavContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Content Offset */}
      <div className="hidden lg:block w-80" />
    </>
  );
}

// Hook to check if user is in venue section
export const useIsVenueSection = () => {
  const location = useLocation();
  return location.pathname.includes('/venue') || location.pathname === '/discover-artists' || location.pathname === '/venue-dashboard';
};
