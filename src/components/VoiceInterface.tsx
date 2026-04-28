
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInterfaceProps {
  onResult: (text: string) => void;
}

export const VoiceInterface = ({ onResult }: VoiceInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing'>('idle');

  const handleToggleRecording = () => {
    if (isRecording) {
      setStatus('processing');
      // Mock processing time
      setTimeout(() => {
        onResult("I think photosynthesis is how plants make food using sunlight.");
        setIsRecording(false);
        setStatus('idle');
      }, 1500);
    } else {
      setIsRecording(true);
      setStatus('listening');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-accent/5">
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
        isRecording ? "bg-red-100 text-red-600 animate-pulse scale-110" : "bg-primary/10 text-primary"
      )}>
        {status === 'processing' ? <Loader2 className="animate-spin w-8 h-8" /> : (isRecording ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8 opacity-50" />)}
      </div>
      
      <div className="text-center">
        <p className="font-medium">
          {status === 'listening' ? 'Listening...' : status === 'processing' ? 'Processing speech...' : 'Click to speak your answer'}
        </p>
        <p className="text-xs text-muted-foreground">Using voice recognition technology</p>
      </div>

      <Button 
        onClick={handleToggleRecording}
        disabled={status === 'processing'}
        variant={isRecording ? "destructive" : "default"}
        className="rounded-full w-full"
      >
        {isRecording ? "Stop Recording" : "Start Speaking"}
      </Button>
    </div>
  );
};
