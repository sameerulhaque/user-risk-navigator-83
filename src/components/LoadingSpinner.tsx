
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'blue'
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  }[size];
  
  const colorClass = {
    blue: 'border-blue-200 border-t-blue-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
  }[color];
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-4 ${colorClass} ${sizeClass}`}></div>
    </div>
  );
};

export default LoadingSpinner;
