'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/use-translation';

interface VoiceInterfaceProps {
  onResult: (text: string) => void;
}

/**
 * A robust, language-aware Voice Interface component.
 * Standardizes recognition logic to prevent engine crashes.
 */
export const VoiceInterface = ({ onResult }: VoiceInterfaceProps) => {
  const { lang } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const getLanguageTag = (appLang: string) => {
    switch (appLang) {
      case 'hi': return 'hi-IN';
      case 'kn': return 'kn-IN';
      default: return 'en-US';
    }
  };

  const initializeRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMessage("Speech recognition not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getLanguageTag(lang);

    recognition.onstart = () => {
      setStatus('listening');
      setIsRecording(true);
      setErrorMessage(null);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setStatus('error');
      setErrorMessage("Microphone error. Please try again.");
    };

    recognition.onend = () => {
      setIsRecording(false);
      setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setStatus('processing');
        onResult(transcript);
        setTimeout(() => setStatus('idle'), 1000);
      }
    };

    return recognition;
  }, [lang, onResult]);

  useEffect(() => {
    recognitionRef.current = initializeRecognition();
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [initializeRecognition]);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) recognitionRef.current = initializeRecognition();
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current = initializeRecognition();
        recognitionRef.current?.start();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-10 border-2 border-dashed rounded-[3rem] bg-primary/5 animate-in fade-in duration-500">
      {status === 'error' && errorMessage && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-black uppercase tracking-tight">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {isRecording && <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />}
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative z-10",
          isRecording ? "bg-red-500 text-white scale-110 shadow-red-500/30" : "bg-white text-primary border-2 border-primary/10",
          status === 'processing' && "bg-primary text-white"
        )}>
          {status === 'processing' ? <Loader2 className="animate-spin w-10 h-10" /> : (
            isRecording ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10 opacity-30" />
          )}
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <p className="text-xl font-black font-headline tracking-tighter text-foreground">
          {status === 'listening' ? 'Listening...' : status === 'processing' ? 'Processing...' : 'Speak Answer'}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          Detecting {lang.toUpperCase()} speech...
        </p>
      </div>

      <Button 
        onClick={handleToggleRecording}
        disabled={status === 'processing'}
        variant={isRecording ? "destructive" : "default"}
        className="h-16 rounded-[1.5rem] w-full font-black text-lg shadow-xl"
      >
        {isRecording ? "Stop" : "Start Voice Input"}
      </Button>
    </div>
  );
};
