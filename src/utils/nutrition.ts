
import { UserProfile, MacroNutrients, Food, Meal } from '@/types/user';

// Calculate BMR using the Mifflin-St Jeor Equation
export function calculateBMR(profile: Partial<UserProfile>): number {
  if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
    return 0;
  }
  
  if (profile.gender === 'male') {
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(profile: Partial<UserProfile>): number {
  const bmr = calculateBMR(profile);
  if (!profile.activityLevel) return bmr;
  
  const activityMultipliers = {
    'sedentary': 1.2,
    'lightly active': 1.375,
    'moderately active': 1.55,
    'very active': 1.725,
    'extremely active': 1.9
  };
  
  return Math.round(bmr * activityMultipliers[profile.activityLevel]);
}

// Calculate daily calorie target based on goal
export function calculateDailyCalories(profile: Partial<UserProfile>): number {
  const tdee = calculateTDEE(profile);
  if (!profile.goal) return tdee;
  
  const goalAdjustments = {
    'weight loss': -500, // Caloric deficit
    'maintenance': 0,    // No adjustment
    'muscle gain': 300   // Caloric surplus
  };
  
  return Math.round(tdee + goalAdjustments[profile.goal]);
}

// Calculate macronutrient ratios based on goal
export function calculateMacros(totalCalories: number, goal: string): MacroNutrients {
  let proteinPercentage = 0;
  let fatPercentage = 0;
  let carbPercentage = 0;
  
  switch(goal) {
    case 'weight loss':
      proteinPercentage = 0.40; // 40% protein
      fatPercentage = 0.30;     // 30% fat
      carbPercentage = 0.30;    // 30% carbs
      break;
    case 'maintenance':
      proteinPercentage = 0.30; // 30% protein
      fatPercentage = 0.30;     // 30% fat
      carbPercentage = 0.40;    // 40% carbs
      break;
    case 'muscle gain':
      proteinPercentage = 0.35; // 35% protein
      fatPercentage = 0.25;     // 25% fat
      carbPercentage = 0.40;    // 40% carbs
      break;
    default:
      proteinPercentage = 0.30;
      fatPercentage = 0.30;
      carbPercentage = 0.40;
  }
  
  // Calculate grams per macronutrient
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const proteinCalories = totalCalories * proteinPercentage;
  const fatCalories = totalCalories * fatPercentage;
  const carbCalories = totalCalories * carbPercentage;
  
  return {
    protein: Math.round(proteinCalories / 4),
    fat: Math.round(fatCalories / 9),
    carbs: Math.round(carbCalories / 4)
  };
}

// Helper function to analyze a meal's nutritional content
export function analyzeMeal(foods: Food[]): Meal {
  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
  
  const totalMacros = foods.reduce(
    (sum, food) => ({
      protein: sum.protein + food.macros.protein,
      carbs: sum.carbs + food.macros.carbs,
      fat: sum.fat + food.macros.fat
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
  
  return {
    name: "Custom Meal",
    time: new Date().toISOString(),
    foods,
    totalCalories,
    totalMacros
  };
}

// Common foods database (simplified example)
export const commonFoods: Food[] = [
  {
    name: "Chicken Breast (100g)",
    servingSize: "100g",
    calories: 165,
    macros: { protein: 31, carbs: 0, fat: 3.6 }
  },
  {
    name: "Salmon (100g)",
    servingSize: "100g",
    calories: 208,
    macros: { protein: 20, carbs: 0, fat: 13 }
  },
  {
    name: "Brown Rice (cooked, 100g)",
    servingSize: "100g",
    calories: 112,
    macros: { protein: 2.6, carbs: 23, fat: 0.9 }
  },
  {
    name: "Broccoli (100g)",
    servingSize: "100g",
    calories: 34,
    macros: { protein: 2.8, carbs: 7, fat: 0.4 }
  },
  {
    name: "Egg (1 large)",
    servingSize: "1 large",
    calories: 72,
    macros: { protein: 6.3, carbs: 0.4, fat: 5 }
  },
  {
    name: "Greek Yogurt (100g)",
    servingSize: "100g",
    calories: 59,
    macros: { protein: 10, carbs: 3.6, fat: 0.4 }
  },
  {
    name: "Banana (medium)",
    servingSize: "1 medium",
    calories: 105,
    macros: { protein: 1.3, carbs: 27, fat: 0.4 }
  },
  {
    name: "Almonds (28g)",
    servingSize: "28g",
    calories: 164,
    macros: { protein: 6, carbs: 6, fat: 14 }
  },
  {
    name: "Avocado (half)",
    servingSize: "1/2 fruit",
    calories: 161,
    macros: { protein: 2, carbs: 8.5, fat: 15 }
  },
  {
    name: "Sweet Potato (medium)",
    servingSize: "1 medium",
    calories: 112,
    macros: { protein: 2, carbs: 26, fat: 0.1 }
  }
];

// Generate meal suggestions based on user profile
export function generateMealSuggestion(
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  profile: Partial<UserProfile>
): Meal {
  // This is a simplified example - in a real app, you'd have more sophisticated logic
  // based on user preferences, time of day, previous meals, etc.
  
  let foods: Food[] = [];
  
  switch(mealType) {
    case 'breakfast':
      foods = [
        commonFoods[4], // Egg
        commonFoods[5], // Greek Yogurt
        commonFoods[6]  // Banana
      ];
      break;
    case 'lunch':
      foods = [
        commonFoods[0], // Chicken Breast
        commonFoods[2], // Brown Rice
        commonFoods[3]  // Broccoli
      ];
      break;
    case 'dinner':
      foods = [
        commonFoods[1], // Salmon
        commonFoods[2], // Brown Rice
        commonFoods[8]  // Avocado
      ];
      break;
    case 'snack':
      foods = [
        commonFoods[7], // Almonds
        commonFoods[6]  // Banana
      ];
      break;
  }
  
  const mealAnalysis = analyzeMeal(foods);
  
  return {
    ...mealAnalysis,
    name: mealType.charAt(0).toUpperCase() + mealType.slice(1)
  };
}
