import React, { useState, useEffect } from 'react';
import { Task, ViewState, AudioState, UserProfile } from './types';
import { parseVoiceCommand } from './services/gemini';
import VoiceInput from './components/VoiceInput';
import TaskList from './components/TaskList';
import AICoach from './components/AICoach';
import CalendarView from './components/CalendarView';
import EditTaskModal from './components/EditTaskModal';
import SettingsModal from './components/SettingsModal';
import Onboarding from './components/Onboarding';

function App() {
  // Onboarding State
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('focusflow_onboarded') === 'true';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('focusflow_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [audioState, setAudioState] = useState<AudioState>(AudioState.IDLE);
  const [distractedMode, setDistractedMode] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('focusflow_notifications');
    return saved ? JSON.parse(saved) : true;
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('focusflow_profile');
    return saved ? JSON.parse(saved) : { name: '', email: '' };
  });

  useEffect(() => {
    localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('focusflow_notifications', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('focusflow_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('focusflow_onboarded', JSON.stringify(hasOnboarded));
  }, [hasOnboarded]);

  // Request notification permission if enabled
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setHasOnboarded(true);
  };

  const handleVoiceRecording = async (blob: Blob) => {
    setAudioState(AudioState.PROCESSING);
    try {
      const parsedTask = await parseVoiceCommand(blob);
      const newTask: Task = {
        id: Date.now().toString(),
        title: parsedTask.title || "Untitled Task",
        context: parsedTask.context,
        dueDate: parsedTask.dueDate || null,
        isCompleted: false,
        hasMeeting: parsedTask.hasMeeting || false,
        createdAt: new Date().toISOString()
      };
      
      setTasks(prev => [newTask, ...prev]);
      
      // Notification
      if (newTask.dueDate && notificationsEnabled) {
          const time = new Date(newTask.dueDate).toLocaleTimeString();
          if ('Notification' in window && Notification.permission === 'granted') {
              new Notification("Task Created", { body: `Scheduled "${newTask.title}" for ${time}` });
          }
      }

    } catch (error) {
      console.error(error);
      alert("Could not understand the task. Please try again.");
    } finally {
      setAudioState(AudioState.IDLE);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  // Logic to filter tasks for the view
  const getFilteredTasks = () => {
    const today = new Date();
    const isTodaySelected = selectedDate.toDateString() === today.toDateString();

    return tasks.filter(task => {
        // Always show tasks if no date is set and we are on "Today" view
        if (!task.dueDate && isTodaySelected) return true;

        if (task.dueDate) {
            const taskDate = new Date(task.dueDate);
            const isSameDay = taskDate.toDateString() === selectedDate.toDateString();
            
            // If viewing Today, also show Overdue tasks
            if (isTodaySelected) {
                return isSameDay || (taskDate < today && !task.isCompleted);
            }
            
            // Otherwise just show tasks for that specific date
            return isSameDay;
        }
        
        return false;
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false); 
  };

  const filteredTasks = getFilteredTasks();
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen font-sans antialiased overflow-hidden flex flex-col relative">
      
      {/* Header */}
      <header className="z-20 sticky top-0 transition-all duration-300">
         <div className={`px-6 pt-10 pb-4 flex justify-between items-center glass-panel border-b-0 rounded-b-3xl`}>
            <div onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="cursor-pointer active:opacity-70 group flex flex-col">
                <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center gap-2">
                    FocusFlow
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-primary transition-transform duration-300 ${isCalendarOpen ? 'rotate-180' : ''}`}>
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </h1>
                <p className="text-sm text-primary font-medium tracking-wide uppercase opacity-90 mt-1">
                    {isToday ? "Today" : selectedDate.toLocaleDateString(undefined, { weekday: 'short' })} • 
                    {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </p>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setDistractedMode(true)}
                    className="group relative px-4 py-2 rounded-full overflow-hidden"
                >
                    <div className="absolute inset-0 bg-danger/10 group-hover:bg-danger/20 transition-colors border border-danger/30 rounded-full"></div>
                    <span className="relative text-xs font-bold text-danger uppercase tracking-wider">Help</span>
                </button>
                
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                >
                   {/* Gear Icon */}
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative pt-4">
        <TaskList 
            tasks={filteredTasks} 
            onToggleComplete={toggleTask} 
            onDelete={deleteTask}
            onEdit={setEditingTask}
            title={isToday ? "Focus Queue" : "Scheduled Tasks"}
        />
      </main>

      {/* Floating Elements & Nav */}
      <VoiceInput onRecordingComplete={handleVoiceRecording} audioState={audioState} />

      {/* Bottom Spacer for FAB */}
      <div className="h-28 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none fixed bottom-0 w-full z-10"></div>

      {/* Distracted Mode Overlay */}
      {distractedMode && (
        <AICoach onClose={() => setDistractedMode(false)} />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal 
            task={editingTask} 
            onSave={handleUpdateTask} 
            onClose={() => setEditingTask(null)} 
        />
      )}

      {/* Calendar Overlay (Fixed to cover everything including mic) */}
      {isCalendarOpen && (
         <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsCalendarOpen(false)}
         >
             <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
                 <CalendarView 
                    tasks={tasks} 
                    selectedDate={selectedDate} 
                    onSelectDate={handleDateSelect} 
                    onClose={() => setIsCalendarOpen(false)}
                 />
             </div>
         </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={setNotificationsEnabled}
            onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;