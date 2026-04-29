
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, LogOut, Save, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [displayName, setDisplayName] = useState('');
  const [language, setLanguage] = useState('en');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setLanguage(profile.languagePreference || 'en');
    }
  }, [profile]);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSave = async () => {
    if (!userDocRef) return;
    setIsSaving(true);
    try {
      await updateDoc(userDocRef, {
        displayName,
        languagePreference: language,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
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
    router.push('/');
  };

  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </header>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} />
              <AvatarFallback><UserIcon /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">{profile?.displayName || user.email}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary uppercase">
                  {profile?.role || 'Student'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 mt-6">
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
