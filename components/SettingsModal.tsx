import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  userProfile, 
  onUpdateProfile, 
  notificationsEnabled, 
  onToggleNotifications, 
  onClose 
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    onUpdateProfile({ name, email });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative glass-panel w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Settings</h2>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Profile Section */}
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary/20 shrink-0">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Profile</h3>
                    <p className="text-xs text-slate-400">Manage your personal details</p>
                </div>
             </div>

             <div className="space-y-4 pt-2">
                <div>
                    <label className="block text-[10px] text-primary font-bold uppercase tracking-widest ml-1 mb-1">Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Your Name"
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-primary font-bold uppercase tracking-widest ml-1 mb-1">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="email@example.com"
                    />
                </div>
             </div>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          {/* Preferences Section */}
          <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Preferences</h3>
              
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                  <div>
                      <div className="font-medium text-slate-200">Push Notifications</div>
                      <div className="text-xs text-slate-500">Get reminders for upcoming tasks</div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => onToggleNotifications(!notificationsEnabled)}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${notificationsEnabled ? 'bg-primary' : 'bg-slate-700'}`}
                  >
                      <span 
                        className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ease-in-out ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                  </button>
              </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end bg-white/5">
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

export default SettingsModal;