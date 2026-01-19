import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface EditTaskModalProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onSave, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [context, setContext] = useState(task.context || '');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    onSave({
      ...task,
      title,
      context
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative glass-panel w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-[slideUp_0.3s_ease-out] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 shrink-0">
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Edit Task</h2>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        {/* Form Fields - Scrollable Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="space-y-2">
              <label className="block text-[10px] text-primary font-bold uppercase tracking-widest ml-1">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-xl font-medium text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-700"
                placeholder="What needs to be done?"
              />
          </div>

          <div className="space-y-2 h-full flex flex-col">
            <label className="block text-[10px] text-primary font-bold uppercase tracking-widest ml-1">Context & Notes</label>
            <div className="relative flex-1 min-h-[150px]">
                <textarea 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full h-full bg-white/5 rounded-xl p-4 text-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/5 transition-all leading-relaxed placeholder-slate-600"
                    placeholder="Add details, meeting notes, or context here..."
                />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/5 shrink-0">
           <button 
             onClick={onClose}
             className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSave}
             className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all active:scale-95"
           >
             Save Changes
           </button>
        </div>

      </div>
    </div>
  );
};

export default EditTaskModal;