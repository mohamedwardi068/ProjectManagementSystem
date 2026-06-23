import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import boardService, { Task } from '../services/boardService';
import { useToast } from '../context/ToastContext';
import { PRIORITY_COLORS } from '../utils/constants';

type CalendarTask = Task & { board_title?: string };

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const allTasks = await boardService.getAllTasks();
        setTasks(allTasks);
      } catch (error) {
        addToast('Failed to load tasks for calendar', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [addToast]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] p-2 bg-surface/30 border border-border/50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const dayTasks = tasks.filter(task => {
        if (!task.due_date) return false;
        // The due_date from backend is usually ISO string, so we match the YYYY-MM-DD part
        return task.due_date.startsWith(dateStr);
      });

      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div 
          key={day} 
          className={`min-h-[120px] p-2 bg-surface border border-border/50 transition-colors hover:bg-surfaceHover ${isToday ? 'ring-2 ring-primary-500 ring-inset' : ''}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary-500 text-white' : 'text-gray-300'}`}>
              {day}
            </span>
            {dayTasks.length > 0 && (
              <span className="text-xs bg-surfaceHover px-1.5 py-0.5 rounded text-gray-400 font-medium">
                {dayTasks.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin">
            {dayTasks.map(task => (
              <div 
                key={task.id} 
                className={`text-xs p-1.5 rounded truncate border ${PRIORITY_COLORS[task.priority] || 'bg-gray-800 text-gray-300 border-gray-700'}`}
                title={`${task.title} (${task.board_title || 'Unknown Board'})`}
              >
                <div className="font-semibold truncate">{task.title}</div>
                {task.board_title && <div className="text-[10px] opacity-75 truncate">{task.board_title}</div>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary-500" />
            Calendar
          </h1>
          <p className="text-gray-400 text-sm">View tasks with due dates across all your boards.</p>
        </div>

        <div className="flex items-center gap-4 bg-surface p-1 rounded-lg border border-border">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-surfaceHover rounded-md transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-32 text-center font-bold text-white">
            {monthName} {year}
          </div>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-surfaceHover rounded-md transition-colors text-gray-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium bg-surfaceHover text-gray-300 hover:text-white rounded-md transition-colors ml-2"
          >
            Today
          </button>
        </div>
      </div>

      <div className="flex-1 bg-surface/50 border border-border rounded-xl overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 border-b border-border bg-surface shrink-0">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="p-3 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-7 h-full">
                {renderDays()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Calendar;
