
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import OnboardingFlow from '@/components/OnboardingFlow';
import ChatBot from '@/components/ChatBot';
import DashboardPanel from '@/components/DashboardPanel';
import { UserProfile } from '@/types/user';
import { getUserProfile, getUserProfileAsync, saveUserProfile } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Load user profile and check auth state on mount
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        // On sign in, try to load profile
        if (event === 'SIGNED_IN') {
          loadUserProfile();
          toast.success('Signed in successfully');
        }
        
        // On sign out, load from local storage
        if (event === 'SIGNED_OUT') {
          const profile = getUserProfile();
          setUserProfile(profile);
          toast.info('Signed out');
        }
      }
    );

    // Check current session and load profile
    async function initialize() {
      setIsLoading(true);
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        // Load profile
        await loadUserProfile();
      } finally {
        setIsLoading(false);
      }
    }
    
    initialize();

    // Clean up subscription
    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from Supabase or localStorage
  async function loadUserProfile() {
    try {
      const profile = await getUserProfileAsync();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Error loading profile');
    }
  }

  // Handle onboarding completion
  const handleOnboardingComplete = async (profile: UserProfile) => {
    try {
      await saveUserProfile(profile);
      setUserProfile(profile);
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error saving profile');
    }
  };

  // Handle sign in
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error('Error signing in:', error);
      toast.error('Error signing in');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-app-teal mb-4">ChattyFitPal</h1>
          <div className="w-16 h-16 border-4 border-app-teal border-t-transparent rounded-full mx-auto animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading your fitness companion...</p>
        </div>
      </div>
    );
  }

  // Display onboarding flow if profile doesn't exist or is incomplete
  if (!userProfile || !userProfile.onboardingComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md text-center mb-8">
          <h1 className="text-3xl font-bold text-app-teal mb-2">ChattyFitPal</h1>
          <p className="text-gray-500">Your AI fitness and nutrition companion</p>
        </div>
        
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Main app interface after onboarding
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-app-teal">ChattyFitPal</h1>
            <div className="flex items-center space-x-4">
              {userProfile.goal && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-app-teal bg-opacity-10 text-app-teal">
                  Goal: {userProfile.goal.charAt(0).toUpperCase() + userProfile.goal.slice(1)}
                </span>
              )}
              
              {session ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                    <User size={14} />
                    <span>{session.user.email}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <LogOut size={16} className="mr-1" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignIn}
                  className="text-app-teal border-app-teal hover:bg-app-teal hover:text-white"
                >
                  <LogIn size={16} className="mr-1" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Chat interface - takes up 2/3 on desktop */}
          <div className="lg:col-span-2 h-full">
            <ChatBot userProfile={userProfile} />
          </div>
          
          {/* Dashboard panel - takes up 1/3 on desktop */}
          <div className="h-full">
            <DashboardPanel userProfile={userProfile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
