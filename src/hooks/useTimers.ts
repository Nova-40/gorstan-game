/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// Gorstan and characters (c) Geoff Webster 2025
// Game module.

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


export const useTimers = () => {
// Variable declaration
  const timersRef = useRef<Map<string, TimerInstance>>(new Map());

  
// Variable declaration
  const setTimer = useCallback((config: TimerConfig) => {
    const { id, callback, delay, repeat = false, immediate = false } = config;

    
    clearTimer(id);

    
    if (immediate) {
      callback();
      if (!repeat) return; 
    }

// Variable declaration
    const startTime = Date.now();

// Variable declaration
    const timerCallback = () => {
      callback();

      if (repeat) {
        
// Variable declaration
        const newTimerId = window.setTimeout(timerCallback, delay);
// Variable declaration
        const timer = timersRef.current.get(id);
        if (timer) {
          timer.timerId = newTimerId;
          timer.startTime = Date.now();
        }
      } else {
        
        timersRef.current.delete(id);
      }
    };

// Variable declaration
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

  
// Variable declaration
  const clearTimer = useCallback((id: string) => {
// Variable declaration
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer.timerId);
      timersRef.current.delete(id);
    }
  }, []);

  
// Variable declaration
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => {
      window.clearTimeout(timer.timerId);
    });
    timersRef.current.clear();
  }, []);

  
// Variable declaration
  const hasTimer = useCallback((id: string): boolean => {
    return timersRef.current.has(id);
  }, []);

  
// Variable declaration
  const getRemainingTime = useCallback((id: string): number => {
// Variable declaration
    const timer = timersRef.current.get(id);
    if (!timer) return 0;

// Variable declaration
    const elapsed = Date.now() - timer.startTime;
// Variable declaration
    const remaining = Math.max(0, timer.delay - elapsed);
    return remaining;
  }, []);

  
// Variable declaration
  const getActiveTimers = useCallback((): string[] => {
    return Array.from(timersRef.current.keys());
  }, []);

  
// Variable declaration
  const getTimerStats = useCallback(() => {
// Variable declaration
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

  
// Variable declaration
  const delay = useCallback((ms: number): Promise<void> => {
    return new Promise(resolve => {
// Variable declaration
      const id = `delay_${Date.now()}_${Math.random()}`;
      setTimer({
        id,
        callback: resolve,
        delay: ms
      });
    });
  }, [setTimer]);

  
// Variable declaration
  const debounce = useCallback((id: string, callback: () => void, delay: number) => {
    setTimer({
      id,
      callback,
      delay
    });
  }, [setTimer]);

  
// Variable declaration
  const setInterval = useCallback((id: string, callback: () => void, delay: number) => {
    setTimer({
      id,
      callback,
      delay,
      repeat: true
    });
  }, [setTimer]);

  
// React effect hook
  useEffect(() => {
// JSX return block or main return
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
