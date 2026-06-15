import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DependencyWarning = () => {
  const [dependencies, setDependencies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkDependencies = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/health/dependencies`);
        setDependencies(response.data);
        
        // Show warning if critical dependencies are missing
        const hasMissing = response.data.critical_missing?.length > 0;
        setShowWarning(hasMissing);
      } catch (err) {
        console.error('Failed to fetch dependencies:', err);
      } finally {
        setLoading(false);
      }
    };

    checkDependencies();
  }, []);

  if (loading || !showWarning || !dependencies) return null;

  const missingDeps = dependencies.critical_missing || [];

  return (
    <div className="fixed top-16 left-0 right-0 z-50">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-yellow-700">
              <strong className="font-medium">⚠️ Missing Dependencies:</strong>{' '}
              {missingDeps.join(', ')}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Some features may not work properly. 
              <a 
                href="/docs/installation" 
                className="underline ml-1 hover:text-yellow-800"
              >
                View installation guide →
              </a>
            </p>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="ml-4 text-yellow-500 hover:text-yellow-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DependencyWarning;