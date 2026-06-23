import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import { Column, Task } from '../services/boardService';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  index: number;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string, title: string) => void;
  onEditColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

const columnColors: Record<string, string> = {
  'To Do': 'bg-blue-500',
  'In Progress': 'bg-yellow-500',
  'Review': 'bg-purple-500',
  'Done': 'bg-green-500',
};

export function KanbanColumn({
  column,
  tasks,
  index,
  onTaskClick,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setShowAddCard(false);
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onEditColumn(column.id, editTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const dotColor = columnColors[column.title] || 'bg-gray-400';

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex-shrink-0 w-80 bg-surface/80 rounded-xl flex flex-col max-h-[calc(100vh-14rem)] border border-border"
        >
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between p-4 border-b border-border/50"
          >
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input py-1 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                />
                <button onClick={handleSaveEdit} className="btn btn-primary py-1 px-2 text-sm">
                  Save
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                  {column.title}
                  <span className="text-xs bg-surfaceHover px-2 py-0.5 rounded-full text-gray-400 font-medium ml-1">
                    {tasks.length}
                  </span>
                </h3>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded hover:bg-surfaceHover transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                      <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-border rounded-lg shadow-xl z-20 py-1">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setIsEditing(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-surfaceHover"
                        >
                          <Edit2 className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onDeleteColumn(column.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-surfaceHover"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-3 overflow-y-auto scrollbar-thin min-h-[100px] space-y-3 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-primary-500/5' : ''
                }`}
              >
                {tasks.map((task, taskIndex) => (
                  <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                      >
                        <TaskCard task={task} onClick={() => onTaskClick(task)} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="p-3">
            {showAddCard ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="input py-1.5 text-sm"
                  placeholder="Enter task title..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask();
                    if (e.key === 'Escape') {
                      setShowAddCard(false);
                      setNewTaskTitle('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button onClick={handleAddTask} className="btn btn-primary py-1.5 px-3 text-sm flex-1">
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCard(false);
                      setNewTaskTitle('');
                    }}
                    className="btn btn-ghost py-1.5 px-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCard(true)}
                className="w-full py-2.5 rounded-lg text-gray-400 bg-surfaceHover hover:bg-border hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default KanbanColumn;
