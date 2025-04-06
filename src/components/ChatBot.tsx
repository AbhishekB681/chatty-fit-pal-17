
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { UserProfile, Meal, Food, Workout, MacroNutrients } from '@/types/user';
import { 
  generateMealSuggestion, 
  analyzeMeal, 
  commonFoods 
} from '@/utils/nutrition';
import { 
  suggestWorkout, 
  calculateCaloriesBurned,
  exercises 
} from '@/utils/fitness';
import { 
  addMealToLog, 
  addWorkoutToLog, 
  getNutritionLog,
  getWorkoutLog,
  getWorkoutStreak
} from '@/utils/storage';

interface ChatBotProps {
  userProfile: UserProfile;
}

interface ChatMessageItem {
  message: string;
  isUser: boolean;
  timestamp: string;
}

// Helper function to format time
const formatTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatBot: React.FC<ChatBotProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      message: `Hi ${userProfile.name || 'there'}! I'm your personal fitness and nutrition assistant. What can I help you with today?`,
      isUser: false,
      timestamp: formatTime()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const addMessage = (message: string, isUser: boolean) => {
    setMessages(prev => [
      ...prev, 
      { message, isUser, timestamp: formatTime() }
    ]);
  };
  
  const handleSendMessage = (message: string) => {
    addMessage(message, true);
    setIsProcessing(true);
    
    // Process the message after a short delay to simulate thinking
    setTimeout(() => {
      processUserMessage(message);
      setIsProcessing(false);
    }, 1000);
  };
  
  const processUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for greeting
    if (
      lowerMessage.includes('hello') || 
      lowerMessage.includes('hi') || 
      lowerMessage.includes('hey')
    ) {
      addMessage(`Hello! How can I help you today with your fitness and nutrition goals?`, false);
      return;
    }
    
    // Check for nutrition questions
    if (
      lowerMessage.includes('calorie') || 
      lowerMessage.includes('calories') ||
      lowerMessage.includes('macro') || 
      lowerMessage.includes('macros')
    ) {
      handleNutritionQuestion(lowerMessage);
      return;
    }
    
    // Check for workout logging
    if (
      lowerMessage.includes('i did') || 
      lowerMessage.includes('i completed') || 
      lowerMessage.includes('i finished') ||
      lowerMessage.includes('i went') ||
      lowerMessage.includes('i ran') ||
      lowerMessage.includes('i walked')
    ) {
      handleWorkoutLogging(lowerMessage);
      return;
    }
    
    // Check for meal suggestions
    if (
      lowerMessage.includes('suggest') && 
      (
        lowerMessage.includes('meal') || 
        lowerMessage.includes('breakfast') || 
        lowerMessage.includes('lunch') || 
        lowerMessage.includes('dinner') || 
        lowerMessage.includes('snack') || 
        lowerMessage.includes('eat')
      )
    ) {
      handleMealSuggestion(lowerMessage);
      return;
    }
    
    // Check for workout suggestions
    if (
      lowerMessage.includes('suggest') && 
      (
        lowerMessage.includes('workout') || 
        lowerMessage.includes('exercise') ||
        lowerMessage.includes('training')
      )
    ) {
      handleWorkoutSuggestion(lowerMessage);
      return;
    }
    
    // Check for food logging
    if (
      lowerMessage.includes('ate') ||
      lowerMessage.includes('had') ||
      lowerMessage.includes('consumed') ||
      lowerMessage.includes('log') && lowerMessage.includes('food')
    ) {
      handleFoodLogging(lowerMessage);
      return;
    }
    
    // Default response
    addMessage(`I'm here to help with your fitness and nutrition goals. You can ask me to:
- Suggest meals or workouts
- Log your food and exercise
- Track your progress
- Answer questions about nutrition

What would you like to do?`, false);
  };
  
  const handleNutritionQuestion = (message: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nutritionLog = getNutritionLog(today);
    
    if (message.includes('how many') || message.includes('how much')) {
      if (!nutritionLog) {
        addMessage(`You haven't logged any food today yet. Your daily targets are:
- Calories: ${userProfile.dailyCalories} calories
- Protein: ${userProfile.dailyMacros.protein}g
- Carbs: ${userProfile.dailyMacros.carbs}g
- Fat: ${userProfile.dailyMacros.fat}g`, false);
        return;
      }
      
      if (message.includes('calorie') || message.includes('calories')) {
        const remainingCalories = userProfile.dailyCalories - nutritionLog.totalCalories;
        
        addMessage(`So far today you've consumed ${nutritionLog.totalCalories} calories out of your ${userProfile.dailyCalories} calorie goal. ${
          remainingCalories > 0 
            ? `You have ${remainingCalories} calories remaining.` 
            : `You've reached your calorie goal for today.`
        }`, false);
        return;
      }
      
      if (message.includes('protein')) {
        addMessage(`So far today you've consumed ${nutritionLog.totalMacros.protein}g of protein out of your ${userProfile.dailyMacros.protein}g goal.`, false);
        return;
      }
      
      if (message.includes('carb')) {
        addMessage(`So far today you've consumed ${nutritionLog.totalMacros.carbs}g of carbs out of your ${userProfile.dailyMacros.carbs}g goal.`, false);
        return;
      }
      
      if (message.includes('fat')) {
        addMessage(`So far today you've consumed ${nutritionLog.totalMacros.fat}g of fat out of your ${userProfile.dailyMacros.fat}g goal.`, false);
        return;
      }
    }
    
    // General macro nutrition information
    addMessage(`Based on your profile, your daily targets are:
- Calories: ${userProfile.dailyCalories} calories
- Protein: ${userProfile.dailyMacros.protein}g
- Carbs: ${userProfile.dailyMacros.carbs}g
- Fat: ${userProfile.dailyMacros.fat}g

These targets are calculated based on your age, weight, height, activity level, and fitness goal.`, false);
  };
  
  const handleMealSuggestion = (message: string) => {
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack';
    
    if (message.includes('breakfast')) {
      mealType = 'breakfast';
    } else if (message.includes('lunch')) {
      mealType = 'lunch';
    } else if (message.includes('dinner')) {
      mealType = 'dinner';
    }
    
    const meal = generateMealSuggestion(mealType, userProfile);
    
    // Check for calories constraint
    if (message.includes('under') || message.includes('less than')) {
      const calorieMatch = message.match(/(\d+)\s*calories/);
      if (calorieMatch && parseInt(calorieMatch[1]) < meal.totalCalories) {
        addMessage(`I don't have a ${mealType} suggestion under ${calorieMatch[1]} calories at the moment. Let me know if you'd like other options!`, false);
        return;
      }
    }
    
    // Format the response
    let response = `Here's a suggested ${mealType} (${meal.totalCalories} calories):\n\n`;
    
    meal.foods.forEach(food => {
      response += `• ${food.name}: ${food.calories} calories (P: ${food.macros.protein}g, C: ${food.macros.carbs}g, F: ${food.macros.fat}g)\n`;
    });
    
    response += `\nTotal macros: Protein: ${meal.totalMacros.protein}g, Carbs: ${meal.totalMacros.carbs}g, Fat: ${meal.totalMacros.fat}g`;
    
    addMessage(response, false);
  };
  
  const handleWorkoutSuggestion = (message: string) => {
    // Default values
    let duration = 30; // 30 minutes
    let intensity: 'low' | 'moderate' | 'high' = 'moderate';
    
    // Parse duration from message
    const durationMatch = message.match(/(\d+)\s*(min|minute|minutes)/);
    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
    }
    
    // Parse intensity from message
    if (
      message.includes('easy') || 
      message.includes('light') || 
      message.includes('low')
    ) {
      intensity = 'low';
    } else if (
      message.includes('hard') || 
      message.includes('intense') || 
      message.includes('high')
    ) {
      intensity = 'high';
    }
    
    // Generate workout suggestion
    const workout = suggestWorkout(duration, intensity, userProfile.goal || 'maintenance');
    
    // Calculate calories
    const caloriesBurned = calculateCaloriesBurned(workout, userProfile);
    
    // Format response
    let response = `Here's a ${workout.intensity} intensity ${workout.type} workout for ${workout.duration} minutes:\n\n`;
    response += `This will burn approximately ${caloriesBurned} calories based on your profile.\n\n`;
    response += `Benefits: ${workout.notes}`;
    
    addMessage(response, false);
  };
  
  const handleWorkoutLogging = (message: string) => {
    // Extract exercise type
    let exerciseType = '';
    for (const type in exercises) {
      if (message.toLowerCase().includes(exercises[type].name.toLowerCase())) {
        exerciseType = exercises[type].name;
        break;
      }
    }
    
    if (!exerciseType) {
      // Try to determine exercise type from common workout names
      const workoutTypes = [
        'ran', 'jogged', 'run', 'jog', 'running', 'jogging',
        'walked', 'walking', 'walk',
        'biked', 'cycling', 'bike', 'biking', 'cycle',
        'swam', 'swimming', 'swim',
        'yoga', 'pilates',
        'weight training', 'weights', 'lifted', 'lifting', 'strength training',
        'hiit', 'high intensity', 'interval training'
      ];
      
      for (const type of workoutTypes) {
        if (message.toLowerCase().includes(type)) {
          if (type.includes('run') || type.includes('jog')) exerciseType = 'Running';
          else if (type.includes('walk')) exerciseType = 'Walking';
          else if (type.includes('bik') || type.includes('cycl')) exerciseType = 'Cycling';
          else if (type.includes('swim')) exerciseType = 'Swimming';
          else if (type.includes('yoga')) exerciseType = 'Yoga';
          else if (type.includes('pilates')) exerciseType = 'Pilates';
          else if (type.includes('weight') || type.includes('lift') || type.includes('strength')) exerciseType = 'Weight Training';
          else if (type.includes('hiit') || type.includes('intensity') || type.includes('interval')) exerciseType = 'HIIT';
          break;
        }
      }
    }
    
    if (!exerciseType) {
      addMessage(`I couldn't identify the type of workout you did. Can you tell me what type of exercise it was?`, false);
      return;
    }
    
    // Extract duration
    const durationMatch = message.match(/(\d+)\s*(min|minute|minutes|hour|hours)/);
    if (!durationMatch) {
      addMessage(`How long did you do ${exerciseType} for?`, false);
      return;
    }
    
    let duration = parseInt(durationMatch[1]);
    
    // Convert hours to minutes if needed
    if (durationMatch[2].includes('hour')) {
      duration *= 60;
    }
    
    // Determine intensity
    let intensity: 'low' | 'moderate' | 'high' = 'moderate';
    
    if (
      message.includes('easy') || 
      message.includes('light') || 
      message.includes('slow')
    ) {
      intensity = 'low';
    } else if (
      message.includes('hard') || 
      message.includes('intense') || 
      message.includes('fast')
    ) {
      intensity = 'high';
    }
    
    // Create and log the workout
    const workout: Workout = {
      type: exerciseType,
      duration,
      intensity,
      caloriesBurned: 0 // Will be calculated in storage function
    };
    
    // Calculate calories burned
    const caloriesBurned = calculateCaloriesBurned(workout, userProfile);
    workout.caloriesBurned = caloriesBurned;
    
    // Add to log
    addWorkoutToLog(workout);
    
    // Get streak for motivational message
    const streak = getWorkoutStreak();
    
    // Generate response
    let response = `Great job! I've logged your ${intensity} intensity ${exerciseType} workout for ${duration} minutes.\n\n`;
    response += `You burned approximately ${caloriesBurned} calories! 💪`;
    
    if (streak > 1) {
      response += `\n\nAmazing! You're on a ${streak}-day workout streak! Keep it up!`;
    }
    
    addMessage(response, false);
  };
  
  const handleFoodLogging = (message: string) => {
    // Try to identify food items from the message
    let identifiedFoods: Food[] = [];
    
    for (const food of commonFoods) {
      const lowerFoodName = food.name.toLowerCase();
      const simpleFoodName = lowerFoodName.split('(')[0].trim();
      
      if (
        message.toLowerCase().includes(lowerFoodName) || 
        message.toLowerCase().includes(simpleFoodName)
      ) {
        identifiedFoods.push(food);
      }
    }
    
    if (identifiedFoods.length === 0) {
      addMessage(`I couldn't identify the specific foods you ate. Can you tell me what you had, one item at a time?`, false);
      return;
    }
    
    // Create a meal from the identified foods
    const mealTime = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const meal: Meal = {
      name: "Logged Meal",
      time: new Date().toISOString(),
      foods: identifiedFoods,
      totalCalories: identifiedFoods.reduce((sum, food) => sum + food.calories, 0),
      totalMacros: identifiedFoods.reduce(
        (sum, food) => ({
          protein: sum.protein + food.macros.protein,
          carbs: sum.carbs + food.macros.carbs,
          fat: sum.fat + food.macros.fat
        }),
        { protein: 0, carbs: 0, fat: 0 } as MacroNutrients
      )
    };
    
    // Add to log
    addMealToLog(meal);
    
    // Format response
    let response = `I've logged your meal (${meal.totalCalories} calories) with:\n\n`;
    
    identifiedFoods.forEach(food => {
      response += `• ${food.name}: ${food.calories} calories\n`;
    });
    
    const today = new Date().toISOString().split('T')[0];
    const nutritionLog = getNutritionLog(today);
    
    if (nutritionLog) {
      const remainingCalories = userProfile.dailyCalories - nutritionLog.totalCalories;
      
      response += `\nYou've consumed ${nutritionLog.totalCalories} out of ${userProfile.dailyCalories} calories today. ${
        remainingCalories > 0 
          ? `You have ${remainingCalories} calories remaining.` 
          : `You've reached your calorie goal for today.`
      }`;
    }
    
    addMessage(response, false);
  };
  
  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 flex-grow overflow-auto">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <Separator />
      
      <div className="p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isProcessing}
          placeholder={isProcessing ? "Thinking..." : "Ask about nutrition, log a workout, or request meal ideas..."}
        />
      </div>
    </Card>
  );
};

export default ChatBot;
