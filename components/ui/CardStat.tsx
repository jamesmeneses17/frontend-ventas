"use client";

import { ReactNode } from "react";

interface CardStatProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string; 
}

export default function CardStat({ title, value, icon, color = "text-indigo-600" }: CardStatProps) {
  
  let bgColorClass;
  if (color.includes('blue')) bgColorClass = 'bg-blue-100/50';
  else if (color.includes('red')) bgColorClass = 'bg-red-100/50';
  else if (color.includes('yellow')) bgColorClass = 'bg-yellow-100/50'; 
  else if (color.includes('indigo')) bgColorClass = 'bg-indigo-100/50';
  else bgColorClass = 'bg-gray-100/50';

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-300 flex flex-col justify-between h-32">
      
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-500 truncate">
          {title}
        </p>
        
        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${bgColorClass} ${color}`}>
          {icon} 
        </div>
      </div>
      
      <div>
        <p className="text-3xl font-bold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}