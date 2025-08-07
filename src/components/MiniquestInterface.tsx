// src/components/MiniquestInterface.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Target,
  Trophy,
  Clock,
  CheckCircle,
  X,
  HelpCircle,
  User,
  Search,
  Puzzle,
  Heart,
  Map,
  RotateCcw,
  Zap,
  Gift,
  ArrowRight,
  Award,
  Lightbulb
} from 'lucide-react';

export interface MiniquestData {
  id: string;
  title: string;
  description: string;
  type: 'dynamic' | 'structured' | 'puzzle' | 'social' | 'exploration';
  rewardPoints: number;
  flagOnCompletion: string;
  requiredItems?: string[];
  requiredConditions?: string[];
  triggerAction?: string;
  triggerText?: string;
  hint?: string;
  repeatable?: boolean;
  timeLimit?: number;
  difficulty?: 'trivial' | 'easy' | 'medium' | 'hard';
}

export interface MiniquestProgress {
  completed: boolean;
  attempts: number;
  available: boolean;
  locked?: boolean;
  lockReason?: string;
}

export interface MiniquestInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  miniquests: MiniquestData[];
  progress: { [questId: string]: MiniquestProgress };
  onAttemptQuest: (questId: string) => void;
  playerInventory: string[];
  totalScore?: number;
  completedCount?: number;
  availableCount?: number;
}

const MiniquestInterface: React.FC<MiniquestInterfaceProps> = ({
  isOpen,
  onClose,
  roomName,
  miniquests,
  progress,
  onAttemptQuest,
  playerInventory,
  totalScore = 0,
  completedCount = 0,
  availableCount = 0
}) => {
  const [selectedQuest, setSelectedQuest] = useState<MiniquestData | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'completed' | 'locked'>('all');

  
// React effect hook
  useEffect(() => {
    if (!isOpen) {
      setSelectedQuest(null);
    }
  }, [isOpen]);

  
// Variable declaration
  const filteredQuests = useMemo(() => {
    return miniquests.filter(quest => {
// Variable declaration
      const questProgress = progress[quest.id];
      switch (filter) {
        case 'available':
          return questProgress?.available && !questProgress?.completed;
        case 'completed':
          return questProgress?.completed;
        case 'locked':
          return questProgress?.locked || !questProgress?.available;
        default:
          return true;
      }
    });
  }, [miniquests, progress, filter]);

  
// Variable declaration
  const hasRequiredItems = useCallback(
    (quest: MiniquestData) => {
      if (!quest.requiredItems) return true;
      return quest.requiredItems.every(item => playerInventory.includes(item));
    },
    [playerInventory]
  );

  
// Variable declaration
  const getQuestStatusInfo = useCallback(
    (quest: MiniquestData) => {
// Variable declaration
      const questProgress = progress[quest.id];

      if (questProgress?.completed) {
        return {
          status: quest.repeatable ? 'repeatable' : 'completed',
          color: quest.repeatable ? 'text-cyan-400' : 'text-green-400',
          icon: quest.repeatable ? <RotateCcw className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />,
          label: quest.repeatable ? 'REPEATABLE' : 'COMPLETED'
        };
      }

      if (questProgress?.available && hasRequiredItems(quest)) {
        return {
          status: 'available',
          color: 'text-blue-400',
          icon: <Target className="w-4 h-4" />,
          label: 'AVAILABLE'
        };
      }

      if (!hasRequiredItems(quest)) {
        return {
          status: 'needs_items',
          color: 'text-orange-400',
          icon: <Gift className="w-4 h-4" />,
          label: 'NEEDS ITEMS'
        };
      }

      return {
        status: 'locked',
        color: 'text-gray-400',
        icon: <X className="w-4 h-4" />,
        label: 'LOCKED'
      };
    },
    [progress, hasRequiredItems]
  );

  if (!isOpen) return null;

// JSX return block or main return
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Miniquests</h2>
                <p className="text-indigo-200">{roomName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold">{completedCount}</div>
                  <div className="text-xs text-indigo-200">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{availableCount}</div>
                  <div className="text-xs text-indigo-200">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{totalScore}</div>
                  <div className="text-xs text-indigo-200">Total Score</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {}
          <div className="flex space-x-2 mt-4">
            {[
              { key: 'all', label: 'All', icon: <Target className="w-4 h-4" /> },
              { key: 'available', label: 'Available', icon: <Zap className="w-4 h-4" /> },
              { key: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> },
              { key: 'locked', label: 'Locked', icon: <X className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  filter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/15'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="flex-1 flex">
          {}
          <div className="w-2/3 p-6 overflow-y-auto">
            {filteredQuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Search className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Quests Found</h3>
                <p className="text-gray-500">Try changing the filter or explore the area more.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuests.map(quest => {
// Variable declaration
                  const statusInfo = getQuestStatusInfo(quest);
// Variable declaration
                  const isSelected = selectedQuest?.id === quest.id;

// JSX return block or main return
                  return (
                    <motion.div
                      key={quest.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`bg-gray-800 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedQuest(quest)}
                    >
                      <div className="p-4">
                        {}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${statusInfo.color}`}>{statusInfo.icon}</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                              <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MiniquestInterface;
