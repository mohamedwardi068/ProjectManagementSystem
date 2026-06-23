import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder, MoreHorizontal, Search, ChevronDown, User, Users, Star, Calendar } from 'lucide-react';
import { useBoards } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import boardService, { Board as BoardType } from '../services/boardService';

// ... (CreateBoardModal remains the same)
interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
  loading: boolean;
}

function CreateBoardModal({ isOpen, onClose, onSubmit, loading }: CreateBoardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim());
      setTitle('');
      setDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Create New Board</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="My Project Board"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px]"
              placeholder="What's this board about?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JoinBoardModal({ isOpen, onClose, onSubmit, loading }: { isOpen: boolean; onClose: () => void; onSubmit: (id: string) => void; loading: boolean; }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BoardType[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const results = await boardService.searchBoardsByName(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed", error);
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl flex flex-col max-h-[80vh]">
        <h2 className="text-xl font-bold text-white mb-4">Join a Board</h2>
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Board Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surfaceHover border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Type to search..."
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 mt-4">
            {searching ? (
              <div className="text-center py-4 text-gray-400 text-sm">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(board => (
                <div key={board.id} className="p-3 bg-surfaceHover rounded-lg border border-border flex justify-between items-center gap-3">
                  <div className="overflow-hidden">
                    <h4 className="text-white font-medium truncate">{board.title}</h4>
                    <p className="text-xs text-gray-400 truncate">Owner: {typeof board.owner_id === 'object' ? board.owner_id.name : 'Unknown'}</p>
                  </div>
                  <button 
                    onClick={() => onSubmit(board.id)} 
                    disabled={loading} 
                    className="btn btn-primary py-1.5 px-3 text-xs whitespace-nowrap flex-shrink-0"
                  >
                    {loading ? 'Joining...' : 'Join'}
                  </button>
                </div>
              ))
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-4 text-gray-400 text-sm">No boards found matching "{searchQuery}"</div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">Type at least 2 characters to search</div>
            )}
          </div>

          <div className="pt-4 border-t border-border mt-auto">
            <button type="button" onClick={onClose} className="btn btn-ghost w-full">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardCard({
  board,
  onDelete,
  isStarred,
  onToggleStar
}: {
  board: { id: string; title: string; description?: string; created_at: string; members?: string[] };
  onDelete: () => void;
  isStarred: boolean;
  onToggleStar: (e: React.MouseEvent) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const createdDate = new Date(board.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link to={`/board/${board.id}`} className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] flex flex-col justify-between h-64 bg-[#0a0f1d] border-none">
      
      {/* Wavy Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80 transition-opacity duration-300 group-hover:opacity-100">
        {/* Soft radial gradients for glowing effect */}
        <div className="absolute top-0 right-0 w-[120%] h-[120%] -mr-[20%] -mt-[20%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/30 via-purple-900/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[100%] h-[100%] -ml-[10%] -mb-[10%] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent blur-2xl"></div>
        
        {/* SVG Waves */}
        <svg className="absolute inset-0 w-full h-full object-cover" preserveAspectRatio="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          {/* Top subtle wave */}
          <path d="M0,100 C150,200 250,0 400,100 L400,0 L0,0 Z" fill="url(#grad1)" opacity="0.3"></path>
          {/* Middle primary wave */}
          <path d="M0,250 C150,350 250,150 400,200 L400,400 L0,400 Z" fill="url(#grad2)" opacity="0.5"></path>
          {/* Bottom overlapping wave */}
          <path d="M0,300 C100,250 200,400 400,300 L400,400 L0,400 Z" fill="url(#grad3)" opacity="0.8"></path>
          
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="w-12 h-12 bg-[#2a304e] rounded-xl flex items-center justify-center shadow-inner">
          <Folder className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex items-center gap-2">
          <button className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`} onClick={onToggleStar}>
            <Star className={`w-5 h-5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="relative z-10 mt-auto flex flex-col gap-1">
        <h3 className="text-xl font-bold text-white mb-0 group-hover:text-blue-100 transition-colors drop-shadow-md">
          {board.title}
        </h3>
        <p className="text-gray-300 text-sm opacity-90 mb-4 line-clamp-1">
          {board.description || 'blabla'}
        </p>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#151A23] flex items-center justify-center text-xs font-bold text-white shadow-sm z-20">
              M
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#151A23] flex items-center justify-center text-xs font-bold text-gray-300 shadow-sm z-10">
              +
            </div>
          </div>
          <span className="text-xs text-gray-300 ml-1">{(board.members?.length || 0) + 1} member{(board.members?.length || 0) + 1 !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
}

export function Boards() {
  const { boards, loading, fetchBoards, createBoard, deleteBoard, joinBoard } = useBoards();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filter, setFilter] = useState<'all' | 'personal' | 'shared' | 'starred'>('all');
  const [starredBoards, setStarredBoards] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('starredBoards') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreate = async (title: string, description: string) => {
    setCreating(true);
    try {
      await createBoard(title, description);
      addToast('Board created successfully!', 'success');
      setShowModal(false);
    } catch {
      addToast('Failed to create board', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (boardId: string) => {
    setJoining(true);
    try {
      await joinBoard(boardId);
      addToast('Successfully joined board!', 'success');
      setShowJoinModal(false);
    } catch {
      // error handled in context
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBoard(id);
      addToast('Board deleted', 'success');
    } catch {
      addToast('Failed to delete board', 'error');
    }
  };

  const filteredBoards = boards.filter((board) => {
    const matchesSearch = board.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          board.description?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isOwner = typeof board.owner_id === 'object' ? (board.owner_id as any)._id === user?.id || (board.owner_id as any).id === user?.id : board.owner_id === user?.id;

    if (filter === 'personal') return isOwner;
    if (filter === 'shared') return !isOwner;
    if (filter === 'starred') return starredBoards.includes(board.id);
    return true; // all
  });

  const toggleStar = (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStarredBoards(prev => {
      const newStarred = prev.includes(boardId) ? prev.filter(id => id !== boardId) : [...prev, boardId];
      localStorage.setItem('starredBoards', JSON.stringify(newStarred));
      return newStarred;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">All Boards</h1>
        <p className="text-gray-400 text-sm">Manage and organize all your project boards in one place.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-transparent text-gray-400 hover:text-white hover:bg-surfaceHover'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('personal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${filter === 'personal' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-transparent text-gray-400 hover:text-white hover:bg-surfaceHover'}`}
          >
            <User className="w-4 h-4" />
            Personal
          </button>
          <button 
            onClick={() => setFilter('shared')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${filter === 'shared' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-transparent text-gray-400 hover:text-white hover:bg-surfaceHover'}`}
          >
            <Users className="w-4 h-4" />
            Shared
          </button>
          <button 
            onClick={() => setFilter('starred')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${filter === 'starred' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-transparent text-gray-400 hover:text-white hover:bg-surfaceHover'}`}
          >
            <Star className="w-4 h-4" />
            Starred
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              placeholder="Search boards..."
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-gray-300 hover:bg-surfaceHover hover:text-white transition-colors whitespace-nowrap">
            Newest first
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoards.map((board) => (
          <BoardCard 
            key={board.id} 
            board={board} 
            onDelete={() => handleDelete(board.id)} 
            isStarred={starredBoards.includes(board.id)}
            onToggleStar={(e) => toggleStar(board.id, e)}
          />
        ))}
        
        {/* Create New Board Card */}
        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-gray-700 rounded-2xl h-64 flex flex-col items-center justify-center text-center hover:border-gray-500 hover:bg-surfaceHover/50 transition-all group"
        >
          <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Create New Board</h3>
          <p className="text-gray-400 text-sm">Start organizing your ideas</p>
        </button>
        <button
          onClick={() => setShowJoinModal(true)}
          className="border-2 border-dashed border-gray-700/50 rounded-2xl h-64 flex flex-col items-center justify-center text-center hover:border-gray-500 hover:bg-surfaceHover/30 transition-all group"
        >
          <div className="w-12 h-12 bg-surface/50 border border-border/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-gray-500 group-hover:text-gray-300 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-300 mb-1">Join a Board</h3>
          <p className="text-gray-500 text-sm">Search by board name to collaborate</p>
        </button>
      </div>

      <CreateBoardModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        loading={creating}
      />
      <JoinBoardModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoin}
        loading={joining}
      />
    </div>
  );
}

export default Boards;
