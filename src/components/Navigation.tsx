'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, User, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Learn', href: '/learn', icon: BookOpen },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Teacher', href: '/teacher', icon: GraduationCap },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0 px-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <GraduationCap className="h-8 w-8" />
          <span className="hidden sm:inline font-headline">ShikshaSetu</span>
        </Link>
        <div className="flex gap-4 sm:gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 text-sm font-medium transition-colors p-2",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
