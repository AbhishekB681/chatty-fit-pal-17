
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalorieProgress from './CalorieProgress';
import MacroProgress from './MacroProgress';
import { UserProfile, NutritionLog, WorkoutLog } from '@/types/user';
import { getNutritionLog, getWorkoutLog, getWorkoutStreak } from '@/utils/storage';

interface DashboardPanelProps {
  userProfile: UserProfile;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ userProfile }) => {
  // Get today's logs
  const today = new Date().toISOString().split('T')[0];
  const nutritionLog = getNutritionLog(today);
  const workoutLog = getWorkoutLog(today);
  const streak = getWorkoutStreak();
  
  // Default values if no log exists
  const currentCalories = nutritionLog ? nutritionLog.totalCalories : 0;
  const currentMacros = nutritionLog ? nutritionLog.totalMacros : { protein: 0, carbs: 0, fat: 0 };
  const todaysWorkouts = workoutLog ? workoutLog.workouts : [];
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Daily Progress</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="nutrition" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nutrition" className="space-y-4">
            <CalorieProgress 
              current={currentCalories} 
              target={userProfile.dailyCalories || 2000} 
            />
            
            <MacroProgress 
              current={currentMacros} 
              target={userProfile.dailyMacros || { protein: 100, carbs: 200, fat: 70 }} 
            />
          </TabsContent>
          
          <TabsContent value="fitness">
            <div className="space-y-4">
              <div className="grid place-items-center py-4">
                <div className="relative">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={streak > 0 ? "#2DD4BF" : "#e5e7eb"}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - Math.min(1, streak / 7))}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{streak}</span>
                    <span className="text-sm">day streak</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Today's Workouts</h3>
                
                {todaysWorkouts.length > 0 ? (
                  <div className="space-y-2">
                    {todaysWorkouts.map((workout, index) => (
                      <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{workout.type}</span>
                          <span className="text-sm text-app-teal">{workout.duration} min</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {workout.intensity} intensity • {workout.caloriesBurned} calories
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No workouts logged today</p>
                    <p className="text-sm mt-1">Ask me to log a workout!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardPanel;
