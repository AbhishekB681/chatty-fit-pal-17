
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, ActivityLevel, FitnessGoal } from '@/types/user';
import { calculateDailyCalories, calculateMacros } from '@/utils/nutrition';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    onboardingComplete: false
  });

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleComplete = () => {
    // Calculate daily calories and macros
    const dailyCalories = calculateDailyCalories(profile);
    const dailyMacros = calculateMacros(
      dailyCalories, 
      profile.goal || 'maintenance'
    );
    
    const completeProfile: UserProfile = {
      ...profile as UserProfile,
      dailyCalories,
      dailyMacros,
      onboardingComplete: true
    };
    
    onComplete(completeProfile);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg border-t-4 border-t-app-teal">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((num) => (
            <div 
              key={num}
              className={`h-2 rounded-full flex-1 mx-1 ${
                step >= num ? 'bg-app-teal' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h2 className="text-xl font-bold text-center">
          {step === 1 && "Basic Information"}
          {step === 2 && "Activity & Goals"}
          {step === 3 && "Dietary Preferences"}
          {step === 4 && "Almost Done!"}
        </h2>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={profile.name || ''}
              onChange={(e) => updateProfile('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select 
              onValueChange={(value) => updateProfile('gender', value)} 
              value={profile.gender}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="13"
              max="120"
              placeholder="Your age"
              value={profile.age || ''}
              onChange={(e) => updateProfile('age', parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              min="100"
              max="250"
              placeholder="Your height in centimeters"
              value={profile.height || ''}
              onChange={(e) => updateProfile('height', parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="30"
              max="300"
              placeholder="Your weight in kilograms"
              value={profile.weight || ''}
              onChange={(e) => updateProfile('weight', parseInt(e.target.value))}
            />
          </div>
          
          <Button 
            className="w-full mt-4 bg-app-teal hover:bg-app-teal/90" 
            onClick={handleNextStep}
            disabled={!profile.name || !profile.age || !profile.height || !profile.weight || !profile.gender}
          >
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Activity Level</Label>
            <Select 
              onValueChange={(value) => updateProfile('activityLevel', value as ActivityLevel)} 
              value={profile.activityLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                <SelectItem value="lightly active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                <SelectItem value="moderately active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                <SelectItem value="very active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                <SelectItem value="extremely active">Extremely Active (very hard exercise & physical job)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal">Fitness Goal</Label>
            <Select 
              onValueChange={(value) => updateProfile('goal', value as FitnessGoal)} 
              value={profile.goal}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight loss">Weight Loss</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="muscle gain">Muscle Gain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
            >
              Back
            </Button>
            <Button 
              className="bg-app-teal hover:bg-app-teal/90" 
              onClick={handleNextStep}
              disabled={!profile.activityLevel || !profile.goal}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dietaryPreferences">Dietary Preferences (comma separated)</Label>
            <Input
              id="dietaryPreferences"
              placeholder="vegetarian, paleo, keto, etc."
              value={profile.dietaryPreferences?.join(', ') || ''}
              onChange={(e) => updateProfile('dietaryPreferences', 
                e.target.value ? e.target.value.split(',').map(item => item.trim()) : []
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (comma separated)</Label>
            <Input
              id="allergies"
              placeholder="nuts, dairy, gluten, etc."
              value={profile.allergies?.join(', ') || ''}
              onChange={(e) => updateProfile('allergies', 
                e.target.value ? e.target.value.split(',').map(item => item.trim()) : []
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dislikes">Foods You Dislike (comma separated)</Label>
            <Input
              id="dislikes"
              placeholder="broccoli, fish, etc."
              value={profile.dislikes?.join(', ') || ''}
              onChange={(e) => updateProfile('dislikes', 
                e.target.value ? e.target.value.split(',').map(item => item.trim()) : []
              )}
            />
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
            >
              Back
            </Button>
            <Button 
              className="bg-app-teal hover:bg-app-teal/90" 
              onClick={handleNextStep}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">You're all set!</h3>
            <p className="text-muted-foreground">
              Based on your information, we'll create a personalized nutrition and fitness plan to help you reach your goals.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">Your Profile Summary</h4>
            <ul className="space-y-1 text-sm">
              <li>Name: {profile.name}</li>
              <li>Age: {profile.age}</li>
              <li>Weight: {profile.weight} kg</li>
              <li>Height: {profile.height} cm</li>
              <li>Activity Level: {profile.activityLevel}</li>
              <li>Goal: {profile.goal}</li>
            </ul>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
            >
              Back
            </Button>
            <Button 
              className="bg-app-teal hover:bg-app-teal/90" 
              onClick={handleComplete}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default OnboardingFlow;
