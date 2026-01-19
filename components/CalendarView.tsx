import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, selectedDate, onSelectDate, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const hasTasksOnDay = (date: Date) => {
    return tasks.some(t => {
      if (!t.dueDate) return false;
      return isSameDay(new Date(t.dueDate), date) && !t.isCompleted;
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-2xl animate-[slideUp_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
           </svg>
        </button>
        <h3 className="font-bold text-lg text-white tracking-tight">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
           </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider py-2">{d}</div>
        ))}
        
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="h-10"></div>;
          
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const hasTask = hasTasksOnDay(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className="h-10 flex flex-col items-center justify-center relative rounded-full group"
            >
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200
                ${isSelected 
                    ? 'bg-gradient-to-br from-primary to-blue-500 text-white shadow-lg shadow-primary/25' 
                    : 'text-slate-300 group-hover:bg-white/10'
                }
                ${isToday && !isSelected ? 'border border-primary text-primary' : ''}
              `}>
                {date.getDate()}
              </div>
              
              <div className="h-1 mt-1">
                 {hasTask && !isSelected && <div className="w-1 h-1 rounded-full bg-accent"></div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;