'use client';

import { GraduationCap, Sparkles } from 'lucide-react';

export const SplashScreen = ({ message = "Initializing ShikshaSetu" }: { message?: string }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background hero-gradient">
      <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
          <div className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl relative z-10 animate-float">
            <GraduationCap className="w-12 h-12" />
          </div>
          <div className="absolute -top-4 -right-4 text-primary animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black font-headline tracking-tighter text-foreground">
            Shiksha<span className="text-primary">Setu</span>
          </h1>
          <div className="flex flex-col items-center gap-1">
            <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress-loop" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mt-2 animate-pulse">
              {message}
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-12 text-center">
        <span className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground/30">
          Bridging the knowledge gap with AI
        </span>
      </div>
    </div>
  );
};
