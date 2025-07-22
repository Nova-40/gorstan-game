import React, { useState, useEffect } from 'react';

import { 

import { motion, AnimatePresence } from 'framer-motion';

import { Puzzle } from './GameTypes';



// MiniquestInterface.tsx — components/MiniquestInterface.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: World-class miniquest interface component with adaptive design and comprehensive UX

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

/**
 * World-class miniquest interface component with adaptive design and comprehensive UX
 */
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
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);

  // Reset selection when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedQuest(null);
      setExpandedDetails(null);
    }
  }, [isOpen]);

  // Type-based styling
  const getTypeColor = (type: MiniquestData['type']) => {
    switch (type) {
      case 'dynamic': return 'from-emerald-500 to-teal-500';
      case 'structured': return 'from-blue-500 to-indigo-500';
      case 'puzzle': return 'from-purple-500 to-violet-500';
      case 'social': return 'from-pink-500 to-rose-500';
      case 'exploration': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getTypeIcon = (type: MiniquestData['type']) => {
    switch (type) {
      case 'dynamic': return <Zap className="w-4 h-4" />;
      case 'structured': return <Target className="w-4 h-4" />;
      case 'puzzle': return <Puzzle className="w-4 h-4" />;
      case 'social': return <Heart className="w-4 h-4" />;
      case 'exploration': return <Map className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  // Difficulty styling
  const getDifficultyData = (difficulty: MiniquestData['difficulty']) => {
    switch (difficulty) {
      case 'trivial': return { stars: 1, color: 'text-green-400', bg: 'bg-green-900/30' };
      case 'easy': return { stars: 2, color: 'text-blue-400', bg: 'bg-blue-900/30' };
      case 'medium': return { stars: 3, color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
      case 'hard': return { stars: 4, color: 'text-red-400', bg: 'bg-red-900/30' };
      default: return { stars: 2, color: 'text-blue-400', bg: 'bg-blue-900/30' };
    }
  };

  // Filter miniquests
  const filteredQuests = miniquests.filter(quest => {
    const questProgress = progress[quest.id];
    switch (filter) {
      case 'available': return questProgress?.available && !questProgress?.completed;
      case 'completed': return questProgress?.completed;
      case 'locked': return questProgress?.locked || !questProgress?.available;
      default: return true;
    }
  });

  // Check if player has required items
  const hasRequiredItems = (quest: MiniquestData) => {
    if (!quest.requiredItems) return true;
    return quest.requiredItems.every(item => playerInventory.includes(item));
  };

  const getQuestStatusInfo = (quest: MiniquestData) => {
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
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
              {/* Stats */}
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

          {/* Filter Tabs */}
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

        {/* Content */}
        <div className="flex-1 flex">
          {/* Quest List */}
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
                  const statusInfo = getQuestStatusInfo(quest);
                  const difficultyData = getDifficultyData(quest.difficulty);
                  const isSelected = selectedQuest?.id === quest.id;

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
                        {/* Quest Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${getTypeColor(quest.type)}`}>
                              {getTypeIcon(quest.type)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                                  {quest.type.toUpperCase()}
                                </span>
                                <div className={`flex items-center space-x-1 ${difficultyData.color}`}>
                                  {[...Array(difficultyData.stars)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-current" />
                                  ))}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${difficultyData.bg} ${difficultyData.color}`}>
                                  {quest.difficulty?.toUpperCase() || 'EASY'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-gray-700 ${statusInfo.color}`}>
                              {statusInfo.icon}
                              <span>{statusInfo.label}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-yellow-400">
                              <Trophy className="w-3 h-3" />
                              <span>{quest.rewardPoints}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quest Description */}
                        <p className="text-gray-300 text-sm mb-3">{quest.description}</p>

                        {/* Trigger Action */}
                        {quest.triggerAction && (
                          <div className="flex items-center space-x-2 text-xs">
                            <ArrowRight className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-400">Command: </span>
                            <code className="px-2 py-1 bg-gray-700 rounded text-green-400">
                              {quest.triggerAction}
                            </code>
                          </div>
                        )}

                        {/* Required Items */}
                        {quest.requiredItems && quest.requiredItems.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2 text-xs">
                            <Gift className="w-3 h-3 text-orange-400" />
                            <span className="text-orange-400">Required: </span>
                            <div className="flex space-x-1">
                              {quest.requiredItems.map(item => (
                                <span
                                  key={item}
                                  className={`px-2 py-1 rounded text-xs ${
                                    playerInventory.includes(item)
                                      ? 'bg-green-900/30 text-green-400'
                                      : 'bg-red-900/30 text-red-400'
                                  }`}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quest Details Panel */}
          <div className="w-1/3 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
            {selectedQuest ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Selected Quest Header */}
                <div className="text-center">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${getTypeColor(selectedQuest.type)} mb-4`}>
                    {getTypeIcon(selectedQuest.type)}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{selectedQuest.title}</h3>
                  <p className="text-gray-400">{selectedQuest.description}</p>
                </div>

                {/* Quest Details */}
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Quest Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white capitalize">{selectedQuest.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Difficulty:</span>
                        <span className="text-white capitalize">{selectedQuest.difficulty || 'Easy'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reward:</span>
                        <span className="text-yellow-400">{selectedQuest.rewardPoints} points</span>
                      </div>
                      {selectedQuest.repeatable && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Repeatable:</span>
                          <span className="text-cyan-400">Yes</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hint */}
                  {selectedQuest.hint && (
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                        <h4 className="text-sm font-semibold text-blue-400">Hint</h4>
                      </div>
                      <p className="text-blue-100 text-sm">{selectedQuest.hint}</p>
                    </div>
                  )}

                  {/* Progress Info */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Progress</h4>
                    <div className="space-y-2 text-sm">
                      {progress[selectedQuest.id] && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Attempts:</span>
                            <span className="text-white">{progress[selectedQuest.id].attempts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className={getQuestStatusInfo(selectedQuest).color}>
                              {getQuestStatusInfo(selectedQuest).label}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAttemptQuest(selectedQuest.id)}
                    disabled={!progress[selectedQuest.id]?.available || !hasRequiredItems(selectedQuest)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      progress[selectedQuest.id]?.available && hasRequiredItems(selectedQuest)
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {progress[selectedQuest.id]?.completed && !selectedQuest.repeatable
                      ? 'Already Completed'
                      : !hasRequiredItems(selectedQuest)
                      ? 'Missing Required Items'
                      : !progress[selectedQuest.id]?.available
                      ? 'Not Available'
                      : 'Attempt Quest'
                    }
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Target className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Select a Quest</h3>
                <p className="text-gray-500 text-sm">Click on a quest from the list to view details and attempt it.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MiniquestInterface;
