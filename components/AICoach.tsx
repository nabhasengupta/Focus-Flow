import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { getCoachResponse, speakText } from '../services/gemini';

interface AICoachProps {
  onClose: () => void;
}

const AICoach: React.FC<AICoachProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Hey! I see you're feeling distracted. Take a deep breath. What's on your mind right now?", timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playAudio = async (text: string, msgId: string) => {
    try {
      if (playingId === msgId) {
        // Stop if currently playing this message
        if (currentSourceRef.current) {
          currentSourceRef.current.stop();
          currentSourceRef.current = null;
        }
        setPlayingId(null);
        return;
      }

      // Stop any other playing audio
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
      }

      setPlayingId(msgId); // Set loading/playing state

      const base64Audio = await speakText(text);
      
      // Initialize Audio Context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Decode
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      
      // Play
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setPlayingId(null);
        currentSourceRef.current = null;
      };
      
      currentSourceRef.current = source;
      source.start();

    } catch (err) {
      console.error("Audio playback failed", err);
      setPlayingId(null);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const responseText = await getCoachResponse(messages, inputText);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "Sorry, I lost my train of thought. Can you say that again?",
          timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-white/5">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-danger flex items-center justify-center shadow-lg shadow-accent/20">
             <span className="text-xl">🧠</span>
           </div>
           <div>
               <h3 className="font-bold text-lg text-white">Focus Coach</h3>
               <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Always Here</p>
           </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-md flex gap-3 items-start ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-primary to-blue-600 text-white font-medium rounded-br-none' 
                : 'bg-white/10 border border-white/5 text-slate-100 rounded-bl-none backdrop-blur-sm'
            }`}>
              <div className="flex-1 whitespace-pre-wrap">{msg.text}</div>
              
              {/* Play Button for Model Messages */}
              {msg.role === 'model' && (
                <button 
                  onClick={() => playAudio(msg.text, msg.id)}
                  className={`mt-0.5 p-1.5 rounded-full transition-all active:scale-95 shrink-0 ${
                    playingId === msg.id 
                      ? 'bg-accent text-white animate-pulse' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                  title="Listen"
                >
                   {playingId === msg.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                      </svg>
                   ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                   )}
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/5 mb-safe">
        <div className="flex gap-2">
            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="I'm stuck because..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 focus:outline-none focus:border-primary/50 text-white placeholder-slate-500 transition-colors"
            />
            <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 text-background rounded-full w-14 h-14 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;