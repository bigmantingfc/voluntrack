import React from 'react';

interface ProgressBarProps {
  progress: number;
  message: string;
  isIndeterminate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message, isIndeterminate = false }) => {
  return (
    <div className="w-full max-w-2xl mx-auto text-center animate-fade-in-up">
      <p className="text-lg text-primary font-semibold mb-3">{message}</p>
      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
        <div
          className={`bg-gradient-to-r from-secondary to-primary h-4 rounded-full transition-all duration-500 ease-out ${isIndeterminate ? 'animate-pulse-bar' : ''}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
       {isIndeterminate && (
        <p className="text-sm text-dashboard-text-secondary mt-3">The AI is thinking hard... this can sometimes take a moment.</p>
      )}
    </div>
  );
};

export default ProgressBar;
