import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Calendar,
  Users,
  Send,
} from 'lucide-react';
import { useBoards } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import { InviteModal } from './BoardDetails';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: string;
  bgColor: string;
  subtitle: string;
  chartColor: string;
  chartPoints: string;
}

function StatCard({ icon, title, value, color, bgColor, subtitle, chartColor, chartPoints }: StatCardProps) {
  return (
    <div className="card flex flex-col justify-between h-32 relative overflow-hidden group">
      <div className="flex items-start justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto z-10 relative">
        <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
      </div>
      
      {/* Mock Chart Line */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
          <path
            d={chartPoints}
            fill="none"
            stroke={chartColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
          />
          <path
            d={`${chartPoints} L100,40 L0,40 Z`}
            fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
            opacity="0.2"
          />
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="1" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { boards, fetchBoards, loading: boardsLoading } = useBoards();
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchBoards();
    
    const fetchAllTasks = async () => {
      try {
        const { default: boardService } = await import('../services/boardService');
        const tasks = await boardService.getAllTasks();
        setAllTasks(tasks);
      } catch (error) {
        console.error('Failed to fetch all tasks', error);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchAllTasks();
  }, [fetchBoards]);

  const totalBoards = boards.length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.column_title === 'Done').length;
  const inProgressTasks = allTasks.filter((t) => t.column_title === 'In Progress').length;

  const recentBoards = boards.slice(0, 1);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (boardsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <span role="img" aria-label="wave" className="text-3xl">👋</span> Welcome back, {user?.name?.split(' ')[0] || 'mohamed'}!
          </h1>
          <p className="text-gray-400 text-sm">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2 text-sm text-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          {currentDate}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Folder className="w-5 h-5 text-violet-400" />}
          title="Total Boards"
          value={totalBoards || 1}
          color="text-violet-400"
          bgColor="bg-violet-500/20"
          subtitle="All your boards"
          chartColor="#8b5cf6"
          chartPoints="M0,30 Q25,20 50,25 T100,10"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
          title="Tasks Completed"
          value={completedTasks || 0}
          color="text-green-400"
          bgColor="bg-green-500/20"
          subtitle="Completed tasks"
          chartColor="#22c55e"
          chartPoints="M0,35 Q20,30 40,20 T70,25 T100,5"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-400" />}
          title="In Progress"
          value={inProgressTasks || 0}
          color="text-orange-400"
          bgColor="bg-orange-500/20"
          subtitle="Tasks in progress"
          chartColor="#f97316"
          chartPoints="M0,35 Q25,35 50,25 T100,15"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          title="Total Tasks"
          value={totalTasks || 0}
          color="text-blue-400"
          bgColor="bg-blue-500/20"
          subtitle="All tasks created"
          chartColor="#3b82f6"
          chartPoints="M0,25 Q30,10 60,20 T100,5"
        />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col h-full">
            <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Boards</h2>
              <Link
                to={ROUTES.BOARDS}
                className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentBoards.length === 0 ? (
              <div className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between h-64 bg-[#0a0f1d]">
                {/* Wavy Background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-[120%] h-[120%] -mr-[20%] -mt-[20%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/40 via-purple-900/20 to-transparent blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-[100%] h-[100%] -ml-[10%] -mb-[10%] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent blur-2xl"></div>
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,100 C150,200 250,0 400,100 L400,0 L0,0 Z" fill="url(#db-grad1)" opacity="0.3"></path>
                    <path d="M0,250 C150,350 250,150 400,200 L400,400 L0,400 Z" fill="url(#db-grad2)" opacity="0.5"></path>
                    <path d="M0,300 C100,250 200,400 400,300 L400,400 L0,400 Z" fill="url(#db-grad3)" opacity="0.8"></path>
                    <defs>
                      <linearGradient id="db-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="db-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
                      </linearGradient>
                      <linearGradient id="db-grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-12 h-12 bg-[#2a304e] rounded-xl flex items-center justify-center shadow-inner">
                    <Folder className="w-6 h-6 text-blue-400" />
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative z-10 mt-auto flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-white">No recent boards</h3>
                  <p className="text-gray-300 text-sm opacity-90 mb-4">Create one to get started</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#151A23] flex items-center justify-center text-xs font-bold text-white z-20">M</div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#151A23] flex items-center justify-center text-xs font-bold text-gray-300 z-10">+</div>
                    </div>
                    <span className="text-xs text-gray-300 ml-1">1 member</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 flex-1">
                {recentBoards.map((board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] flex flex-col justify-between h-64 bg-[#0a0f1d]"
                  >
                    {/* Wavy Background */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-80 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute top-0 right-0 w-[120%] h-[120%] -mr-[20%] -mt-[20%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/40 via-purple-900/20 to-transparent blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-[100%] h-[100%] -ml-[10%] -mb-[10%] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent blur-2xl"></div>
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,100 C150,200 250,0 400,100 L400,0 L0,0 Z" fill="url(#db-rb-grad1)" opacity="0.3"></path>
                        <path d="M0,250 C150,350 250,150 400,200 L400,400 L0,400 Z" fill="url(#db-rb-grad2)" opacity="0.5"></path>
                        <path d="M0,300 C100,250 200,400 400,300 L400,400 L0,400 Z" fill="url(#db-rb-grad3)" opacity="0.8"></path>
                        <defs>
                          <linearGradient id="db-rb-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="db-rb-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
                          </linearGradient>
                          <linearGradient id="db-rb-grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="w-12 h-12 bg-[#2a304e] rounded-xl flex items-center justify-center shadow-inner">
                        <Folder className="w-6 h-6 text-blue-400" />
                      </div>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" onClick={(e) => e.preventDefault()}>
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="relative z-10 mt-auto flex flex-col gap-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors drop-shadow-md">
                        {board.title}
                      </h3>
                      <p className="text-gray-300 text-sm opacity-90 mb-4 line-clamp-1">
                        {board.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 relative">
                          {(() => {
                            const displayUsers: any[] = [];
                            if (board.owner_id) displayUsers.push(board.owner_id);
                            if (board.members) displayUsers.push(...board.members);
                            return displayUsers.slice(0, 3).map((u, i) => (
                              <div key={u._id || u.id || i} className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#151A23] flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden" style={{ zIndex: 10 - i }}>
                                {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : (u.name ? u.name[0].toUpperCase() : 'U')}
                              </div>
                            ));
                          })()}
                          <button 
                            className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#151A23] flex items-center justify-center text-xs font-bold text-gray-300 hover:bg-gray-600 transition-colors z-0"
                            onClick={(e) => { 
                              e.preventDefault(); 
                              setShowInviteModal(board.id);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-gray-300 ml-1">{(board.members?.length || 0) + 1} members</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          </div>

          <div className="flex flex-col h-full">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <Link
              to={ROUTES.BOARDS}
              className="card p-4 hover:border-primary-500/50 hover:bg-surfaceHover transition-all flex items-center gap-4 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Create New Board</p>
                <p className="text-xs text-gray-400 mt-0.5">Start a new project</p>
              </div>
            </Link>

            <button
              className="card p-4 hover:border-green-500/50 hover:bg-surfaceHover transition-all flex items-center gap-4 cursor-pointer group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Add Task</p>
                <p className="text-xs text-gray-400 mt-0.5">Create a new task</p>
              </div>
            </button>
            
            <Link
              to="/calendar"
              className="card p-4 hover:border-purple-500/50 hover:bg-surfaceHover transition-all flex items-center gap-4 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">View Calendar</p>
                <p className="text-xs text-gray-400 mt-0.5">See your schedule</p>
              </div>
            </Link>
            
            <button
              className="card p-4 hover:border-orange-500/50 hover:bg-surfaceHover transition-all flex items-center gap-4 cursor-pointer group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Invite Members</p>
                <p className="text-xs text-gray-400 mt-0.5">Collaborate with team</p>
              </div>
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden w-full">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-32 h-auto hidden sm:block">
                <svg viewBox="0 0 100 80" className="w-full h-full opacity-80">
                   <rect x="10" y="20" width="30" height="40" rx="4" fill="#3b82f6" opacity="0.8" />
                   <rect x="20" y="10" width="30" height="40" rx="4" fill="#8b5cf6" opacity="0.9" />
                   <circle cx="70" cy="40" r="15" fill="#a855f7" opacity="0.5" />
                   <circle cx="80" cy="50" r="10" fill="#ec4899" opacity="0.6" />
                   <path d="M40 70 Q 60 50 80 60" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Activity Overview</h3>
                <p className="text-sm text-gray-400">No recent activity</p>
                <p className="text-xs text-gray-500 mt-1">Create a board or add tasks to see activity here.</p>
              </div>
            </div>
            <div className="relative z-10 hidden sm:block opacity-20">
              <Send className="w-12 h-12 transform -rotate-12" />
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InviteModal 
          isOpen={!!showInviteModal} 
          onClose={() => setShowInviteModal(null)} 
          boardId={showInviteModal} 
        />
      )}
      </div>
    </div>
  );
}

export default Dashboard;
