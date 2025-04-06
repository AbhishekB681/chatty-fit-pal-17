
import { Workout, UserProfile } from '@/types/user';

interface ExerciseInfo {
  name: string;
  caloriesPerMinute: {
    low: number;
    moderate: number;
    high: number;
  };
  benefits: string[];
}

// Database of common exercises with estimated calorie burn
export const exercises: Record<string, ExerciseInfo> = {
  walking: {
    name: 'Walking',
    caloriesPerMinute: {
      low: 3,
      moderate: 4,
      high: 5
    },
    benefits: ['Improves cardiovascular health', 'Low impact', 'Burns fat', 'Reduces stress']
  },
  running: {
    name: 'Running',
    caloriesPerMinute: {
      low: 8,
      moderate: 10,
      high: 12
    },
    benefits: ['Builds endurance', 'Burns calories efficiently', 'Strengthens legs', 'Improves cardiovascular health']
  },
  cycling: {
    name: 'Cycling',
    caloriesPerMinute: {
      low: 5,
      moderate: 7,
      high: 10
    },
    benefits: ['Low impact', 'Builds leg strength', 'Improves cardiovascular health', 'Can be done indoors or outdoors']
  },
  swimming: {
    name: 'Swimming',
    caloriesPerMinute: {
      low: 6,
      moderate: 8,
      high: 10
    },
    benefits: ['Full body workout', 'No impact on joints', 'Builds endurance', 'Improves flexibility']
  },
  yoga: {
    name: 'Yoga',
    caloriesPerMinute: {
      low: 3,
      moderate: 4,
      high: 6
    },
    benefits: ['Improves flexibility', 'Reduces stress', 'Builds strength', 'Enhances mind-body connection']
  },
  weightTraining: {
    name: 'Weight Training',
    caloriesPerMinute: {
      low: 4,
      moderate: 6,
      high: 8
    },
    benefits: ['Builds muscle', 'Increases metabolism', 'Improves bone density', 'Enhances functional strength']
  },
  hiit: {
    name: 'HIIT',
    caloriesPerMinute: {
      low: 8,
      moderate: 12,
      high: 15
    },
    benefits: ['Efficient calorie burn', 'Improves metabolic rate', 'Quick workout option', 'Burns fat']
  },
  pilates: {
    name: 'Pilates',
    caloriesPerMinute: {
      low: 3,
      moderate: 5,
      high: 7
    },
    benefits: ['Improves core strength', 'Enhances posture', 'Increases flexibility', 'Low impact']
  }
};

// Calculate calories burned for a workout
export function calculateCaloriesBurned(workout: Workout, profile: Partial<UserProfile>): number {
  const exercise = Object.values(exercises).find(ex => 
    ex.name.toLowerCase() === workout.type.toLowerCase()
  );
  
  if (!exercise) {
    // If we don't have specific data for this exercise, use a generic calculation
    const intensityMultiplier = workout.intensity === 'low' ? 5 : 
                                workout.intensity === 'moderate' ? 7.5 : 10;
    return Math.round(workout.duration * intensityMultiplier);
  }
  
  const intensity = workout.intensity || 'moderate';
  const caloriesPerMinute = exercise.caloriesPerMinute[intensity];
  
  // Adjust for weight if available
  let weightMultiplier = 1;
  if (profile.weight) {
    // Base calculation is for a 70kg person
    weightMultiplier = profile.weight / 70;
  }
  
  return Math.round(workout.duration * caloriesPerMinute * weightMultiplier);
}

// Generate workout suggestions based on available time and intensity
export function suggestWorkout(
  availableMinutes: number, 
  intensity: 'low' | 'moderate' | 'high',
  goal: string
): Workout {
  let recommendedExercises: string[] = [];
  
  switch(goal) {
    case 'weight loss':
      recommendedExercises = ['hiit', 'running', 'swimming'];
      break;
    case 'muscle gain':
      recommendedExercises = ['weightTraining', 'hiit', 'pilates'];
      break;
    case 'maintenance':
      recommendedExercises = ['walking', 'cycling', 'yoga', 'swimming'];
      break;
    default:
      recommendedExercises = Object.keys(exercises);
  }
  
  // For short workouts, suggest more intense options
  if (availableMinutes < 20) {
    recommendedExercises = recommendedExercises.filter(ex => 
      ex === 'hiit' || ex === 'weightTraining'
    );
    if (recommendedExercises.length === 0) {
      recommendedExercises = ['hiit', 'weightTraining'];
    }
  }
  
  // For longer workouts with low intensity, suggest steady state cardio
  if (availableMinutes > 40 && intensity === 'low') {
    recommendedExercises = recommendedExercises.filter(ex => 
      ex === 'walking' || ex === 'cycling' || ex === 'swimming'
    );
    if (recommendedExercises.length === 0) {
      recommendedExercises = ['walking', 'cycling', 'swimming'];
    }
  }
  
  // Pick a random exercise from the recommended list
  const randomExercise = recommendedExercises[Math.floor(Math.random() * recommendedExercises.length)];
  const exerciseInfo = exercises[randomExercise];
  
  return {
    type: exerciseInfo.name,
    duration: availableMinutes,
    intensity: intensity,
    notes: exerciseInfo.benefits.join('. ')
  };
}
