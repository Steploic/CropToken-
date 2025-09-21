import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'crop-green', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    'crop-green': 'border-crop-green',
    'crop-gold': 'border-crop-gold',
    'crop-orange': 'border-crop-orange',
    white: 'border-white'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 ${colorClasses[color]} border-t-transparent`}></div>
    </div>
  );
};

export default LoadingSpinner;
