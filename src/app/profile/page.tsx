
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Loader2, LogOut, Save, User as UserIcon, Globe, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { SplashScreen } from '@/components/SplashScreen';
import { useTranslation } from '@/hooks/use-translation';
import { useStore } from '@/lib/store';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const { setLanguage: setGlobalLanguage } = useStore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [displayName, setDisplayName] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setIsTeacher(profile.role === 'teacher');
    }
  }, [profile]);

  if (isUserLoading || isProfileLoading) {
    return <SplashScreen message={t.common.loading} />;
  }

  if (!user) return null;

  const handleSave = async () => {
    if (!userDocRef || !db) return;
    setIsSaving(true);
    try {
      const newRole = isTeacher ? 'teacher' : 'student';
      
      // 1. Update primary user document
      await updateDoc(userDocRef, {
        displayName,
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      // 2. Manage the secondary 'teachers' security collection
      const teacherRef = doc(db, 'teachers', user.uid);
      if (isTeacher) {
        // Ensure teacher record exists
        await setDoc(teacherRef, {
          id: user.uid,
          email: user.email,
          assignedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        // Remove teacher record if role downgraded
        await deleteDoc(teacherRef);
      }

      toast({
        title: t.profile.updated,
        description: t.profile.updatedDesc,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen pb-20 md:pt-24 bg-background hero-gradient">
      <Navigation />
      <div className="max-w-3xl mx-auto px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
            <UserIcon className="w-4 h-4" />
            {t.profile.management}
          </div>
          <h1 className="text-6xl font-black font-headline tracking-tighter text-foreground leading-none">
            {t.profile.title} <span className="text-primary">{t.profile.subtitle}</span>
          </h1>
        </header>

        <Card className="pro-card overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-8 bg-primary/5 p-10 border-b">
            <Avatar className="h-28 w-28 border-4 border-white shadow-2xl">
              <AvatarFallback className="bg-primary text-white">
                <UserIcon className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <CardTitle className="text-4xl font-black font-headline tracking-tight text-foreground">
                {profile?.displayName || user.email?.split('@')[0]}
              </CardTitle>
              <CardDescription className="text-lg font-medium text-muted-foreground">{user.email}</CardDescription>
              <div className="pt-2">
                <Badge className={`${profile?.role === 'teacher' ? 'bg-primary' : 'bg-accent'} text-white border-none uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full shadow-lg`}>
                  {profile?.role === 'teacher' ? t.profile.verifiedEducator : t.profile.studentScholar}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-10 p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label htmlFor="displayName" className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground pl-1">{t.profile.displayName}</Label>
                <div className="relative">
                   <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                   <Input 
                    id="displayName" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder={t.profile.placeholderName}
                    className="h-14 pl-12 border-2 rounded-2xl focus-visible:ring-primary font-bold text-lg"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="language" className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground pl-1">{t.profile.language}</Label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary z-10" />
                  <Select value={lang} onValueChange={(val) => setGlobalLanguage(val)}>
                    <SelectTrigger id="language" className="h-14 pl-12 border-2 rounded-2xl focus:ring-primary font-bold text-lg">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                      <SelectItem value="en" className="font-bold py-3">English (US)</SelectItem>
                      <SelectItem value="hi" className="font-bold py-3">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="kn" className="font-bold py-3">ಕನ್ನಡ (Kannada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-muted/50 rounded-[2rem] border-2 border-dashed flex items-center justify-between group transition-all hover:bg-white hover:border-primary">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-lg transition-all ${isTeacher ? 'bg-primary text-white scale-110' : 'bg-secondary text-muted-foreground'}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-widest leading-none">Educator Status</Label>
                  <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed max-w-[200px]">
                    {isTeacher 
                      ? "You have full access to the Teacher Intelligence Dashboard." 
                      : "Upgrade to access class analytics and lesson planners."}
                  </p>
                </div>
              </div>
              <Switch checked={isTeacher} onCheckedChange={setIsTeacher} className="data-[state=checked]:bg-primary" />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between bg-secondary/30 p-10 border-t">
            <Button 
              variant="ghost" 
              className="h-14 px-8 text-destructive font-black uppercase tracking-widest text-[11px] hover:bg-destructive/10 rounded-2xl transition-all" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" /> {t.common.logout}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="h-14 px-12 font-black text-lg rounded-2xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Save className="mr-3 h-5 w-5" />}
              {t.profile.identity}
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
            ShikshaSetu Secure Academic Profile • v1.2.0
          </p>
        </div>
      </div>
    </div>
  );
}
