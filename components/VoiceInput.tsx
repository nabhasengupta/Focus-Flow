import React, { useState, useRef, useEffect } from 'react';
import { AudioState } from '../types';

interface VoiceInputProps {
  onRecordingComplete: (blob: Blob) => void;
  audioState: AudioState;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onRecordingComplete, audioState }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      streamRef.current = audioStream;

      // Prefer standard codecs with lower bitrate for speed
      let options: MediaRecorderOptions = { audioBitsPerSecond: 32000 };
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(audioStream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const type = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        onRecordingComplete(blob);
        stopVisualizer();
        audioStream.getTracks().forEach(track => track.stop());
        setStream(null);
        streamRef.current = null;
      };

      // Collect data in small chunks to ensure we don't lose the end
      mediaRecorder.start(1000);
      setupVisualizer(audioStream);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const setupVisualizer = (audioStream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    drawVisualizer();
  };

  const stopVisualizer = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const scale = 1 + (average / 256) * 0.5;

      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 40 * scale);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 40 * scale, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
      ctx.fillStyle = '#bae6fd';
      ctx.fill();
    };

    draw();
  };

  useEffect(() => {
    return () => {
      stopVisualizer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRecording = !!stream;
  const isProcessing = audioState === AudioState.PROCESSING;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4">
      <div className="relative group">
        {/* Glow effect */}
        {isRecording && (
          <div className="absolute inset-0 bg-primary blur-2xl opacity-40 rounded-full animate-pulse"></div>
        )}
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300
            ${isRecording ? 'bg-surface border border-primary/50 scale-110' : 'bg-gradient-to-br from-primary to-blue-600 hover:shadow-primary/50 hover:scale-105 active:scale-95'}
            ${isProcessing ? 'bg-surface opacity-80 cursor-wait' : ''}
          `}
        >
          {isProcessing ? (
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isRecording ? (
            <canvas ref={canvasRef} width={80} height={80} className="absolute inset-0 rounded-full pointer-events-none" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
      <span className={`text-xs font-bold uppercase tracking-widest transition-opacity duration-300 ${isRecording ? 'text-primary' : 'text-slate-500'}`}>
        {isProcessing ? 'Thinking...' : isRecording ? 'Tap to Stop' : 'Tap to Add'}
      </span>
    </div>
  );
};

export default VoiceInput;