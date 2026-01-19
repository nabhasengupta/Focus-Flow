import React, { useState } from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  title?: string;
}

const TaskItem: React.FC<{ task: Task; onToggle: () => void; onDelete: () => void; onEdit: () => void }> = ({ task, onToggle, onDelete, onEdit }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted && new Date(task.dueDate).toDateString() !== new Date().toDateString();

  const formatDate = (dateString: string | null) => {
      if(!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/^0+/, '');
  };

  const getGoogleCalLink = () => {
      const title = encodeURIComponent(task.title);
      const details = encodeURIComponent(task.context || "Created via FocusFlow");
      const dates = task.dueDate 
        ? new Date(task.dueDate).toISOString().replace(/-|:|\.\d\d\d/g,"") + "/" + new Date(new Date(task.dueDate).getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g,"")
        : "";
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div 
        className={`
            group mb-3 rounded-2xl border transition-all duration-200 flex items-stretch overflow-hidden
            ${task.isCompleted 
                ? 'bg-surface/30 border-white/5 opacity-60' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-primary/5'
            }
        `}
    >
        {/* Main Clickable Area - Triggers Edit */}
        <div 
            onClick={onEdit}
            className="flex-1 p-4 flex items-start gap-4 cursor-pointer select-none min-w-0"
        >
            {/* Checkbox */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={`
                    mt-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border
                    ${task.isCompleted 
                        ? 'bg-gradient-to-br from-primary to-blue-500 border-transparent scale-90' 
                        : 'bg-transparent border-slate-500 group-hover:border-primary'
                    }
                `}
            >
                {task.isCompleted && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                    </svg>
                )}
            </button>
            
            {/* Task Details */}
            <div className="flex-1 min-w-0 pt-0.5">
                <h3 className={`font-medium text-lg leading-snug tracking-tight transition-all ${task.isCompleted ? 'text-muted line-through' : 'text-slate-100'}`}>
                    {task.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    {task.dueDate && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5 ${isOverdue ? 'bg-danger/20 text-danger border border-danger/20' : 'bg-surface text-primary border border-white/5'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 opacity-70">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                            </svg>
                            {formatDate(task.dueDate)}
                        </span>
                    )}
                    
                    {task.hasMeeting && !task.isCompleted && (
                        <a 
                            href={getGoogleCalLink()} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-bold px-2 py-1 rounded-md bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                            </svg>
                            Sync
                        </a>
                    )}
                </div>

                {task.context && !task.isCompleted && (
                    <p className="mt-3 text-sm text-slate-400 line-clamp-2 pl-3 border-l-2 border-slate-700 italic">
                        {task.context}
                    </p>
                )}
            </div>
        </div>

        {/* Delete Button - Dedicated Column */}
        <div className="flex items-start justify-center p-2 pr-3 pt-3">
            <button 
                type="button"
                onClick={handleDelete}
                className="p-2 text-slate-500 hover:text-danger hover:bg-white/10 rounded-full transition-all active:scale-95 cursor-pointer z-10"
                title="Delete task"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 pointer-events-none">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDelete, onEdit, title }) => {
  const [completedOpen, setCompletedOpen] = useState(false);
  
  if (tasks.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-muted/50">
            <div className="w-20 h-20 rounded-full bg-surface/50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
            </div>
            <p className="font-medium tracking-wide text-sm">No tasks for {title?.toLowerCase() || 'now'}.</p>
        </div>
    );
  }

  const incomplete = tasks.filter(t => !t.isCompleted);
  const completed = tasks.filter(t => t.isCompleted);

  return (
    <div className="pb-32 px-4 space-y-6">
      <div>
        <h2 className="text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ml-1 opacity-70">{title || "Tasks"}</h2>
        {incomplete.length === 0 && <p className="text-sm text-muted italic ml-1 mb-4">You're all caught up!</p>}
        {incomplete.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={() => onToggleComplete(task.id)} 
              onDelete={() => onDelete(task.id)} 
              onEdit={() => onEdit(task)}
            />
        ))}
      </div>

      {completed.length > 0 && (
          <div className="pt-2">
             <button 
                onClick={() => setCompletedOpen(!completedOpen)}
                className="group flex items-center gap-3 w-full text-left py-2 hover:bg-white/5 rounded-lg px-2 transition-colors"
             >
                <div className={`p-1 rounded-md bg-surface border border-white/5 transition-transform duration-300 ${completedOpen ? 'rotate-90' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-muted">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted group-hover:text-slate-300">
                    Completed ({completed.length})
                </span>
             </button>
             
             {completedOpen && (
                 <div className="mt-3 space-y-1 animate-[slideIn_0.2s_ease-out]">
                    {completed.map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          onToggle={() => onToggleComplete(task.id)} 
                          onDelete={() => onDelete(task.id)}
                          onEdit={() => onEdit(task)}
                        />
                    ))}
                 </div>
             )}
          </div>
      )}
    </div>
  );
};

export default TaskList;