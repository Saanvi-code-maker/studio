'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VoiceInterfaceProps {
  onResult: (text: string) => void;
}

/**
 * A professional Voice Interface component that utilizes the Web Speech API.
 * It provides real-time feedback, error handling, and a high-fidelity UI.
 */
export const VoiceInterface = ({ onResult }: VoiceInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support of the Speech Recognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMessage("Voice recognition is not supported in this browser. Please use Chrome or Edge for the best experience.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // This could be dynamically set based on user language preference

    recognition.onstart = () => {
      setStatus('listening');
      setIsRecording(true);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      setStatus('error');
      
      let msg = "Something went wrong. Please try again.";
      if (event.error === 'not-allowed') msg = "Microphone access denied. Please enable it in your browser settings.";
      if (event.error === 'no-speech') msg = "No speech detected. Please speak closer to the microphone.";
      
      setErrorMessage(msg);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (status !== 'error' && status !== 'processing') {
        setStatus('idle');
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setStatus('processing');
      // Briefly show processing state for a smooth UI transition
      setTimeout(() => {
        onResult(transcript);
        setStatus('idle');
      }, 800);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult, status]);

  const handleToggleRecording = () => {
    if (status === 'error' && !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-10 border-2 border-dashed rounded-[3rem] bg-primary/5 transition-all animate-in fade-in duration-500">
      {status === 'error' && errorMessage && (
        <Alert variant="destructive" className="rounded-2xl border-2 bg-white/50 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-black uppercase tracking-tight">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
        )}
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative z-10",
          isRecording 
            ? "bg-red-500 text-white scale-110 shadow-red-500/30" 
            : "bg-white text-primary border-2 border-primary/10"
        )}>
          {status === 'processing' ? (
            <Loader2 className="animate-spin w-10 h-10" />
          ) : (
            isRecording ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10 opacity-30" />
          )}
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <p className="text-xl font-black font-headline tracking-tighter text-foreground">
          {status === 'listening' ? 'Listening...' : status === 'processing' ? 'Synthesizing...' : 'Speak your answer'}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 max-w-[200px] leading-relaxed">
          {status === 'listening' ? 'We are capturing your explanation' : 'AI is interpreting your voice input'}
        </p>
      </div>

      <Button 
        onClick={handleToggleRecording}
        disabled={status === 'processing' || (status === 'error' && !recognitionRef.current)}
        variant={isRecording ? "destructive" : "default"}
        className="h-16 rounded-[1.5rem] w-full font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
      >
        {isRecording ? "Finish Speaking" : "Start Voice Input"}
      </Button>
    </div>
  );
};