import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
  Rocket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.BOARDS, icon: KanbanSquare, label: 'Boards' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: ROUTES.PROFILE, icon: User, label: 'Profile' },
  { to: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-background border-r border-border transition-all duration-300 z-40 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-6">
        <div className={`flex items-center gap-3 ${collapsed ? 'hidden' : ''}`}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TaskFlow</span>
        </div>
        {collapsed && (
          <div className="mx-auto">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-gray-400 hover:bg-surfaceHover hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon className={`w-5 h-5 flex-shrink-0`} />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        {!collapsed && (
          <div className="card-gradient mb-4 p-4 text-center rounded-2xl relative">
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <Rocket className="w-16 h-16 text-white transform rotate-12 -mt-4 -mr-4" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-white mb-1">Go Premium</h4>
              <p className="text-xs text-blue-100 mb-4 opacity-80">Unlock more features and boost your productivity.</p>
              <button className="w-full py-2 bg-white text-primary-900 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        <div className={`p-3 rounded-xl bg-surface border border-border flex items-center gap-3 mb-2 ${collapsed ? 'justify-center' : ''}`}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold border-2 border-surface">
              {user?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'mohamed'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'mohamed@gmail.com'}</p>
            </div>
          )}
          {!collapsed && <ChevronRight className="w-4 h-4 text-gray-500" />}
        </div>
        
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-surfaceHover hover:text-white transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
