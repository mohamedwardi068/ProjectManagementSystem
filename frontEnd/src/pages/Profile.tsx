import React, { useState } from 'react';
import { User, Mail, Lock, Save, Loader2, Shield, Calendar, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const response = await api.put('/users/profile', { name });
      updateUser(response.data);
      addToast('Profile updated!', 'success');
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password changed!', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown';

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
        <p className="text-gray-400 text-sm">Manage your personal information and security settings.</p>
      </div>

      {/* Hero Card — wavy style */}
      <div className="group relative overflow-hidden rounded-2xl p-8 text-white shadow-lg bg-[#0a0f1d] min-h-[200px] flex flex-col justify-between">
        {/* Wavy Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[120%] h-[120%] -mr-[20%] -mt-[20%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/40 via-purple-900/20 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[100%] h-[100%] -ml-[10%] -mb-[10%] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent blur-2xl"></div>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 C200,160 400,0 800,80 L800,0 L0,0 Z" fill="url(#prof-grad1)" opacity="0.3"></path>
            <path d="M0,200 C250,280 500,120 800,180 L800,300 L0,300 Z" fill="url(#prof-grad2)" opacity="0.5"></path>
            <path d="M0,240 C200,200 400,300 800,240 L800,300 L0,300 Z" fill="url(#prof-grad3)" opacity="0.7"></path>
            <defs>
              <linearGradient id="prof-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="prof-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="prof-grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover shadow-xl border-2 border-white/10" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#2a304e] border-2 border-violet-500/30 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-violet-900/30">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white drop-shadow-md truncate">{user?.name || 'Unknown'}</h2>
            <p className="text-gray-300 text-sm mt-0.5 truncate">{user?.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                Member since {createdAt}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Edit Profile</h2>
            <p className="text-xs text-gray-500">Update your display name</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="input opacity-40 cursor-not-allowed"
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-600 mt-1.5">Email address cannot be changed</p>
          </div>

          <button type="submit" disabled={loadingProfile} className="btn btn-primary flex items-center gap-2">
            {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Security</h2>
            <p className="text-xs text-gray-500">Update your password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="New password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
              Passwords do not match
            </p>
          )}

          <button type="submit" disabled={loadingPassword} className="btn btn-secondary flex items-center gap-2">
            {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
