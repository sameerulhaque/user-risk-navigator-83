
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  }[size];
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 ${sizeClass}`}></div>
    </div>
  );
};

export default LoadingSpinner;
