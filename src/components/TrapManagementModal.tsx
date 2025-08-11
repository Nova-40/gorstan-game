/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  Trap Management Modal with Interactive Timer System
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, AlertTriangle, Wrench, Clock, Zap, Shield, Search } from 'lucide-react';
import { useGameState } from '../state/gameState';
import { getTrapByRoom, disarmTrap } from '../engine/trapController';
import { canPlayerDisarmTrap } from '../engine/trapDetection';
import Modal from './Modal';
import './TrapManagementModal.css';

interface TrapManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomId: string;
}

interface TrapManagementState {
  timeRemaining: number;
  isAnalyzing: boolean;
  isDisarming: boolean;
  hasAnalyzed: boolean;
  disarmMethod: string | null;
  trapDetails: any;
  playerActions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

const TrapManagementModal: React.FC<TrapManagementModalProps> = ({
  isOpen,
  onClose,
  currentRoomId
}) => {
  const { state, dispatch } = useGameState();
  const [managementState, setManagementState] = useState<TrapManagementState>({
    timeRemaining: 30, // 30 seconds timer
    isAnalyzing: false,
    isDisarming: false,
    hasAnalyzed: false,
    disarmMethod: null,
    trapDetails: null,
    playerActions: [],
    riskLevel: 'medium'
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const disarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get trap information
  const trap = getTrapByRoom(currentRoomId);
  const playerTraits = state.player.traits || [];
  const playerItems = state.player.inventory || [];

  // Initialize trap details and timer when modal opens
  useEffect(() => {
    if (isOpen && trap) {
      // Reset state
      setManagementState(prev => ({
        ...prev,
        timeRemaining: 30,
        hasAnalyzed: false,
        disarmMethod: null,
        trapDetails: trap,
        playerActions: [],
        riskLevel: trap.severity === 'lethal' ? 'extreme' : 
                   trap.severity === 'severe' ? 'high' :
                   trap.severity === 'light' ? 'low' : 'medium'
      }));

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setManagementState(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            // Time's up! Trap triggers
            handleTimeExpired();
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);
      if (disarmTimeoutRef.current) clearTimeout(disarmTimeoutRef.current);
    };
  }, [isOpen, trap]);

  const handleTimeExpired = useCallback(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: '⏰💥 Time expired! The trap activates automatically!',
        type: 'error',
        timestamp: Date.now()
      }
    });

    // Trigger the trap
    if (trap) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: `💀 The ${trap.severity || 'dangerous'} trap triggers! You were too slow!`,
          type: 'error',
          timestamp: Date.now()
        }
      });
    }
    onClose();
  }, [dispatch, trap, onClose]);

  const handleAnalyzeTrap = useCallback(() => {
    if (managementState.isAnalyzing || managementState.hasAnalyzed) return;

    setManagementState(prev => ({ ...prev, isAnalyzing: true }));

    // Add analysis action
    setManagementState(prev => ({
      ...prev,
      playerActions: [...prev.playerActions, '🔍 Analyzing trap mechanics...']
    }));

    analyzeTimeoutRef.current = setTimeout(() => {
      const disarmResult = canPlayerDisarmTrap(trap!, playerTraits, playerItems);
      
      setManagementState(prev => ({
        ...prev,
        isAnalyzing: false,
        hasAnalyzed: true,
        disarmMethod: disarmResult.canDisarm ? (disarmResult.method || null) : null,
        playerActions: [
          ...prev.playerActions,
          disarmResult.canDisarm 
            ? `✅ Analysis complete! Method: ${disarmResult.method} (Success chance: ${Math.round((disarmResult.chance || 0.3) * 100)}%)`
            : '❌ Analysis complete! You lack the skills/tools to safely disarm this trap.'
        ]
      }));
    }, 2000); // 2 second analysis time
  }, [managementState.isAnalyzing, managementState.hasAnalyzed, trap, playerTraits, playerItems]);

  const handleDisarmAttempt = useCallback(() => {
    if (!managementState.hasAnalyzed || !managementState.disarmMethod || managementState.isDisarming) return;

    setManagementState(prev => ({ ...prev, isDisarming: true }));

    // Add disarming action
    setManagementState(prev => ({
      ...prev,
      playerActions: [...prev.playerActions, `🔧 Attempting disarmament using ${prev.disarmMethod}...`]
    }));

    disarmTimeoutRef.current = setTimeout(() => {
      const disarmResult = canPlayerDisarmTrap(trap!, playerTraits, playerItems);
      const success = Math.random() < (disarmResult.chance || 0.3);

      if (success) {
        const disarmed = disarmTrap(currentRoomId, disarmResult.method || 'unknown');
        if (disarmed) {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: `🔧✅ Success! You skillfully disarm the ${trap!.severity || 'dangerous'} trap using ${disarmResult.method}.`,
              type: 'lore',
              timestamp: Date.now()
            }
          });

          setManagementState(prev => ({
            ...prev,
            isDisarming: false,
            playerActions: [...prev.playerActions, '🎉 Trap successfully disarmed! Area is now safe.']
          }));

          // Close modal after brief delay
          setTimeout(() => onClose(), 1500);
        } else {
          handleDisarmFailure();
        }
      } else {
        handleDisarmFailure();
      }
    }, 3000); // 3 second disarming time
  }, [managementState, trap, playerTraits, playerItems, currentRoomId, dispatch, onClose]);

  const handleDisarmFailure = useCallback(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: '💥 Disarmament failed! The trap activates!',
        type: 'error',
        timestamp: Date.now()
      }
    });

    setManagementState(prev => ({
      ...prev,
      isDisarming: false,
      playerActions: [...prev.playerActions, '💀 Disarmament failed! The trap triggered!']
    }));

    setTimeout(() => onClose(), 1500);
  }, [dispatch, onClose]);

  const handlePanicEscape = useCallback(() => {
    // 50% chance to escape without triggering trap
    const escapeSuccess = Math.random() < 0.5;
    
    if (escapeSuccess) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: '🏃‍♂️💨 You panic and retreat quickly, just avoiding the trap!',
          type: 'system',
          timestamp: Date.now()
        }
      });
    } else {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: '🏃‍♂️💥 Your panicked retreat triggers the trap!',
          type: 'error',
          timestamp: Date.now()
        }
      });
    }
    onClose();
  }, [dispatch, onClose]);

  if (!isOpen || !trap || trap.triggered) return null;

  return (
    <Modal visible={isOpen} onClose={onClose} title="⚠️ Trap Management" pinned={true}>
      <div className="trap-management-modal">
        {/* Timer Display */}
        <div className={`timer-display ${managementState.timeRemaining <= 10 ? 'urgent' : ''}`}>
          <Clock size={24} />
          <span className="timer-text">
            {managementState.timeRemaining}s remaining
          </span>
          <div className="timer-bar">
            <div 
              className="timer-fill"
              style={{ 
                width: `${(managementState.timeRemaining / 30) * 100}%`,
                backgroundColor: managementState.timeRemaining <= 10 ? '#ef4444' : 
                                managementState.timeRemaining <= 20 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
        </div>

        {/* Trap Information */}
        <div className="trap-info">
          <div className="trap-icon">
            <img src="/images/Caution.png" alt="Trap Warning" className="caution-icon" />
          </div>
          <div className="trap-details">
            <h3>{trap.name || 'Unknown Trap'}</h3>
            <p className="trap-description">{trap.description || 'A dangerous mechanism blocks your path.'}</p>
            <div className={`risk-level risk-${managementState.riskLevel}`}>
              Risk Level: {managementState.riskLevel.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="analyze-button"
            onClick={handleAnalyzeTrap}
            disabled={managementState.isAnalyzing || managementState.hasAnalyzed}
          >
            <Search size={16} />
            {managementState.isAnalyzing ? 'Analyzing...' : 
             managementState.hasAnalyzed ? 'Analyzed' : 'Analyze Trap (2s)'}
          </button>

          <button
            className="disarm-button"
            onClick={handleDisarmAttempt}
            disabled={!managementState.hasAnalyzed || !managementState.disarmMethod || managementState.isDisarming}
          >
            <Wrench size={16} />
            {managementState.isDisarming ? 'Disarming...' : 'Disarm Trap (3s)'}
          </button>

          <button
            className="escape-button"
            onClick={handlePanicEscape}
          >
            <Shield size={16} />
            Panic Escape (50% chance)
          </button>
        </div>

        {/* Action Log */}
        <div className="action-log">
          <h4>Action Log:</h4>
          <div className="log-entries">
            {managementState.playerActions.map((action, index) => (
              <div key={index} className="log-entry">
                {action}
              </div>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="help-text">
          <p>⚠️ You have {managementState.timeRemaining} seconds before the trap automatically triggers!</p>
          <p>📋 Analyze the trap first to determine disarmament options.</p>
          <p>🔧 Disarmament success depends on your skills and tools.</p>
        </div>
      </div>
    </Modal>
  );
};

export default TrapManagementModal;
