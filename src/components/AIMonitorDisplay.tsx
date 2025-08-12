/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  AI Monitor Display
  Real-time display of AI usage, NPC behaviors, and gameplay metrics
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Users, Gamepad2, X, Eye, EyeOff } from 'lucide-react';
import { aiUsageMonitor } from '../services/aiUsageMonitor';
import { npcAI } from '../services/npcAI';
import type { GameplayUpdate } from '../services/aiUsageMonitor';

interface AIMonitorDisplayProps {
  updates: GameplayUpdate[];
  npcBehaviors: Record<string, string>;
  onClose: () => void;
}

const AIMonitorDisplay: React.FC<AIMonitorDisplayProps> = ({ 
  updates, 
  npcBehaviors, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'metrics' | 'npcs' | 'report'>('ai');
  const [aiStats, setAIStats] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [npcStats, setNpcStats] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setAIStats(aiUsageMonitor.getAIStats());
      setMetrics(aiUsageMonitor.getMetrics());
      setNpcStats(npcAI.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center gap-2"
        >
          <Brain className="w-5 h-5" />
          <span className="text-sm font-medium">AI Monitor</span>
          {updates.length > 0 && (
            <span className="bg-red-500 text-xs px-2 py-1 rounded-full">
              {updates.length}
            </span>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-medium">AI Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-white p-1"
          >
            <EyeOff className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {[
          { id: 'ai', label: 'AI', icon: Brain },
          { id: 'metrics', label: 'Metrics', icon: Activity },
          { id: 'npcs', label: 'NPCs', icon: Users },
          { id: 'report', label: 'Report', icon: Gamepad2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1 p-2 text-xs ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-64 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="text-slate-300 text-xs">
                <div className="flex justify-between">
                  <span>AI Requests:</span>
                  <span className="text-blue-400">{aiStats?.totalRequests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="text-green-400">
                    {aiStats ? Math.round((aiStats.successfulResponses / Math.max(aiStats.totalRequests, 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Satisfaction:</span>
                  <span className="text-yellow-400">
                    {aiStats ? Math.round(aiStats.playerSatisfactionScore * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-2">
                <h4 className="text-slate-200 text-xs font-medium mb-1">Recent Activity</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {updates.slice(-5).reverse().map((update, index) => (
                    <div key={index} className="text-xs text-slate-400 p-1 bg-slate-800 rounded">
                      <span className="text-blue-300">{update.type}</span>
                      {update.data?.event?.type && (
                        <span className="ml-2 text-slate-300">({update.data.event.type})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 text-xs text-slate-300"
            >
              <div className="flex justify-between">
                <span>Play Time:</span>
                <span className="text-blue-400">
                  {metrics ? Math.round(metrics.totalPlayTime / 60000) : 0}m
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rooms Visited:</span>
                <span className="text-green-400">{metrics?.roomsVisited || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Commands:</span>
                <span className="text-yellow-400">{metrics?.commandsExecuted || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Streak:</span>
                <span className="text-purple-400">{metrics?.currentStreak || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Exploration Score:</span>
                <span className="text-orange-400">{metrics?.explorationScore || 0}</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'npcs' && (
            <motion.div
              key="npcs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="text-slate-300 text-xs">
                <div className="flex justify-between">
                  <span>Total NPCs:</span>
                  <span className="text-blue-400">{npcStats?.totalNPCs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Enabled:</span>
                  <span className="text-green-400">{npcStats?.aiEnabledNPCs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wandering:</span>
                  <span className="text-yellow-400">{npcStats?.wanderingNPCs || 0}</span>
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-2">
                <h4 className="text-slate-200 text-xs font-medium mb-1">Recent Behaviors</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(npcBehaviors).map(([npcId, behavior], index) => (
                    <div key={index} className="text-xs p-1 bg-slate-800 rounded">
                      <span className="text-blue-300">{npcId}:</span>
                      <span className="ml-2 text-slate-300">{behavior}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <button
                onClick={() => {
                  const report = aiUsageMonitor.generateUsageReport();
                  console.log('[AI Monitor] Generated Report:', report);
                  alert('Report generated! Check console for details.');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs"
              >
                Generate Full Report
              </button>
              
              <div className="text-xs text-slate-400">
                <p>Generate a comprehensive AI usage and gameplay report in the console.</p>
                <p className="mt-1 text-slate-500">Includes insights, recommendations, and detailed analytics.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AIMonitorDisplay;
