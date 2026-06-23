import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Monitor, Palette, Volume2, MessageSquare, CheckCircle2, UserCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { STORAGE_KEYS } from '../utils/constants';

type Theme = 'dark' | 'light' | 'system';

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${
        enabled ? 'bg-violet-600' : 'bg-gray-700'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function Settings() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    taskAssigned: true,
    taskCompleted: true,
    comments: true,
  });
  const { addToast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    } else if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    applyTheme(newTheme);
    addToast(`Theme changed to ${newTheme}`, 'success');
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    addToast('Notification settings updated', 'success');
  };

  const notificationItems = [
    {
      key: 'email' as const,
      label: 'Email notifications',
      description: 'Receive email updates about your tasks',
      icon: <Bell className="w-4 h-4 text-violet-400" />,
    },
    {
      key: 'push' as const,
      label: 'Push notifications',
      description: 'Receive push notifications in your browser',
      icon: <Volume2 className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'taskAssigned' as const,
      label: 'Task assigned',
      description: 'Get notified when a task is assigned to you',
      icon: <UserCheck className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'taskCompleted' as const,
      label: 'Task completed',
      description: 'Get notified when a task is marked complete',
      icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    },
    {
      key: 'comments' as const,
      label: 'Comments',
      description: 'Get notified when someone comments on your tasks',
      icon: <MessageSquare className="w-4 h-4 text-orange-400" />,
    },
  ];

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode; bg: string }[] = [
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="w-5 h-5 text-indigo-300" />,
      bg: 'bg-[#0f1117]',
    },
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="w-5 h-5 text-yellow-400" />,
      bg: 'bg-gray-200',
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="w-5 h-5 text-gray-300" />,
      bg: 'bg-gray-600',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your preferences and notification settings.</p>
      </div>

      {/* Hero Banner — wavy style */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-lg bg-[#0a0f1d] min-h-[160px] flex items-center">
        {/* Wavy Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[120%] h-[120%] -mr-[20%] -mt-[20%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/40 via-purple-900/20 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[100%] h-[100%] -ml-[10%] -mb-[10%] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent blur-2xl"></div>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 C200,160 400,0 800,80 L800,0 L0,0 Z" fill="url(#set-grad1)" opacity="0.3"></path>
            <path d="M0,200 C250,280 500,120 800,180 L800,300 L0,300 Z" fill="url(#set-grad2)" opacity="0.5"></path>
            <path d="M0,240 C200,200 400,300 800,240 L800,300 L0,300 Z" fill="url(#set-grad3)" opacity="0.7"></path>
            <defs>
              <linearGradient id="set-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="set-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="set-grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#2a304e] border border-violet-500/30 flex items-center justify-center shadow-xl shadow-violet-900/30 flex-shrink-0">
            <Palette className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white drop-shadow-md">Customize your experience</h2>
            <p className="text-gray-300 text-sm mt-1">Control how the app looks and what alerts you receive.</p>
          </div>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Moon className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Appearance</h2>
            <p className="text-xs text-gray-500">Choose your preferred theme</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, label, icon, bg }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 group ${
                  isActive
                    ? 'border-violet-500 bg-violet-500/10 shadow-md shadow-violet-500/10'
                    : 'border-border hover:border-gray-600 hover:bg-surfaceHover'
                }`}
              >
                <div className="flex flex-col items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                    {icon}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${isActive ? 'text-violet-300' : 'text-gray-300 group-hover:text-white'}`}>
                    {label}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Notifications</h2>
            <p className="text-xs text-gray-500">Select the alerts you'd like to receive</p>
          </div>
        </div>

        <div className="space-y-1">
          {notificationItems.map(({ key, label, description, icon }, idx) => (
            <div
              key={key}
              className={`flex items-center justify-between py-3.5 px-1 ${
                idx > 0 ? 'border-t border-border/60' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surfaceHover border border-border flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
              </div>
              <Toggle
                enabled={notifications[key]}
                onChange={() => handleNotificationChange(key)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;
