import React, { createContext, useContext, useState, useCallback } from 'react';
import boardService, { Board, Column, Task, Comment, Invitation } from '../services/boardService';

interface BoardContextType {
  boards: Board[];
  currentBoard: Board | null;
  columns: Column[];
  tasks: Task[];
  invitations: Invitation[];
  loading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (title: string, description?: string) => Promise<Board>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  closeBoard: (id: string) => Promise<void>;
  createColumn: (boardId: string, title: string) => Promise<Column>;
  updateColumn: (id: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  reorderColumns: (boardId: string, columns: { id: string; order_index: number }[]) => Promise<void>;
  createTask: (boardId: string, task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, columnId: string, orderIndex: number) => Promise<void>;
  reorderTasks: (boardId: string, tasks: { id: string; column_id: string; order_index: number }[]) => Promise<void>;
  getComments: (taskId: string) => Promise<Comment[]>;
  createComment: (taskId: string, text: string) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  inviteUser: (boardId: string, userId: string) => Promise<void>;
  removeMember: (boardId: string, userId: string) => Promise<void>;
  joinBoard: (boardId: string) => Promise<void>;
  fetchInvitations: () => Promise<void>;
  acceptInvitation: (id: string) => Promise<void>;
  declineInvitation: (id: string) => Promise<void>;
  clearError: () => void;
  setCurrentBoard: (board: Board | null) => void;
  setTasks: (tasks: Task[]) => void;
  setColumns: (columns: Column[]) => void;
}

const BoardContext = createContext<BoardContextType | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoard = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await boardService.getBoard(id);
      setCurrentBoard(data);
      setColumns(data.columns || []);
      const tasksData = await boardService.getTasks(id);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch board');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (title: string, description?: string) => {
    const data = await boardService.createBoard(title, description);
    setBoards((prev) => [...prev, data]);
    return data;
  }, []);

  const updateBoard = useCallback(async (id: string, updates: Partial<Board>) => {
    const data = await boardService.updateBoard(id, updates);
    setBoards((prev) => prev.map((b) => (b.id === id ? data : b)));
    if (currentBoard?.id === id) {
      setCurrentBoard(data);
    }
  }, [currentBoard]);

  const deleteBoard = useCallback(async (id: string) => {
    await boardService.deleteBoard(id);
    setBoards((prev) => prev.filter((b) => b.id !== id));
    if (currentBoard?.id === id) {
      setCurrentBoard(null);
      setColumns([]);
      setTasks([]);
    }
  }, [currentBoard]);

  const closeBoard = useCallback(async (id: string) => {
    const data = await boardService.closeBoard(id);
    setBoards((prev) => prev.map((b) => (b.id === id ? data : b)));
    if (currentBoard?.id === id) {
      setCurrentBoard(data);
    }
  }, [currentBoard]);

  const createColumn = useCallback(async (boardId: string, title: string) => {
    const data = await boardService.createColumn(boardId, title);
    setColumns((prev) => [...prev, data]);
    return data;
  }, []);

  const updateColumn = useCallback(async (id: string, updates: Partial<Column>) => {
    const data = await boardService.updateColumn(id, updates);
    setColumns((prev) => prev.map((c) => (c.id === id ? data : c)));
  }, []);

  const deleteColumn = useCallback(async (id: string) => {
    await boardService.deleteColumn(id);
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.column_id !== id));
  }, []);

  const reorderColumns = useCallback(async (boardId: string, cols: { id: string; order_index: number }[]) => {
    await boardService.reorderColumns(boardId, cols);
    setColumns((prev) =>
      prev.map((c) => {
        const update = cols.find((col) => col.id === c.id);
        return update ? { ...c, order_index: update.order_index } : c;
      })
    );
  }, []);

  const createTask = useCallback(async (boardId: string, task: Partial<Task>) => {
    const data = await boardService.createTask(boardId, task);
    setTasks((prev) => [...prev, data]);
    return data;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const data = await boardService.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await boardService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback(async (id: string, columnId: string, orderIndex: number) => {
    const data = await boardService.moveTask(id, columnId, orderIndex);
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
  }, []);

  const reorderTasks = useCallback(async (boardId: string, updatedTasks: { id: string; column_id: string; order_index: number }[]) => {
    await boardService.reorderTasks(boardId, updatedTasks);
    setTasks((prev) =>
      prev.map((t) => {
        const update = updatedTasks.find((ut) => ut.id === t.id);
        return update ? { ...t, column_id: update.column_id, order_index: update.order_index } : t;
      })
    );
  }, []);

  const getComments = useCallback(async (taskId: string) => {
    return await boardService.getComments(taskId);
  }, []);

  const createComment = useCallback(async (taskId: string, text: string) => {
    return await boardService.createComment(taskId, text);
  }, []);

  const deleteComment = useCallback(async (id: string) => {
    await boardService.deleteComment(id);
  }, []);

  const inviteUser = useCallback(async (boardId: string, userId: string) => {
    try {
      await boardService.inviteUser(boardId, userId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invite');
      throw err;
    }
  }, []);

  const removeMember = useCallback(async (boardId: string, userId: string) => {
    try {
      const updatedBoard = await boardService.removeMember(boardId, userId);
      if (currentBoard?.id === boardId) {
        setCurrentBoard(updatedBoard);
      }
      setBoards(prev => prev.map(b => b.id === boardId ? updatedBoard : b));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
      throw err;
    }
  }, [currentBoard]);

  const fetchInvitations = useCallback(async () => {
    try {
      const data = await boardService.getInvitations();
      setInvitations(data);
    } catch (err: any) {
      console.error('Failed to fetch invitations', err);
    }
  }, []);

  const acceptInvitation = useCallback(async (id: string) => {
    try {
      await boardService.acceptInvitation(id);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      await fetchBoards(); // Refresh boards list to include the newly joined board
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
      throw err;
    }
  }, [fetchBoards]);

  const declineInvitation = useCallback(async (id: string) => {
    try {
      await boardService.declineInvitation(id);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to decline invitation');
      throw err;
    }
  }, []);

  const joinBoard = useCallback(async (boardId: string) => {
    try {
      const updatedBoard = await boardService.joinBoard(boardId);
      if (currentBoard?.id === boardId) {
        setCurrentBoard(updatedBoard);
      }
      setBoards(prev => {
        if (!prev.find(b => b.id === updatedBoard.id)) {
          return [...prev, updatedBoard];
        }
        return prev.map(b => b.id === boardId ? updatedBoard : b);
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join board');
      throw err;
    }
  }, [currentBoard]);

  return (
    <BoardContext.Provider
      value={{
        boards,
        currentBoard,
        columns,
        tasks,
        invitations,
        loading,
        error,
        fetchBoards,
        fetchBoard,
        createBoard,
        updateBoard,
        deleteBoard,
        closeBoard,
        createColumn,
        updateColumn,
        deleteColumn,
        reorderColumns,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        reorderTasks,
        getComments,
        createComment,
        deleteComment,
        inviteUser,
        removeMember,
        joinBoard,
        fetchInvitations,
        acceptInvitation,
        declineInvitation,
        clearError,
        setCurrentBoard,
        setTasks,
        setColumns,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoards() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoards must be used within a BoardProvider');
  }
  return context;
}

export default BoardContext;
