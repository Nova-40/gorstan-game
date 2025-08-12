/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  Unified AI Guidance Popup Component
  Displays intelligent guidance from the unified AI system
*/

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Target, MessageCircle, X } from 'lucide-react';
import type { AIGuidanceResponse } from '../services/unifiedAI';

interface UnifiedAIPopupProps {
  guidance: AIGuidanceResponse;
  onDismiss: () => void;
  onTalkToAyla?: () => void;
  onOpenMiniquests?: () => void;
}

const UnifiedAIPopup: React.FC<UnifiedAIPopupProps> = ({
  guidance,
  onDismiss,
  onTalkToAyla,
  onOpenMiniquests
}) => {
  const getIcon = () => {
    switch (guidance.type) {
      case 'hint':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'miniquest':
        return <Target className="w-5 h-5 text-blue-400" />;
      case 'story':
        return <MessageCircle className="w-5 h-5 text-green-400" />;
      case 'dynamic_content':
        return <Brain className="w-5 h-5 text-yellow-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  const getHeaderText = () => {
    switch (guidance.type) {
      case 'hint':
        return guidance.source === 'ayla' ? '💫 Ayla\'s Guidance' : '🧠 AI Hint';
      case 'miniquest':
        return '🎯 Quest Opportunity';
      case 'story':
        return '📖 Story Insight';
      case 'dynamic_content':
        return '✨ Ambient Insight';
      case 'encouragement':
        return '💪 Encouragement';
      default:
        return '🤖 AI Guidance';
    }
  };

  const getPriorityColor = () => {
    switch (guidance.priority) {
      case 'urgent':
        return 'border-red-500/50 bg-red-900/20';
      case 'high':
        return 'border-orange-500/50 bg-orange-900/20';
      case 'medium':
        return 'border-blue-500/50 bg-blue-900/20';
      case 'low':
        return 'border-green-500/50 bg-green-900/20';
      default:
        return 'border-purple-500/50 bg-purple-900/20';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className={`
          relative p-4 rounded-lg border backdrop-blur-sm
          ${getPriorityColor()}
          shadow-lg shadow-black/20
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className="text-sm font-medium text-gray-200">
                {getHeaderText()}
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content */}
          <div className="text-gray-100 mb-3 leading-relaxed">
            {guidance.content}
          </div>

          {/* Follow-up text */}
          {guidance.followUp && (
            <div className="text-xs text-gray-400 italic mb-3">
              {guidance.followUp}
            </div>
          )}

          {/* Action Suggestions */}
          {guidance.actionSuggestions && guidance.actionSuggestions.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-1">Suggested actions:</div>
              <div className="flex flex-wrap gap-1">
                {guidance.actionSuggestions.map((action, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-700/50 rounded text-gray-300 font-mono"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 text-xs">
            {guidance.type === 'hint' && guidance.source === 'ayla' && onTalkToAyla && (
              <button
                onClick={onTalkToAyla}
                className="px-3 py-1 bg-purple-600/70 hover:bg-purple-600/90 text-white rounded transition-colors"
              >
                💬 Talk to Ayla
              </button>
            )}
            
            {guidance.type === 'miniquest' && onOpenMiniquests && (
              <button
                onClick={onOpenMiniquests}
                className="px-3 py-1 bg-blue-600/70 hover:bg-blue-600/90 text-white rounded transition-colors"
              >
                🎯 View Quests
              </button>
            )}

            <button
              onClick={onDismiss}
              className="px-3 py-1 bg-gray-600/70 hover:bg-gray-600/90 text-white rounded transition-colors"
            >
              Dismiss
            </button>
          </div>

          {/* Metadata for debugging (only in dev mode) */}
          {process.env.NODE_ENV === 'development' && guidance.metadata && (
            <div className="mt-3 pt-2 border-t border-gray-600/30">
              <div className="text-xs text-gray-500">
                <div>Source: {guidance.source}</div>
                <div>Confidence: {Math.round((guidance.metadata.confidence || 0) * 100)}%</div>
                <div>Category: {guidance.metadata.category}</div>
                {guidance.metadata.reasoning && (
                  <div className="mt-1 italic">{guidance.metadata.reasoning}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnifiedAIPopup;
