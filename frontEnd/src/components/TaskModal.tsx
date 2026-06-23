import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Tag, Users, Save, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { Task, Comment } from '../services/boardService';
import { useBoards } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRIORITY_COLORS, PRIORITIES } from '../utils/constants';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function TaskModal({ task, isOpen, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date?.split('T')[0] || '');
  const [labels, setLabels] = useState(task.labels?.join(', ') || '');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { getComments, createComment, deleteComment } = useBoards();
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && task.id) {
      loadComments();
    }
  }, [isOpen, task.id]);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.due_date?.split('T')[0] || '');
    setLabels(task.labels?.join(', ') || '');
  }, [task]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(task.id);
      setComments(data);
    } catch {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedTask = {
        ...task,
        title,
        description,
        priority,
        due_date: dueDate || null,
        labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
      };
      onUpdate(updatedTask as Task);
      addToast('Task updated!', 'success');
      onClose();
    } catch {
      addToast('Failed to update task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const comment = await createComment(task.id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
    } catch {
      addToast('Failed to add comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch {
      addToast('Failed to delete comment', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Task Details</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Add a description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="input"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabels[p]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Labels
            </label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="input"
              placeholder="bug, feature, enhancement (comma separated)"
            />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Comments</h3>
            </div>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-100">{comment.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                      {comment.author_id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 rounded hover:bg-gray-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="input flex-1"
                placeholder="Add a comment..."
              />
              <button onClick={handleAddComment} className="btn btn-primary">
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
