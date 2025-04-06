
export interface UserProfile {
  // Basic information
  name?: string;
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  activityLevel?: ActivityLevel;
  goal?: FitnessGoal;
  gender?: 'male' | 'female' | 'other';
  
  // Dietary preferences
  dietaryPreferences?: string[];
  allergies?: string[];
  dislikes?: string[];
  
  // Calculated values
  dailyCalories?: number;
  dailyMacros?: MacroNutrients;
  
  // Onboarding status
  onboardingComplete: boolean;
}

export interface MacroNutrients {
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export type ActivityLevel = 
  | 'sedentary' 
  | 'lightly active' 
  | 'moderately active'
  | 'very active' 
  | 'extremely active';

export type FitnessGoal = 
  | 'weight loss' 
  | 'maintenance' 
  | 'muscle gain';

export interface NutritionLog {
  date: string; // ISO date string
  meals: Meal[];
  totalCalories: number;
  totalMacros: MacroNutrients;
}

export interface Meal {
  name: string;
  time: string;
  foods: Food[];
  totalCalories: number;
  totalMacros: MacroNutrients;
}

export interface Food {
  name: string;
  servingSize: string;
  calories: number;
  macros: MacroNutrients;
}

export interface WorkoutLog {
  date: string; // ISO date string
  workouts: Workout[];
}

export interface Workout {
  type: string;
  duration: number; // in minutes
  intensity?: 'low' | 'moderate' | 'high';
  caloriesBurned?: number;
  notes?: string;
}
