import React from 'react';
import './ProgressBar.css'; // Optional: add styling

const ProgressBar = ({ 
  progress, 
  showPercentage = true, 
  showMessage = true,
  height = '8px',
  className = ''
}) => {
  if (!progress) return null;
  
  const { percent, status, message, current, total, elapsed_time } = progress;
  
  // Status colors
  const statusColors = {
    pending: 'bg-gray-500',
    processing: 'bg-blue-600',
    complete: 'bg-green-600',
    error: 'bg-red-600'
  };
  
  const barColor = statusColors[status] || 'bg-blue-600';
  
  // Status messages
  const statusMessages = {
    pending: '⏳ Preparing...',
    processing: `⚙️ Processing: ${message || `Step ${current} of ${total}`}`,
    complete: '✅ Complete! Downloading...',
    error: '❌ Error: ' + (progress.error || 'Something went wrong')
  };
  
  const displayMessage = statusMessages[status] || message;
  
  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar Container */}
      <div 
        className="relative bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`${barColor} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${Math.min(percent, 100)}%`, height: '100%' }}
        >
          {/* Optional: Animated shimmer effect while processing */}
          {status === 'processing' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      
      {/* Progress Info */}
      <div className="mt-2 flex justify-between items-center text-sm">
        {showPercentage && (
          <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
            {Math.round(percent)}%
          </span>
        )}
        
        {showMessage && displayMessage && (
          <span className="text-gray-600 dark:text-gray-400 flex-1 text-center">
            {displayMessage}
          </span>
        )}
        
        {elapsed_time && status === 'processing' && (
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {Math.round(elapsed_time)}s
          </span>
        )}
      </div>
      
      {/* Current/Total indicator */}
      {status === 'processing' && current && total && (
        <div className="mt-1 text-xs text-center text-gray-500 dark:text-gray-500">
          {current} / {total} completed
        </div>
      )}
    </div>
  );
};

export default ProgressBar;