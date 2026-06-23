export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const PRIORITY_COLORS = {
  low: 'bg-gray-600 text-gray-100',
  medium: 'bg-blue-600 text-white',
  high: 'bg-orange-600 text-white',
  critical: 'bg-red-600 text-white',
};

export const PRIORITY_BG_COLORS = {
  low: 'bg-gray-600/20',
  medium: 'bg-blue-600/20',
  high: 'bg-orange-600/20',
  critical: 'bg-red-600/20',
};

export const DEFAULT_COLUMNS = [
  { title: 'To Do', order: 0 },
  { title: 'In Progress', order: 1 },
  { title: 'Review', order: 2 },
  { title: 'Done', order: 3 },
];

export const LABEL_COLORS = [
  { name: 'bug', color: 'bg-red-500' },
  { name: 'feature', color: 'bg-purple-500' },
  { name: 'enhancement', color: 'bg-blue-500' },
  { name: 'documentation', color: 'bg-yellow-500' },
  { name: 'urgent', color: 'bg-orange-500' },
  { name: 'help wanted', color: 'bg-green-500' },
];

export const STORAGE_KEYS = {
  TOKEN: 'taskflow_token',
  USER: 'taskflow_user',
  THEME: 'taskflow_theme',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  BOARDS: '/boards',
  BOARD: '/board/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};
