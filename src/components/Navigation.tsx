'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, User, GraduationCap, LogIn, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export const Navigation = () => {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { label: 'Learn', href: '/learn', icon: BookOpen },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-border z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0 px-6">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="hidden sm:inline font-headline font-black text-2xl tracking-tighter text-foreground">
            Shiksha<span className="text-primary">Setu</span>
          </span>
        </Link>
        <div className="flex gap-2 sm:gap-6">
          {user ? (
            navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-1 md:gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl",
                    isActive 
                      ? "text-primary bg-primary/5 shadow-sm" 
                      : "text-muted-foreground hover:text-primary hover:bg-secondary"
                  )}
                >
                  <Icon className={cn("h-5 w-5 md:h-4 md:w-4", isActive && "animate-pulse")} />
                  <span className="text-[10px] md:text-sm tracking-tight">{item.label}</span>
                </Link>
              );
            })
          ) : (
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-2 text-sm font-bold transition-all px-6 py-2 rounded-full border-2",
                pathname === "/login" 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
