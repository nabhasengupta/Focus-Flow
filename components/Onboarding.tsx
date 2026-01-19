import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinish = () => {
    if (!name.trim()) return;
    onComplete({ name: name, email: '' }); // Email optional for now
  };

  const content = [
    {
      title: "Quiet The Chaos",
      text: "The world wasn't built for your brain. FocusFlow was. We turn the noise in your head into clear, manageable steps—without the overwhelm.",
      icon: (
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow delay-75 translate-x-4"></div>
          <div className="absolute inset-0 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow delay-150 -translate-x-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        </div>
      )
    },
    {
      title: "Capture Speed",
      text: "Don't type. Don't organize. Just speak. Our AI extracts dates, details, and meetings instantly, so you never lose a brilliant idea to friction again.",
      icon: (
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-surface to-background border border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </div>
      )
    },
    {
      title: "Paralysis Ends Here",
      text: "Stuck? Overwhelmed? Tap the 'Help' button. Your AI Coach is ready 24/7 to unblock you, break tasks down, and replace shame with momentum.",
      icon: (
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-danger/20 to-accent/20 border border-danger/30 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-danger/10 rounded-full animate-ping opacity-20"></div>
          <span className="text-4xl">❤️‍🩹</span>
        </div>
      )
    },
    {
      title: "Ready to Flow?",
      text: "Let's make this space yours. What should we call you?",
      isInput: true,
      icon: (
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-8 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Icon Container */}
        <div className="mb-4 transform transition-all duration-500 ease-out hover:scale-105">
           {content[step].icon}
        </div>

        {/* Text Content */}
        <div className="space-y-4 min-h-[180px]">
          <h1 className="text-3xl font-bold tracking-tight text-white animate-[slideUp_0.3s_ease-out]">
            {content[step].title}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed animate-[slideUp_0.4s_ease-out]">
            {content[step].text}
          </p>

          {content[step].isInput && (
             <div className="pt-4 animate-[slideUp_0.5s_ease-out]">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-center text-xl text-white focus:outline-none focus:border-primary/50 transition-colors placeholder-slate-600"
                  autoFocus
                />
             </div>
          )}
        </div>

        {/* Navigation Dots */}
        <div className="flex gap-2 pt-4">
          {content.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="w-full pt-8 flex gap-4">
           {step > 0 && (
             <button 
                onClick={prevStep}
                className="flex-1 py-4 rounded-2xl text-slate-400 font-medium hover:bg-white/5 transition-colors"
             >
                Back
             </button>
           )}
           
           <button 
              onClick={step === content.length - 1 ? handleFinish : nextStep}
              disabled={step === content.length - 1 && !name.trim()}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95
                ${step === content.length - 1 && !name.trim() 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-primary/40'
                }
              `}
           >
              {step === content.length - 1 ? "Let's Begin" : "Next"}
           </button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;