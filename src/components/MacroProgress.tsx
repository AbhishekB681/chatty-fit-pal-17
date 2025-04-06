
import React from 'react';
import { MacroNutrients } from '@/types/user';
import { Progress } from '@/components/ui/progress';

interface MacroProgressProps {
  current: MacroNutrients;
  target: MacroNutrients;
}

const MacroProgress: React.FC<MacroProgressProps> = ({ current, target }) => {
  // Calculate percentages (cap at 100%)
  const proteinPercent = Math.min(100, (current.protein / target.protein) * 100);
  const carbsPercent = Math.min(100, (current.carbs / target.carbs) * 100);
  const fatPercent = Math.min(100, (current.fat / target.fat) * 100);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
      <h3 className="font-semibold text-lg mb-4">Daily Macros</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Protein</span>
            <span className="text-sm text-gray-500">
              {current.protein}g / {target.protein}g
            </span>
          </div>
          <Progress 
            value={proteinPercent} 
            className="h-2"
            indicatorClassName="bg-app-blue"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Carbs</span>
            <span className="text-sm text-gray-500">
              {current.carbs}g / {target.carbs}g
            </span>
          </div>
          <Progress 
            value={carbsPercent} 
            className="h-2"
            indicatorClassName="bg-app-purple" 
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Fat</span>
            <span className="text-sm text-gray-500">
              {current.fat}g / {target.fat}g
            </span>
          </div>
          <Progress 
            value={fatPercent} 
            className="h-2"
            indicatorClassName="bg-app-coral" 
          />
        </div>
      </div>
    </div>
  );
};

export default MacroProgress;
