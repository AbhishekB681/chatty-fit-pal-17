
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import OnboardingFlow from '@/components/OnboardingFlow';
import ChatBot from '@/components/ChatBot';
import DashboardPanel from '@/components/DashboardPanel';
import { UserProfile } from '@/types/user';
import { getUserProfile, saveUserProfile } from '@/utils/storage';

const Index = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
    setIsLoading(false);
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
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
            <div className="text-sm text-gray-500">
              {userProfile.goal && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-app-teal bg-opacity-10 text-app-teal">
                  Goal: {userProfile.goal.charAt(0).toUpperCase() + userProfile.goal.slice(1)}
                </span>
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
