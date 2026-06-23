import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { ArrowLeft, Plus, Loader2, Star, KanbanSquare, List, Calendar, Users, Settings, Filter, Search } from 'lucide-react';
import { useBoards } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import boardService, { Task, Column } from '../services/boardService';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal from '../components/TaskModal';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  loading: boolean;
}

function AddColumnModal({ isOpen, onClose, onSubmit, loading }: AddColumnModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Add Column</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Column title"
            autoFocus
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export function InviteModal({ isOpen, onClose, boardId }: InviteModalProps) {
  const [users, setUsers] = useState<{id: string, name: string, email: string, avatar?: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);
  const { inviteUser, boards, currentBoard } = useBoards();
  const { addToast } = useToast();
  
  const targetBoard = boards.find(b => b.id === boardId) || currentBoard;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      boardService.getAllUsers()
        .then(data => setUsers(data))
        .catch(() => addToast('Failed to load users', 'error'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, addToast]);

  const handleInvite = async (userId: string) => {
    try {
      await inviteUser(boardId, userId);
      setInvitedUserIds(prev => [...prev, userId]);
      addToast('Invitation sent successfully!', 'success');
    } catch {
      // error handled in context
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4">Invite Members</h2>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surfaceHover border border-border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
            placeholder="Search by name or email..."
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No users found</p>
          ) : (
            filteredUsers.map(user => {
              const isMember = targetBoard?.members?.some((m: any) => (m._id || m.id || m) === user.id) || 
                               (typeof targetBoard?.owner_id === 'object' ? (targetBoard?.owner_id as any)._id === user.id : targetBoard?.owner_id === user.id);
              const isPending = invitedUserIds.includes(user.id);
              
              return (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-surfaceHover/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold text-white uppercase">
                      {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  {isMember ? (
                    <span className="text-xs font-medium text-gray-500 px-3 py-1 bg-surface rounded-full">Joined</span>
                  ) : isPending ? (
                    <span className="text-xs font-medium text-yellow-500 px-3 py-1 bg-surface rounded-full">Pending</span>
                  ) : (
                    <button
                      onClick={() => handleInvite(user.id)}
                      className="px-3 py-1 text-xs font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                    >
                      Invite
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function BoardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentBoard,
    columns,
    tasks,
    loading,
    fetchBoard,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    removeMember,
  } = useBoards();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'members'>('board');

  useEffect(() => {
    if (id) {
      fetchBoard(id);
    }
  }, [id, fetchBoard]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, type } = result;

      if (!destination) return;

      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      if (type === 'column') {
        const newColumns = Array.from(columns);
        const [removed] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, removed);

        const updates = newColumns.map((col, idx) => ({
          id: col.id,
          order_index: idx,
        }));

        await reorderColumns(id!, updates);
        return;
      }

      const sourceColumnId = source.droppableId;
      const destColumnId = destination.droppableId;

      const columnTasks = tasks.filter((t) => t.column_id === sourceColumnId);
      const newColumnTasks = Array.from(columnTasks);

      if (sourceColumnId === destColumnId) {
        const [removed] = newColumnTasks.splice(source.index, 1);
        newColumnTasks.splice(destination.index, 0, removed);

        const updates = newColumnTasks.map((task, idx) => ({
          id: task.id,
          column_id: destColumnId,
          order_index: idx,
        }));

        await reorderTasks(id!, updates);
      } else {
        const sourceTasks = tasks.filter((t) => t.column_id === sourceColumnId);
        const destTasks = tasks.filter((t) => t.column_id === destColumnId);

        const [movedTask] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, { ...movedTask, column_id: destColumnId });

        const allUpdates = [
          ...sourceTasks.map((task, idx) => ({
            id: task.id,
            column_id: sourceColumnId,
            order_index: idx,
          })),
          ...destTasks.map((task, idx) => ({
            id: task.id,
            column_id: destColumnId,
            order_index: idx,
          })),
        ];

        await reorderTasks(id!, allUpdates);
      }
    },
    [columns, tasks, id, reorderColumns, reorderTasks]
  );

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleAddTask = async (columnId: string, title: string) => {
    try {
      await createTask(id!, {
        column_id: columnId,
        title,
        priority: 'medium',
      });
      addToast('Task created!', 'success');
    } catch {
      addToast('Failed to create task', 'error');
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        due_date: updatedTask.due_date,
        labels: updatedTask.labels,
      });
    } catch {
      addToast('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      addToast('Task deleted', 'success');
    } catch {
      addToast('Failed to delete task', 'error');
    }
  };

  const handleAddColumn = async (title: string) => {
    setAddingColumn(true);
    try {
      await createColumn(id!, title);
      addToast('Column added!', 'success');
      setShowAddColumn(false);
    } catch {
      addToast('Failed to add column', 'error');
    } finally {
      setAddingColumn(false);
    }
  };

  const handleEditColumn = async (columnId: string, title: string) => {
    try {
      await updateColumn(columnId, { title });
    } catch {
      addToast('Failed to update column', 'error');
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (window.confirm('Are you sure? All tasks in this column will be deleted.')) {
      try {
        await deleteColumn(columnId);
        addToast('Column deleted', 'success');
      } catch {
        addToast('Failed to delete column', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Board not found</p>
        <button onClick={() => navigate('/boards')} className="btn btn-primary">
          Go to Boards
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -mt-2 -mx-2 max-w-[100vw] overflow-hidden">
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-3 text-sm mb-4">
          <div className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center shadow-sm">
            <KanbanSquare className="w-4 h-4 text-primary-500" />
          </div>
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <Link to="/boards" className="hover:text-white transition-colors">Boards</Link>
            <span>/</span>
            <span className="text-white font-bold">{currentBoard.title}</span>
          </div>
          <button className="ml-2 hover:bg-surfaceHover p-1 rounded-md transition-colors">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 scrollbar-none border-b border-border xl:border-none w-full xl:w-auto">
            <button 
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'board' ? 'bg-primary-600/20 text-primary-400' : 'bg-transparent text-gray-400 hover:text-white hover:bg-surfaceHover'}`}
            >
              <KanbanSquare className="w-4 h-4" />
              Board
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'members' ? 'bg-primary-600/20 text-primary-400' : 'bg-transparent text-gray-400 hover:text-white hover:bg-surfaceHover'}`}
            >
              <Users className="w-4 h-4" />
              Members
            </button>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-none">
            <div className="flex items-center gap-2 mr-2">
              <div className="flex -space-x-2">
                {(() => {
                  const displayUsers: any[] = [];
                  if (currentBoard?.owner_id) displayUsers.push(currentBoard.owner_id);
                  if (currentBoard?.members) displayUsers.push(...currentBoard.members);
                  
                  return displayUsers.slice(0, 5).map((u, i) => (
                    <div key={u._id || u.id || i} className="w-8 h-8 rounded-full bg-blue-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white overflow-hidden" style={{ zIndex: 40 - i }}>
                      {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : (u.name ? u.name[0].toUpperCase() : 'U')}
                    </div>
                  ));
                })()}
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-8 h-8 rounded-full bg-violet-600/30 border-2 border-violet-500/50 flex items-center justify-center text-violet-300 hover:bg-violet-600/50 hover:border-violet-400 hover:text-white transition-all shadow-sm"
                title="Invite members"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400">{((currentBoard?.members?.length || 0) + 1)} members</span>
            </div>
            
            <button className="p-2 bg-surface border border-border text-gray-400 rounded-lg hover:bg-surfaceHover hover:text-white transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
            
            <button onClick={() => setShowAddColumn(true)} className="btn btn-primary whitespace-nowrap text-sm py-2">
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Column
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
        {activeTab === 'board' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="column">
            {(provided) => (
              <div 
                className="flex gap-4 h-full items-start w-max"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((column, index) => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      tasks={tasks
                        .filter((t) => t.column_id === column.id)
                        .sort((a, b) => a.order_index - b.order_index)}
                      index={index}
                      onTaskClick={handleTaskClick}
                      onAddTask={handleAddTask}
                      onEditColumn={handleEditColumn}
                      onDeleteColumn={handleDeleteColumn}
                    />
                  ))}
                {provided.placeholder}
                  {showAddColumn && (
                    <div className="w-80 flex-shrink-0 card p-3 flex flex-col h-min animate-in fade-in slide-in-from-right-4 duration-200">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="font-bold text-sm text-white">Add Column</span>
                        <button onClick={() => setShowAddColumn(false)} className="text-gray-400 hover:text-white transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleAddColumn} disabled={addingColumn} className="btn btn-primary flex-1 py-1.5 text-sm">
                          {addingColumn ? 'Adding...' : 'Add Column'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="max-w-4xl mx-auto py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Board Members</h2>
            <div className="grid gap-4">
              {(() => {
                const isOwner = currentBoard?.owner_id && (typeof currentBoard.owner_id === 'object' ? (currentBoard.owner_id._id || currentBoard.owner_id.id) : currentBoard.owner_id) === user?.id;
                const membersList = [];
                if (currentBoard?.owner_id) membersList.push({ ...currentBoard.owner_id, isOwner: true });
                if (currentBoard?.members) membersList.push(...currentBoard.members.map(m => ({ ...m, isOwner: false })));

                return membersList.map((m: any, index: number) => (
                  <div key={m._id || m.id || index} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-lg font-bold text-white overflow-hidden">
                        {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : (m.name ? m.name[0].toUpperCase() : 'U')}
                      </div>
                      <div>
                        <p className="font-bold text-white">{m.name}</p>
                        <p className="text-sm text-gray-400">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {m.isOwner && (
                        <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider">
                          Owner
                        </span>
                      )}
                      {!m.isOwner && isOwner && (
                        <button 
                          onClick={() => {
                            const memberId = m._id || m.id;
                            if (window.confirm(`Are you sure you want to remove ${m.name}?`)) {
                              removeMember(currentBoard.id, memberId)
                                .then(() => addToast('Member removed', 'success'))
                                .catch(() => addToast('Failed to remove member', 'error'));
                            }
                          }}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      <AddColumnModal
        isOpen={showAddColumn}
        onClose={() => setShowAddColumn(false)}
        onSubmit={handleAddColumn}
        loading={addingColumn}
      />
      
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        boardId={id!}
      />
    </div>
  );
}

export default BoardDetails;
