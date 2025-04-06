
import { UserProfile, NutritionLog, WorkoutLog, Meal, Workout } from '@/types/user';

// Key constants for localStorage
const USER_PROFILE_KEY = 'chatty-fit-pal-user-profile';
const NUTRITION_LOG_KEY = 'chatty-fit-pal-nutrition-log';
const WORKOUT_LOG_KEY = 'chatty-fit-pal-workout-log';

// Save user profile to localStorage
export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

// Get user profile from localStorage
export function getUserProfile(): UserProfile | null {
  const profileString = localStorage.getItem(USER_PROFILE_KEY);
  if (!profileString) return null;
  
  try {
    return JSON.parse(profileString) as UserProfile;
  } catch (error) {
    console.error('Error parsing user profile:', error);
    return null;
  }
}

// Save nutrition log for the current day
export function saveNutritionLog(log: NutritionLog): void {
  const existingLogsString = localStorage.getItem(NUTRITION_LOG_KEY);
  let existingLogs: NutritionLog[] = [];
  
  if (existingLogsString) {
    try {
      existingLogs = JSON.parse(existingLogsString) as NutritionLog[];
    } catch (error) {
      console.error('Error parsing nutrition logs:', error);
    }
  }
  
  // Find if there's already a log for this date
  const existingLogIndex = existingLogs.findIndex(existingLog => existingLog.date === log.date);
  
  if (existingLogIndex >= 0) {
    // Update existing log
    existingLogs[existingLogIndex] = log;
  } else {
    // Add new log
    existingLogs.push(log);
  }
  
  localStorage.setItem(NUTRITION_LOG_KEY, JSON.stringify(existingLogs));
}

// Get nutrition log for a specific date
export function getNutritionLog(date: string): NutritionLog | null {
  const logsString = localStorage.getItem(NUTRITION_LOG_KEY);
  if (!logsString) return null;
  
  try {
    const logs = JSON.parse(logsString) as NutritionLog[];
    return logs.find(log => log.date === date) || null;
  } catch (error) {
    console.error('Error parsing nutrition logs:', error);
    return null;
  }
}

// Add a meal to today's log
export function addMealToLog(meal: Meal): void {
  const today = new Date().toISOString().split('T')[0];
  let todayLog = getNutritionLog(today);
  
  if (!todayLog) {
    todayLog = {
      date: today,
      meals: [],
      totalCalories: 0,
      totalMacros: { protein: 0, carbs: 0, fat: 0 }
    };
  }
  
  // Add the meal
  todayLog.meals.push(meal);
  
  // Recalculate totals
  todayLog.totalCalories = todayLog.meals.reduce(
    (sum, meal) => sum + meal.totalCalories, 0
  );
  
  todayLog.totalMacros = todayLog.meals.reduce(
    (sum, meal) => ({
      protein: sum.protein + meal.totalMacros.protein,
      carbs: sum.carbs + meal.totalMacros.carbs,
      fat: sum.fat + meal.totalMacros.fat
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
  
  saveNutritionLog(todayLog);
}

// Save workout log
export function saveWorkoutLog(log: WorkoutLog): void {
  const existingLogsString = localStorage.getItem(WORKOUT_LOG_KEY);
  let existingLogs: WorkoutLog[] = [];
  
  if (existingLogsString) {
    try {
      existingLogs = JSON.parse(existingLogsString) as WorkoutLog[];
    } catch (error) {
      console.error('Error parsing workout logs:', error);
    }
  }
  
  // Find if there's already a log for this date
  const existingLogIndex = existingLogs.findIndex(existingLog => existingLog.date === log.date);
  
  if (existingLogIndex >= 0) {
    // Update existing log
    existingLogs[existingLogIndex] = log;
  } else {
    // Add new log
    existingLogs.push(log);
  }
  
  localStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(existingLogs));
}

// Get workout log for a specific date
export function getWorkoutLog(date: string): WorkoutLog | null {
  const logsString = localStorage.getItem(WORKOUT_LOG_KEY);
  if (!logsString) return null;
  
  try {
    const logs = JSON.parse(logsString) as WorkoutLog[];
    return logs.find(log => log.date === date) || null;
  } catch (error) {
    console.error('Error parsing workout logs:', error);
    return null;
  }
}

// Add a workout to today's log
export function addWorkoutToLog(workout: Workout): void {
  const today = new Date().toISOString().split('T')[0];
  let todayLog = getWorkoutLog(today);
  
  if (!todayLog) {
    todayLog = {
      date: today,
      workouts: []
    };
  }
  
  // Add the workout
  todayLog.workouts.push(workout);
  saveWorkoutLog(todayLog);
}

// Get workout streak (consecutive days with workouts)
export function getWorkoutStreak(): number {
  const logsString = localStorage.getItem(WORKOUT_LOG_KEY);
  if (!logsString) return 0;
  
  try {
    const logs = JSON.parse(logsString) as WorkoutLog[];
    
    // Sort logs by date (newest first)
    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (logs.length === 0) return 0;
    
    // Check if there's a workout for today
    const today = new Date().toISOString().split('T')[0];
    const hasWorkoutToday = logs[0].date === today;
    
    if (!hasWorkoutToday) return 0;
    
    // Count consecutive days
    let streak = 1;
    const msPerDay = 24 * 60 * 60 * 1000;
    
    for (let i = 1; i < logs.length; i++) {
      const currentDate = new Date(logs[i-1].date);
      const prevDate = new Date(logs[i].date);
      
      const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / msPerDay);
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating workout streak:', error);
    return 0;
  }
}
