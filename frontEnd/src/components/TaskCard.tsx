import React from 'react';
import { Paperclip, Circle, CheckCircle2 } from 'lucide-react';
import { Task } from '../services/boardService';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityStyles: Record<string, string> = {
  low: 'bg-green-500/10 text-green-500 border border-green-500/20',
  medium: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  high: 'bg-red-500/10 text-red-500 border border-red-500/20',
  critical: 'bg-red-600/20 text-red-400 border border-red-500/30',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isDone = false; // Mock for now, could be derived from column

  return (
    <div
      onClick={onClick}
      className="bg-surface border border-border rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-sm font-bold text-white leading-snug">{task.title}</h4>
        {isDone ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
      </div>

      <div className="mb-4">
        <span className={`text-[10px] px-2 py-0.5 rounded flex-inline font-bold uppercase tracking-wider ${priorityStyles[task.priority] || priorityStyles.medium}`}>
          {priorityLabels[task.priority] || 'Medium'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {/* Mock Avatars based on priority to match image, or use assigned_to */}
          <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white">
            M
          </div>
          {task.priority === 'high' && (
            <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white">
              A
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {dueDate && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
              <Paperclip className="w-3 h-3 transform -rotate-45" />
              <span>{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
