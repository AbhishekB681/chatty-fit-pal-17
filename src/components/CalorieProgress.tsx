
import React from 'react';

interface CalorieProgressProps {
  current: number;
  target: number;
}

const CalorieProgress: React.FC<CalorieProgressProps> = ({ current, target }) => {
  // Calculate percentage (cap at 100%)
  const percentage = Math.min(100, (current / target) * 100);
  
  // Calculate circle path properties
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          
          {/* Progress circle */}
          <circle
            className="progress-ring-circle"
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#9F7AEA" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Text in the center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{current}</span>
          <span className="text-sm text-gray-500">of {target} cal</span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="font-semibold text-lg">Daily Calories</h3>
        <p className="text-sm text-gray-500">
          {target - current > 0 
            ? `${target - current} calories remaining` 
            : 'Daily goal reached!'}
        </p>
      </div>
    </div>
  );
};

export default CalorieProgress;
