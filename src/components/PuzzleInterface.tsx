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

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Zap,
  Target,
  HelpCircle,
  RotateCw,
  Award,
  Puzzle,
  Eye,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';









export interface PuzzleData {
  id: string;
  name: string;
  type: 'logic' | 'pattern' | 'navigation' | 'social' | 'memory' | 'sequence' | 'mathematical';
  difficulty: 'trivial' | 'easy' | 'moderate' | 'hard' | 'expert' | 'legendary';
  description: string;
  instructions?: string;
  requiredItems?: string[];
  requiredTraits?: string[];
  maxAttempts?: number;
  timeLimit?: number;
  hints?: string[];
  components?: PuzzleComponent[];
  validation?: (input: any) => { success: boolean; feedback: string };
  rewards?: {
    score?: number;
    items?: string[];
    achievements?: string[];
    story?: string[];
  };
}

export interface PuzzleComponent {
  type: 'text_input' | 'multiple_choice' | 'sequence_selector' | 'pattern_grid' | 'slider' | 'door_choice' | 'item_combiner';
  id: string;
  label?: string;
  options?: string[];
  value?: any;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  gridSize?: { rows: number; cols: number };
}

export interface PuzzleInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PuzzleData;
  playerInventory: string[];
  playerTraits: string[];
  onSubmit: (solution: any) => Promise<{ success: boolean; feedback: string; rewards?: any }>;
  onHint?: (hintIndex: number) => void;
  currentAttempt?: number;
  timeRemaining?: number;
}

const PuzzleInterface: React.FC<PuzzleInterfaceProps> = ({
  isOpen,
  onClose,
  puzzle,
  playerInventory,
  playerTraits,
  onSubmit,
  onHint,
  currentAttempt = 0,
  timeRemaining
}) => {
  const [solution, setSolution] = useState<any>({});
// React state declaration
  const [isSubmitting, setIsSubmitting] = useState(false);
// React state declaration
  const [showHints, setShowHints] = useState(false);
  const [usedHints, setUsedHints] = useState<number[]>([]);
// React state declaration
  const [showDetails, setShowDetails] = useState(true);
  const [feedback, setFeedback] = useState<string>('');
// React state declaration
  const [pulseEffect, setPulseEffect] = useState(false);

  
// Variable declaration
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial':
        return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'easy':
        return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'moderate':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300' };
      case 'hard':
        return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300' };
      case 'expert':
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' };
      case 'legendary':
        return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

// Variable declaration
  const difficultyStyles = getDifficultyStyles(puzzle.difficulty);

  
// Variable declaration
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'logic': return <Brain className="w-5 h-5" />;
      case 'pattern': return <Target className="w-5 h-5" />;
      case 'navigation': return <RotateCw className="w-5 h-5" />;
      case 'social': return <Eye className="w-5 h-5" />;
      case 'memory': return <Zap className="w-5 h-5" />;
      case 'sequence': return <Puzzle className="w-5 h-5" />;
      case 'mathematical': return <Award className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  
// Variable declaration
  const formatTime = (seconds: number) => {
// Variable declaration
    const mins = Math.floor(seconds / 60);
// Variable declaration
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  
// Variable declaration
  const handleComponentChange = (componentId: string, value: any) => {
    setSolution((prev: any) => ({
      ...prev,
      [componentId]: value
    }));
  };

  
// Variable declaration
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setPulseEffect(true);

    try {
// Variable declaration
      const result = await onSubmit(solution);
      setFeedback(result.feedback);

      if (result.success) {
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setFeedback('An error occurred while processing your solution.');
    } finally {
      setIsSubmitting(false);
      setPulseEffect(false);
    }
  };

  
// Variable declaration
  const handleHint = (hintIndex: number) => {
    if (usedHints.includes(hintIndex)) return;
    setUsedHints(prev => [...prev, hintIndex]);
    onHint?.(hintIndex);
  };

  
// Variable declaration
  const renderComponent = (component: PuzzleComponent) => {
// Variable declaration
    const value = solution[component.id] || '';

    switch (component.type) {
      case 'text_input':
// JSX return block or main return
        return (
          <div key={component.id} className="space-y-2">
            {component.label && (
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
              </label>
            )}
            <input
              type="text"
              value={value}
              onChange={(e) => handleComponentChange(component.id, e.target.value)}
              placeholder={component.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'multiple_choice':
// JSX return block or main return
        return (
          <div key={component.id} className="space-y-2">
            {component.label && (
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
              </label>
            )}
            <div className="space-y-2">
              {component.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={component.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleComponentChange(component.id, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'door_choice':
// JSX return block or main return
        return (
          <div key={component.id} className="space-y-4">
            {component.label && (
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
              </label>
            )}
            <div className="grid grid-cols-3 gap-4">
              {component.options?.map((option, index) => {
// Variable declaration
                const isSelected = value === option;
// Variable declaration
                const doorColors = ['red', 'blue', 'green'];
// Variable declaration
                const colorClasses = {
                  red: 'bg-red-500 hover:bg-red-600 border-red-600',
                  blue: 'bg-blue-500 hover:bg-blue-600 border-blue-600',
                  green: 'bg-green-500 hover:bg-green-600 border-green-600'
                };

// JSX return block or main return
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleComponentChange(component.id, option)}
                    className={`
                      relative p-6 rounded-lg border-2 transition-all duration-200
                      ${isSelected
                        ? `${colorClasses[doorColors[index] as keyof typeof colorClasses]} text-white shadow-lg`
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {isSelected ? <Unlock className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                      <span className="font-medium">{option}</span>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 'pattern_grid':
// Variable declaration
        const gridSize = component.gridSize || { rows: 3, cols: 3 };
// Variable declaration
        const gridValue = value || [];
// JSX return block or main return
        return (
          <div key={component.id} className="space-y-2">
            {component.label && (
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
              </label>
            )}
            <div
              className="grid gap-2 w-fit mx-auto p-4 bg-gray-50 rounded-lg"
              style={{ gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)` }}
            >
              {Array.from({ length: gridSize.rows * gridSize.cols }).map((_, index) => {
// Variable declaration
                const isActive = gridValue.includes(index);
// JSX return block or main return
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
// Variable declaration
                      const newValue = isActive
                        ? gridValue.filter((v: number) => v !== index)
                        : [...gridValue, index];
                      handleComponentChange(component.id, newValue);
                    }}
                    className={`
                      w-12 h-12 rounded-lg border-2 transition-all duration-200
                      ${isActive
                        ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {isActive && <CheckCircle className="w-6 h-6 mx-auto" />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

// Variable declaration
  const canSubmit = puzzle.components?.every(comp =>
    !comp.required || solution[comp.id] !== undefined && solution[comp.id] !== ''
  ) ?? true;

// JSX return block or main return
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {}
          <div className={`p-6 border-b ${difficultyStyles.bg} ${difficultyStyles.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${difficultyStyles.bg} border ${difficultyStyles.border}`}>
                  {getTypeIcon(puzzle.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{puzzle.name}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyStyles.color} ${difficultyStyles.bg} ${difficultyStyles.border} border`}>
                      {puzzle.difficulty.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {puzzle.type.toUpperCase()}
                    </span>
                    {puzzle.maxAttempts && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 border border-blue-200">
                        Attempt {currentAttempt + 1}/{puzzle.maxAttempts}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {timeRemaining && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="flex-1 overflow-y-auto">
            {}
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors mb-3"
              >
                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                <span className="font-medium">Puzzle Details</span>
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-600 leading-relaxed mb-4">{puzzle.description}</p>
                    {puzzle.instructions && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
                        <p className="text-blue-700 text-sm">{puzzle.instructions}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {}
            {(puzzle.requiredItems?.length || puzzle.requiredTraits?.length) && (
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-medium text-gray-800 mb-3">Requirements:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {puzzle.requiredItems?.length && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Required Items:</h5>
                      <div className="space-y-1">
                        {puzzle.requiredItems.map(item => {
// Variable declaration
                          const hasItem = playerInventory.includes(item);
// JSX return block or main return
                          return (
                            <div key={item} className="flex items-center space-x-2">
                              {hasItem ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className={`text-sm ${hasItem ? 'text-green-700' : 'text-red-700'}`}>
                                {item}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {puzzle.requiredTraits?.length && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Required Traits:</h5>
                      <div className="space-y-1">
                        {puzzle.requiredTraits.map(trait => {
// Variable declaration
                          const hasTrait = playerTraits.includes(trait);
// JSX return block or main return
                          return (
                            <div key={trait} className="flex items-center space-x-2">
                              {hasTrait ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className={`text-sm ${hasTrait ? 'text-green-700' : 'text-red-700'}`}>
                                {trait}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {}
            {puzzle.components?.length && (
              <div className="p-6 space-y-6">
                <h4 className="font-medium text-gray-800 mb-4">Solution:</h4>
                {puzzle.components.map(component => renderComponent(component))}
              </div>
            )}

            {}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-t border-gray-100"
              >
                <div className={`p-4 rounded-lg border ${
                  feedback.includes('success') || feedback.includes('correct')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <p className="font-medium">{feedback}</p>
                </div>
              </motion.div>
            )}
          </div>

          {}
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {puzzle.hints?.length && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center space-x-2 px-4 py-2 text-yellow-600 hover:text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-all"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Hints ({usedHints.length}/{puzzle.hints.length})</span>
                </button>
              )}

              {showHints && puzzle.hints && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-20 left-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md"
                >
                  <h5 className="font-medium text-gray-800 mb-2">Available Hints:</h5>
                  <div className="space-y-2">
                    {puzzle.hints.map((hint, index) => (
                      <button
                        key={index}
                        onClick={() => handleHint(index)}
                        disabled={usedHints.includes(index)}
                        className={`
                          block w-full text-left p-2 rounded text-sm transition-all
                          ${usedHints.includes(index)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                          }
                        `}
                      >
                        {usedHints.includes(index) ? hint : `Hint ${index + 1} (Click to reveal)`}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`
                  px-8 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                  ${canSubmit && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                  ${pulseEffect ? 'animate-pulse' : ''}
                `}
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Solution</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PuzzleInterface;
