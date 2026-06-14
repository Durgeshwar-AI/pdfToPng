import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Server-Sent Events (SSE)
 * 
 * @param {string} url - SSE endpoint URL
 * @param {Object} options - Configuration options
 * @returns {Object} { progress, isConnected, error, close }
 */
export const useSSE = (url, options = {}) => {
  const [progress, setProgress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  const {
    autoConnect = true,
    onComplete = null,
    onError = null,
    onProgress = null
  } = options;
  
  const close = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  }, []);
  
  const connect = useCallback(() => {
    if (!url) return;
    
    // Close existing connection
    close();
    
    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;
      
      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgress(data);
          
          // Call callback if provided
          if (onProgress) onProgress(data);
          
          // Check if complete
          if (data.status === 'complete') {
            if (onComplete) onComplete(data);
            close();
          }
          
          // Check if error
          if (data.status === 'error') {
            setError(data.error || 'Processing failed');
            if (onError) onError(data.error);
            close();
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };
      
      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        setIsConnected(false);
        setError('Connection lost. Attempting to reconnect...');
        
        // Reconnect after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connect();
          }
        }, 3000);
      };
      
    } catch (err) {
      console.error('Failed to create EventSource:', err);
      setError(err.message);
    }
  }, [url, close, onComplete, onError, onProgress]);
  
  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }
    
    return () => {
      close();
    };
  }, [url, autoConnect, connect, close]);
  
  return { progress, isConnected, error, close, reconnect: connect };
};

export default useSSE;