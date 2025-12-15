import { useState, useEffect, useCallback } from 'react';

// Hook que gerencia timer do jogo (start, stop, pause, resume)
export const useGameTimer = (isActive = false, onTick = null) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeElapsed(0);
    setIsRunning(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && isActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (onTick) {
            onTick(newTime);
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isActive, onTick]);

  // Formata tempo em MM:SS
  const formatTime = useCallback((seconds = timeElapsed) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [timeElapsed]);

  return {
    timeElapsed,
    formattedTime: formatTime(),
    isRunning,
    start,
    stop,
    reset,
    pause,
    resume,
    formatTime
  };
};
