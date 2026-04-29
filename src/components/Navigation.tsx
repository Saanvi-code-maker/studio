'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  User, 
  GraduationCap, 
  LogIn, 
  LayoutDashboard,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { useStore } from '@/lib/store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Navigation = () => {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { t, lang } = useTranslation();
  const { setLanguage } = useStore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userDocRef);
  const isTeacher = profile?.role === 'teacher';

  const navItems = [
    { label: t.nav.learn, href: '/learn', icon: BookOpen },
    { label: t.nav.teacher, href: '/teacher', icon: LayoutDashboard, teacherOnly: true },
    { label: t.nav.profile, href: '/profile', icon: User },
  ].filter(item => !item.teacherOnly || isTeacher);

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 glass-nav z-50 h-20 hidden md:block px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <Link href="/" className="flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline font-black text-2xl tracking-tighter text-foreground">
              Shiksha<span className="text-primary">Setu</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground/60" />
              <Select value={lang} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] h-10 rounded-xl border-none bg-secondary/30 font-black text-[10px] uppercase tracking-widest focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  <SelectItem value="en" className="text-xs font-bold uppercase tracking-widest py-3">English</SelectItem>
                  <SelectItem value="hi" className="text-xs font-bold uppercase tracking-widest py-3">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="kn" className="text-xs font-bold uppercase tracking-widest py-3">ಕನ್ನಡ (Kannada)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isUserLoading && user ? (
              <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-[1.5rem] border border-border/50">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-black transition-all px-5 py-2.5 rounded-[1.2rem] group",
                        isActive 
                          ? "text-primary bg-white shadow-md shadow-primary/5" 
                          : "text-muted-foreground hover:text-primary hover:bg-white/50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                      <span className="uppercase tracking-widest">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : !isUserLoading ? (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-black transition-all px-8 py-3 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                <span className="uppercase tracking-widest text-[11px]">{t.nav.signIn}</span>
              </Link>
            ) : (
              <div className="h-10 w-32 bg-secondary/30 animate-pulse rounded-2xl" />
            )}
          </div>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border z-50 md:hidden h-20 px-4 flex items-center justify-around">
        {!isUserLoading && user ? (
          navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all p-2 rounded-xl min-w-[72px]",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-0.5" />
                )}
              </Link>
            );
          })
        ) : !isUserLoading ? (
          <div className="flex items-center gap-4 w-full px-6">
             <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-2 text-primary p-2 font-black uppercase tracking-widest text-xs"
              >
                <LogIn className="h-5 w-5" />
                {t.nav.signIn}
              </Link>
          </div>
        ) : (
          <div className="h-10 w-full bg-secondary/10 animate-pulse rounded-xl" />
        )}
      </nav>
    </>
  );
};