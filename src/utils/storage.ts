import { UserProfile, NutritionLog, WorkoutLog, Meal, Workout } from '@/types/user';
import { supabase, isAuthenticated, getCurrentUserId } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Key constants for localStorage (fallback)
const USER_PROFILE_KEY = 'chatty-fit-pal-user-profile';
const NUTRITION_LOG_KEY = 'chatty-fit-pal-nutrition-log';
const WORKOUT_LOG_KEY = 'chatty-fit-pal-workout-log';

// Debug function for logging Supabase operations
function logOperation(operation: string, success: boolean, details?: any) {
  if (success) {
    console.log(`✅ Supabase ${operation} successful:`, details);
  } else {
    console.error(`❌ Supabase ${operation} failed:`, details);
  }
}

// Save user profile to Supabase and localStorage
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  // Save to localStorage as fallback
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  
  try {
    const session = await supabase.auth.getSession();
    const isLoggedIn = !!session.data.session?.user;
    
    console.log("Auth status when saving profile:", isLoggedIn ? "Logged in" : "Not logged in");
    
    if (session.data.session?.user) {
      const userId = session.data.session.user.id;
      
      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking if profile exists:', fetchError);
        toast.error('Error saving profile: ' + fetchError.message);
        logOperation('check profile exists', false, fetchError);
        return;
      }
      
      let result;
      
      if (existingProfile) {
        console.log("Updating existing profile for user:", userId);
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update({
            name: profile.name,
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            activity_level: profile.activityLevel,
            goal: profile.goal,
            gender: profile.gender,
            dietary_preferences: profile.dietaryPreferences,
            allergies: profile.allergies,
            dislikes: profile.dislikes,
            daily_calories: profile.dailyCalories,
            daily_protein: profile.dailyMacros?.protein,
            daily_carbs: profile.dailyMacros?.carbs,
            daily_fat: profile.dailyMacros?.fat,
            onboarding_complete: profile.onboardingComplete
          })
          .eq('id', userId);
      } else {
        console.log("Creating new profile for user:", userId);
        // Insert new profile
        result = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            name: profile.name,
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            activity_level: profile.activityLevel,
            goal: profile.goal,
            gender: profile.gender,
            dietary_preferences: profile.dietaryPreferences,
            allergies: profile.allergies,
            dislikes: profile.dislikes,
            daily_calories: profile.dailyCalories,
            daily_protein: profile.dailyMacros?.protein,
            daily_carbs: profile.dailyMacros?.carbs,
            daily_fat: profile.dailyMacros?.fat,
            onboarding_complete: profile.onboardingComplete
          });
      }
      
      if (result.error) {
        console.error('Error saving profile to Supabase:', result.error);
        toast.error('Failed to save profile: ' + result.error.message);
        logOperation('save profile', false, result.error);
      } else {
        console.log("Profile saved successfully to Supabase");
        toast.success('Profile saved to Supabase');
        logOperation('save profile', true);
      }
    } else {
      console.log("No active session, profile only saved to localStorage");
      toast.info('Profile saved locally, sign in to sync');
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    toast.error('Failed to save profile');
    logOperation('save profile', false, error);
  }
}

// Get user profile from Supabase or localStorage
export async function getUserProfileAsync(): Promise<UserProfile | null> {
  try {
    const session = await supabase.auth.getSession();
    
    if (session.data.session?.user) {
      const userId = session.data.session.user.id;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile from Supabase:', error);
        logOperation('fetch profile', false, error);
        // Fall back to localStorage
        return getUserProfile();
      }
      
      if (data) {
        // Convert Supabase format to app format
        const profile: UserProfile = {
          name: data.name,
          age: data.age,
          weight: data.weight,
          height: data.height,
          activityLevel: data.activity_level as any,
          goal: data.goal as any,
          gender: data.gender as any,
          dietaryPreferences: data.dietary_preferences,
          allergies: data.allergies,
          dislikes: data.dislikes,
          dailyCalories: data.daily_calories,
          dailyMacros: {
            protein: data.daily_protein,
            carbs: data.daily_carbs,
            fat: data.daily_fat
          },
          onboardingComplete: data.onboarding_complete
        };
        
        // Update localStorage for offline access
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
        logOperation('fetch profile', true);
        
        return profile;
      }
    }
    
    // Fall back to localStorage if not logged in or no data
    return getUserProfile();
  } catch (error) {
    console.error('Error getting user profile:', error);
    logOperation('fetch profile', false, error);
    // Fall back to localStorage
    return getUserProfile();
  }
}

// Synchronous version for immediate access (from localStorage)
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

// Save nutrition log to Supabase and localStorage
export async function saveNutritionLog(log: NutritionLog): Promise<void> {
  // Update localStorage
  const existingLogsString = localStorage.getItem(NUTRITION_LOG_KEY);
  let existingLogs: NutritionLog[] = [];
  
  if (existingLogsString) {
    try {
      existingLogs = JSON.parse(existingLogsString) as NutritionLog[];
    } catch (error) {
      console.error('Error parsing nutrition logs:', error);
    }
  }
  
  const existingLogIndex = existingLogs.findIndex(existingLog => existingLog.date === log.date);
  
  if (existingLogIndex >= 0) {
    existingLogs[existingLogIndex] = log;
  } else {
    existingLogs.push(log);
  }
  
  localStorage.setItem(NUTRITION_LOG_KEY, JSON.stringify(existingLogs));
  
  // Save to Supabase if logged in
  try {
    const isLoggedIn = await isAuthenticated();
    if (!isLoggedIn) {
      console.log("Not authenticated, nutrition log only saved to localStorage");
      return;
    }
    
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error("No user ID available");
      return;
    }
    
    console.log("Saving nutrition log for user:", userId, "date:", log.date);
    
    // First check if log exists for this date
    const { data: existingLog, error: fetchError } = await supabase
      .from('nutrition_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('date', log.date)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking if nutrition log exists:', fetchError);
      logOperation('check nutrition log exists', false, fetchError);
      return;
    }
    
    let logId;
    
    if (existingLog) {
      // Update existing log
      const { error: updateError } = await supabase
        .from('nutrition_logs')
        .update({
          total_calories: log.totalCalories,
          total_protein: log.totalMacros.protein,
          total_carbs: log.totalMacros.carbs,
          total_fat: log.totalMacros.fat
        })
        .eq('id', existingLog.id);
      
      if (updateError) {
        console.error('Error updating nutrition log:', updateError);
        logOperation('update nutrition log', false, updateError);
        return;
      }
      
      logId = existingLog.id;
      logOperation('update nutrition log', true);
    } else {
      // Insert new log
      const { data: newLog, error: insertError } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: userId,
          date: log.date,
          total_calories: log.totalCalories,
          total_protein: log.totalMacros.protein,
          total_carbs: log.totalMacros.carbs,
          total_fat: log.totalMacros.fat
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Error creating nutrition log:', insertError);
        logOperation('create nutrition log', false, insertError);
        return;
      }
      
      if (newLog) {
        logId = newLog.id;
        logOperation('create nutrition log', true);
      } else {
        console.error('No log ID returned after insert');
        return;
      }
    }
    
    // Now handle meals
    // First get existing meals for this log
    const { data: existingMeals, error: mealsError } = await supabase
      .from('meals')
      .select('id, name')
      .eq('nutrition_log_id', logId);
    
    if (mealsError) {
      console.error('Error fetching existing meals:', mealsError);
      logOperation('fetch meals', false, mealsError);
      return;
    }
    
    // Create map of existing meal IDs by name for quick lookup
    const existingMealMap = new Map();
    existingMeals?.forEach(meal => {
      existingMealMap.set(meal.name, meal.id);
    });
    
    // Process each meal
    for (const meal of log.meals) {
      let mealId = existingMealMap.get(meal.name);
      
      if (mealId) {
        // Update existing meal
        const { error: updateMealError } = await supabase
          .from('meals')
          .update({
            time: meal.time,
            total_calories: meal.totalCalories,
            total_protein: meal.totalMacros.protein,
            total_carbs: meal.totalMacros.carbs,
            total_fat: meal.totalMacros.fat
          })
          .eq('id', mealId);
          
        if (updateMealError) {
          console.error('Error updating meal:', updateMealError);
          logOperation('update meal', false, updateMealError);
          continue;
        }
        logOperation('update meal', true);
      } else {
        // Insert new meal
        const { data: newMeal, error: insertMealError } = await supabase
          .from('meals')
          .insert({
            nutrition_log_id: logId,
            name: meal.name,
            time: meal.time,
            total_calories: meal.totalCalories,
            total_protein: meal.totalMacros.protein,
            total_carbs: meal.totalMacros.carbs,
            total_fat: meal.totalMacros.fat
          })
          .select('id')
          .single();
        
        if (insertMealError) {
          console.error('Error creating meal:', insertMealError);
          logOperation('create meal', false, insertMealError);
          continue;
        }
        
        if (newMeal) {
          mealId = newMeal.id;
          logOperation('create meal', true);
        } else {
          console.error('No meal ID returned after insert');
          continue;
        }
      }
      
      // Now handle foods for this meal
      // Delete existing foods for this meal (simpler than updating)
      const { error: deleteError } = await supabase
        .from('foods')
        .delete()
        .eq('meal_id', mealId);
        
      if (deleteError) {
        console.error('Error deleting existing foods:', deleteError);
        logOperation('delete foods', false, deleteError);
      }
      
      // Insert all foods
      for (const food of meal.foods) {
        const { error: insertFoodError } = await supabase
          .from('foods')
          .insert({
            meal_id: mealId,
            name: food.name,
            serving_size: food.servingSize,
            calories: food.calories,
            protein: food.macros.protein,
            carbs: food.macros.carbs,
            fat: food.macros.fat
          });
          
        if (insertFoodError) {
          console.error('Error creating food:', insertFoodError);
          logOperation('create food', false, insertFoodError);
        } else {
          logOperation('create food', true);
        }
      }
    }
    
    console.log("Nutrition log saved successfully to Supabase");
  } catch (error) {
    console.error('Error saving nutrition log to Supabase:', error);
    logOperation('save nutrition log', false, error);
  }
}

// Get nutrition log for a specific date
export async function getNutritionLogAsync(date: string): Promise<NutritionLog | null> {
  try {
    const session = await supabase.auth.getSession();
    
    if (session.data.session?.user) {
      const userId = session.data.session.user.id;
      
      // Get the nutrition log
      const { data: logData, error: logError } = await supabase
        .from('nutrition_logs')
        .select('id, total_calories, total_protein, total_carbs, total_fat')
        .eq('user_id', userId)
        .eq('date', date)
        .single();
      
      if (logError && logError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching nutrition log:', logError);
        return getNutritionLog(date); // Fall back to localStorage
      }
      
      if (!logData) {
        return getNutritionLog(date); // Fall back to localStorage
      }
      
      // Get meals for this log
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('id, name, time, total_calories, total_protein, total_carbs, total_fat')
        .eq('nutrition_log_id', logData.id);
      
      if (mealsError) {
        console.error('Error fetching meals:', mealsError);
        return getNutritionLog(date); // Fall back to localStorage
      }
      
      const meals: Meal[] = [];
      
      // Get foods for each meal
      for (const mealData of mealsData || []) {
        const { data: foodsData, error: foodsError } = await supabase
          .from('foods')
          .select('name, serving_size, calories, protein, carbs, fat')
          .eq('meal_id', mealData.id);
        
        if (foodsError) {
          console.error('Error fetching foods:', foodsError);
          continue;
        }
        
        const foods = (foodsData || []).map(food => ({
          name: food.name,
          servingSize: food.serving_size,
          calories: food.calories,
          macros: {
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat
          }
        }));
        
        meals.push({
          name: mealData.name,
          time: mealData.time,
          foods,
          totalCalories: mealData.total_calories,
          totalMacros: {
            protein: mealData.total_protein,
            carbs: mealData.total_carbs,
            fat: mealData.total_fat
          }
        });
      }
      
      const nutritionLog: NutritionLog = {
        date,
        meals,
        totalCalories: logData.total_calories,
        totalMacros: {
          protein: logData.total_protein,
          carbs: logData.total_carbs,
          fat: logData.total_fat
        }
      };
      
      return nutritionLog;
    }
    
    // Fall back to localStorage if not logged in
    return getNutritionLog(date);
  } catch (error) {
    console.error('Error getting nutrition log:', error);
    return getNutritionLog(date); // Fall back to localStorage
  }
}

// Synchronous version for immediate access (from localStorage)
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
export async function addMealToLog(meal: Meal): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const todayLog = await getNutritionLogAsync(today) || {
    date: today,
    meals: [],
    totalCalories: 0,
    totalMacros: { protein: 0, carbs: 0, fat: 0 }
  };
  
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
  
  await saveNutritionLog(todayLog);
}

// Save workout log
export async function saveWorkoutLog(log: WorkoutLog): Promise<void> {
  // Update localStorage
  const existingLogsString = localStorage.getItem(WORKOUT_LOG_KEY);
  let existingLogs: WorkoutLog[] = [];
  
  if (existingLogsString) {
    try {
      existingLogs = JSON.parse(existingLogsString) as WorkoutLog[];
    } catch (error) {
      console.error('Error parsing workout logs:', error);
    }
  }
  
  const existingLogIndex = existingLogs.findIndex(existingLog => existingLog.date === log.date);
  
  if (existingLogIndex >= 0) {
    existingLogs[existingLogIndex] = log;
  } else {
    existingLogs.push(log);
  }
  
  localStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(existingLogs));
  
  // Save to Supabase if logged in
  try {
    const session = await supabase.auth.getSession();
    if (session.data.session?.user) {
      const userId = session.data.session.user.id;
      
      // First check if log exists for this date
      const { data: existingLog } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('date', log.date)
        .single();
      
      let logId;
      
      if (existingLog) {
        // Use existing log ID
        logId = existingLog.id;
      } else {
        // Insert new log
        const { data: newLog, error } = await supabase
          .from('workout_logs')
          .insert({
            user_id: userId,
            date: log.date
          })
          .select('id')
          .single();
        
        if (error) {
          console.error('Error creating workout log:', error);
          return;
        }
        
        if (newLog) {
          logId = newLog.id;
        } else {
          console.error('No log ID returned after insert');
          return;
        }
      }
      
      // Delete existing workouts for this log
      await supabase
        .from('workouts')
        .delete()
        .eq('workout_log_id', logId);
      
      // Insert all workouts
      for (const workout of log.workouts) {
        await supabase
          .from('workouts')
          .insert({
            workout_log_id: logId,
            type: workout.type,
            duration: workout.duration,
            intensity: workout.intensity,
            calories_burned: workout.caloriesBurned,
            notes: workout.notes
          });
      }
    }
  } catch (error) {
    console.error('Error saving workout log to Supabase:', error);
  }
}

// Get workout log for a specific date
export async function getWorkoutLogAsync(date: string): Promise<WorkoutLog | null> {
  try {
    const session = await supabase.auth.getSession();
    
    if (session.data.session?.user) {
      const userId = session.data.session.user.id;
      
      // Get the workout log
      const { data: logData, error: logError } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .single();
      
      if (logError && logError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching workout log:', logError);
        return getWorkoutLog(date); // Fall back to localStorage
      }
      
      if (!logData) {
        return getWorkoutLog(date); // Fall back to localStorage
      }
      
      // Get workouts for this log
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('type, duration, intensity, calories_burned, notes')
        .eq('workout_log_id', logData.id);
      
      if (workoutsError) {
        console.error('Error fetching workouts:', workoutsError);
        return getWorkoutLog(date); // Fall back to localStorage
      }
      
      const workouts = (workoutsData || []).map(workout => ({
        type: workout.type,
        duration: workout.duration,
        intensity: workout.intensity as any,
        caloriesBurned: workout.calories_burned,
        notes: workout.notes
      }));
      
      return {
        date,
        workouts
      };
    }
    
    // Fall back to localStorage if not logged in
    return getWorkoutLog(date);
  } catch (error) {
    console.error('Error getting workout log:', error);
    return getWorkoutLog(date); // Fall back to localStorage
  }
}

// Synchronous version for immediate access (from localStorage)
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
export async function addWorkoutToLog(workout: Workout): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const todayLog = await getWorkoutLogAsync(today) || {
    date: today,
    workouts: []
  };
  
  // Add the workout
  todayLog.workouts.push(workout);
  await saveWorkoutLog(todayLog);
}

// Get workout streak (consecutive days with workouts)
export async function getWorkoutStreakAsync(): Promise<number> {
  try {
    const session = await supabase.auth.getSession();
    
    if (session.data.session?.user) {
      const userId = session.data.session.user.id;
      
      // Get all workout logs for this user, ordered by date
      const { data: logs, error } = await supabase
        .from('workout_logs')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching workout logs:', error);
        return getWorkoutStreak(); // Fall back to localStorage
      }
      
      if (!logs || logs.length === 0) {
        return 0;
      }
      
      // Check if there's a workout for today
      const today = new Date().toISOString().split('T')[0];
      const hasWorkoutToday = logs[0].date === today;
      
      if (!hasWorkoutToday) {
        return 0;
      }
      
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
    }
    
    // Fall back to localStorage if not logged in
    return getWorkoutStreak();
  } catch (error) {
    console.error('Error calculating workout streak:', error);
    return getWorkoutStreak(); // Fall back to localStorage
  }
}

// Synchronous version for immediate access (from localStorage)
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
