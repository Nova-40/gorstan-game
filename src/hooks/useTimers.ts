// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: useTimers.ts
// Description: Unified timer management hook for Gorstan game

import { useCallback, useRef, useEffect } from 'react';

interface TimerConfig {
  id: string;
  callback: () => void;
  delay: number;
  repeat?: boolean;
  immediate?: boolean;
}

interface TimerInstance {
  id: string;
  timerId: number;
  startTime: number;
  delay: number;
  repeat: boolean;
  callback: () => void;
}

/**
 * Unified timer management hook that handles all setTimeout/setInterval operations
 * Provides automatic cleanup, timer tracking, and debugging capabilities
 */
export const useTimers = () => {
  const timersRef = useRef<Map<string, TimerInstance>>(new Map());
  
  /**
   * Set a timer with automatic cleanup
   */
  const setTimer = useCallback((config: TimerConfig) => {
    const { id, callback, delay, repeat = false, immediate = false } = config;
    
    // Clear existing timer with same ID
    clearTimer(id);
    
    // Execute immediately if requested
    if (immediate) {
      callback();
      if (!repeat) return; // If not repeating and immediate, we're done
    }
    
    const startTime = Date.now();
    
    const timerCallback = () => {
      callback();
      
      if (repeat) {
        // For repeating timers, reschedule
        const newTimerId = window.setTimeout(timerCallback, delay);
        const timer = timersRef.current.get(id);
        if (timer) {
          timer.timerId = newTimerId;
          timer.startTime = Date.now();
        }
      } else {
        // For one-time timers, remove from tracking
        timersRef.current.delete(id);
      }
    };
    
    const timerId = window.setTimeout(timerCallback, delay);
    
    const timerInstance: TimerInstance = {
      id,
      timerId,
      startTime,
      delay,
      repeat,
      callback
    };
    
    timersRef.current.set(id, timerInstance);
  }, []);
  
  /**
   * Clear a specific timer
   */
  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer.timerId);
      timersRef.current.delete(id);
    }
  }, []);
  
  /**
   * Clear all timers
   */
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => {
      window.clearTimeout(timer.timerId);
    });
    timersRef.current.clear();
  }, []);
  
  /**
   * Check if a timer exists
   */
  const hasTimer = useCallback((id: string): boolean => {
    return timersRef.current.has(id);
  }, []);
  
  /**
   * Get remaining time for a timer
   */
  const getRemainingTime = useCallback((id: string): number => {
    const timer = timersRef.current.get(id);
    if (!timer) return 0;
    
    const elapsed = Date.now() - timer.startTime;
    const remaining = Math.max(0, timer.delay - elapsed);
    return remaining;
  }, []);
  
  /**
   * Get all active timer IDs
   */
  const getActiveTimers = useCallback((): string[] => {
    return Array.from(timersRef.current.keys());
  }, []);
  
  /**
   * Get timer statistics for debugging
   */
  const getTimerStats = useCallback(() => {
    const timers = Array.from(timersRef.current.values());
    return {
      total: timers.length,
      repeating: timers.filter(t => t.repeat).length,
      oneTime: timers.filter(t => !t.repeat).length,
      timers: timers.map(t => ({
        id: t.id,
        delay: t.delay,
        repeat: t.repeat,
        remaining: getRemainingTime(t.id),
        startTime: t.startTime
      }))
    };
  }, [getRemainingTime]);
  
  /**
   * Convenience method for delays
   */
  const delay = useCallback((ms: number): Promise<void> => {
    return new Promise(resolve => {
      const id = `delay_${Date.now()}_${Math.random()}`;
      setTimer({
        id,
        callback: resolve,
        delay: ms
      });
    });
  }, [setTimer]);
  
  /**
   * Convenience method for debouncing
   */
  const debounce = useCallback((id: string, callback: () => void, delay: number) => {
    setTimer({
      id,
      callback,
      delay
    });
  }, [setTimer]);
  
  /**
   * Convenience method for intervals
   */
  const setInterval = useCallback((id: string, callback: () => void, delay: number) => {
    setTimer({
      id,
      callback,
      delay,
      repeat: true
    });
  }, [setTimer]);
  
  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  return {
    setTimer,
    clearTimer,
    clearAllTimers,
    hasTimer,
    getRemainingTime,
    getActiveTimers,
    getTimerStats,
    delay,
    debounce,
    setInterval
  };
};

/**
 * Common timer IDs used throughout the Gorstan game
 */
export const TIMER_IDS = {
  NPC_ACTIONS: 'npc_actions',
  ROOM_TRANSITION: 'room_transition',
  AUDIO_FADE: 'audio_fade',
  COMMAND_DELAY: 'command_delay',
  AUTO_SAVE: 'auto_save',
  TYPEWRITER: 'typewriter_effect',
  DEBOUNCE_INPUT: 'debounce_input',
  SYSTEM_CHECK: 'system_check'
} as const;
