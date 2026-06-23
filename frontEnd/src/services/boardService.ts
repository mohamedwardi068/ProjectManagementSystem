import api from './api';

export interface UserSnippet {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  owner_id: string | UserSnippet;
  members: (string | UserSnippet)[];
  columns?: Column[];
  created_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  order_index: number;
}

export interface Task {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels?: string[];
  due_date?: string;
  assigned_to?: string[];
  order_index: number;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  text: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  board_id: Board;
  sender_id: UserSnippet;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export const boardService = {
  async getBoards(): Promise<Board[]> {
    const response = await api.get<Board[]>('/boards');
    return response.data;
  },

  async searchBoardsByName(name: string): Promise<Board[]> {
    const response = await api.get<Board[]>(`/boards/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  async getBoard(id: string): Promise<Board> {
    const response = await api.get<Board>(`/boards/${id}`);
    return response.data;
  },

  async createBoard(title: string, description?: string): Promise<Board> {
    const response = await api.post<Board>('/boards', { title, description });
    return response.data;
  },

  async updateBoard(id: string, updates: Partial<Board>): Promise<Board> {
    const response = await api.put<Board>(`/boards/${id}`, updates);
    return response.data;
  },

  async deleteBoard(id: string): Promise<void> {
    await api.delete(`/boards/${id}`);
  },

  async getColumns(boardId: string): Promise<Column[]> {
    const response = await api.get<Column[]>(`/columns/${boardId}`);
    return response.data;
  },

  async createColumn(boardId: string, title: string): Promise<Column> {
    const response = await api.post<Column>(`/columns/${boardId}`, { title });
    return response.data;
  },

  async updateColumn(id: string, updates: Partial<Column>): Promise<Column> {
    const response = await api.put<Column>(`/columns/${id}`, updates);
    return response.data;
  },

  async deleteColumn(id: string): Promise<void> {
    await api.delete(`/columns/${id}`);
  },

  async reorderColumns(boardId: string, columns: { id: string; order_index: number }[]): Promise<void> {
    await api.post(`/columns/reorder/${boardId}`, { columns });
  },

  async getTasks(boardId: string): Promise<Task[]> {
    const response = await api.get<Task[]>(`/tasks/${boardId}`);
    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/task/${id}`);
    return response.data;
  },

  async createTask(boardId: string, task: Partial<Task>): Promise<Task> {
    const response = await api.post<Task>(`/tasks/${boardId}`, task);
    return response.data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, updates);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async moveTask(id: string, columnId: string, orderIndex: number): Promise<Task> {
    const response = await api.post<Task>(`/tasks/move/${id}`, {
      column_id: columnId,
      order_index: orderIndex,
    });
    return response.data;
  },

  async reorderTasks(boardId: string, tasks: { id: string; column_id: string; order_index: number }[]): Promise<void> {
    await api.post(`/tasks/reorder/${boardId}`, { tasks });
  },

  async getAllTasks(): Promise<(Task & { board_title?: string })[]> {
    const response = await api.get<(Task & { board_title?: string })[]>('/tasks/all/user');
    return response.data;
  },

  async getComments(taskId: string): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/comments/${taskId}`);
    return response.data;
  },

  async createComment(taskId: string, text: string): Promise<Comment> {
    const response = await api.post<Comment>(`/comments/${taskId}`, { text });
    return response.data;
  },

  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },

  async getAllUsers(): Promise<{id: string, name: string, email: string, avatar?: string}[]> {
    const response = await api.get<{id: string, name: string, email: string, avatar?: string}[]>('/users');
    return response.data;
  },

  async inviteUser(boardId: string, userId: string): Promise<Invitation> {
    const response = await api.post<Invitation>(`/boards/${boardId}/invites`, { userId });
    return response.data;
  },

  async removeMember(boardId: string, userId: string): Promise<Board> {
    const response = await api.delete<Board>(`/boards/${boardId}/members/${userId}`);
    return response.data;
  },

  async joinBoard(boardId: string): Promise<Board> {
    const response = await api.post<Board>(`/boards/${boardId}/join`);
    return response.data;
  },

  async getInvitations(): Promise<Invitation[]> {
    const response = await api.get<Invitation[]>('/invitations');
    return response.data;
  },

  async acceptInvitation(id: string): Promise<void> {
    await api.post(`/invitations/${id}/accept`);
  },

  async declineInvitation(id: string): Promise<void> {
    await api.post(`/invitations/${id}/decline`);
  },
};

export default boardService;
