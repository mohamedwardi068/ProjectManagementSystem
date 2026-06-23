import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, Moon, ChevronDown, Check, X, MessageSquare, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBoards } from '../context/BoardContext';
import notificationService, { Notification } from '../services/notificationService';

interface NavbarProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

export function Navbar({ sidebarCollapsed, onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const { invitations, fetchInvitations, acceptInvitation, declineInvitation } = useBoards();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();
      fetchNotifications();
    }
  }, [user, fetchInvitations]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const unreadCount = invitations.length + notifications.filter(n => !n.read).length;

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-surfaceHover transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks, boards, people..."
              className="w-full pl-10 pr-12 py-2 bg-surface border border-border rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-surfaceHover border border-border rounded">⌘K</kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-surfaceHover transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-border bg-surfaceHover/30 flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  {notifications.some(n => !n.read) && (
                    <button 
                      onClick={(e) => handleMarkAsRead('all', e)}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {unreadCount === 0 && invitations.length === 0 && notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      No new notifications.
                    </div>
                  ) : (
                    <>
                      {invitations.map((inv) => (
                        <div key={inv.id} className="p-3 border-b border-border hover:bg-surfaceHover/50 transition-colors bg-surfaceHover/20">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white uppercase">
                              {inv.sender_id.avatar ? <img src={inv.sender_id.avatar} alt={inv.sender_id.name} className="w-full h-full rounded-full object-cover" /> : inv.sender_id.name[0]}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-300">
                                <span className="font-bold text-white">{inv.sender_id.name}</span> invited you to join <span className="font-bold text-white">{inv.board_id.title}</span>
                              </p>
                              <div className="flex gap-2 mt-2">
                                <button 
                                  onClick={() => acceptInvitation(inv.id)}
                                  className="flex-1 bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Accept
                                </button>
                                <button 
                                  onClick={() => declineInvitation(inv.id)}
                                  className="flex-1 bg-surfaceHover hover:bg-surface border border-border text-gray-300 text-xs font-medium py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 border-b border-border hover:bg-surfaceHover/50 transition-colors flex items-start gap-3 ${!notif.read ? 'bg-surfaceHover/10' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white ${notif.type === 'comment' ? 'bg-blue-600' : 'bg-green-600'}`}>
                            {notif.type === 'comment' ? <MessageSquare className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${!notif.read ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {!notif.read && (
                            <button 
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5"
                              title="Mark as read"
                            />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button className="p-2 rounded-lg hover:bg-surfaceHover transition-colors hidden sm:block">
            <Moon className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-border ml-2 cursor-pointer hover:bg-surfaceHover p-1.5 rounded-lg transition-colors">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-white leading-tight">{user?.name || 'mohamed'}</p>
              <p className="text-[10px] text-gray-400 leading-tight">View profile</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
