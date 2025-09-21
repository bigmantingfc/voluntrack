
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'indigo' | 'pink' | 'teal' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  variant?: 'solid' | 'outline';
}

const Badge: React.FC<BadgeProps> = ({ children, color = 'blue', size = 'md', className = '', icon, variant = 'solid' }) => {
  
  const solidColorClasses = {
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
    green: 'bg-green-100 text-green-800 border border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    red: 'bg-red-100 text-red-800 border border-red-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border border-gray-200',
    indigo: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    pink: 'bg-pink-100 text-pink-800 border border-pink-200',
    teal: 'bg-teal-100 text-teal-800 border border-teal-200',
    orange: 'bg-orange-100 text-orange-800 border border-orange-200',
  };

  // Potentially different styling for outline badges if desired
  const outlineColorClasses = {
    blue: 'border border-blue-500 text-blue-600 bg-white hover:bg-blue-50',
    green: 'border border-green-500 text-green-600 bg-white hover:bg-green-50',
    // ... add others if needed
  };
  
  const selectedColorClasses = variant === 'solid' ? solidColorClasses[color] : (outlineColorClasses[color as keyof typeof outlineColorClasses] || solidColorClasses[color]);


  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs', // Adjusted padding for sm
    md: 'px-3 py-1 text-sm',
    lg: 'px-3.5 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${selectedColorClasses} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;