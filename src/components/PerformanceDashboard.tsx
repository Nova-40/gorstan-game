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

// (c) Geoff Webster 2025

import React, { useState, useEffect, useCallback } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';
import { gameStateOptimizer } from '../utils/gameStateOptimizer';
import { getCacheStatus, getLoadingMetrics } from '../utils/optimizedRoomLoader';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isVisible, onClose }) => {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [optimizerMetrics, setOptimizerMetrics] = useState(gameStateOptimizer.getMetrics());
  const [roomCacheStatus, setRoomCacheStatus] = useState(getCacheStatus());
  const [roomLoadingMetrics, setRoomLoadingMetrics] = useState(getLoadingMetrics());
  const [warnings, setWarnings] = useState<string[]>([]);

  // Update metrics every second
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setOptimizerMetrics(gameStateOptimizer.getMetrics());
      setRoomCacheStatus(getCacheStatus());
      setRoomLoadingMetrics(getLoadingMetrics());
      setWarnings(performanceMonitor.getWarnings());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const generateReport = useCallback(() => {
    const report = performanceMonitor.generateReport();
    const optimizerReport = gameStateOptimizer.generateReport();
    
    const fullReport = `${report}\n\n${optimizerReport}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(fullReport).then(() => {
      alert('Performance report copied to clipboard!');
    }).catch(() => {
      // Fallback: show in console
      console.log(fullReport);
      alert('Performance report logged to console');
    });
  }, []);

  const clearWarnings = useCallback(() => {
    performanceMonitor.clearWarnings();
    setWarnings([]);
  }, []);

  if (!isVisible) return null;

  const summary = performanceMonitor.getPerformanceSummary();
  const statusColor = summary.status === 'good' ? 'text-green-400' : 
                     summary.status === 'warning' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">Performance Dashboard</h2>
          <div className="flex gap-2">
            <button
              onClick={generateReport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Export Report
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Overall Status</h3>
            <div className={`text-2xl font-bold ${statusColor}`}>
              {summary.status.toUpperCase()}
            </div>
            {summary.issues.length > 0 && (
              <div className="text-sm text-gray-400 mt-2">
                {summary.issues.length} issue(s) detected
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Frame Rate</h3>
            <div className={`text-2xl font-bold ${metrics.frameRate < 30 ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.frameRate} FPS
            </div>
            <div className="text-sm text-gray-400">Target: 60 FPS</div>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Memory Usage</h3>
            <div className={`text-2xl font-bold ${metrics.memoryUsage > 100 ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.memoryUsage} MB
            </div>
            <div className="text-sm text-gray-400">Limit: 100 MB</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Render Performance */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">Render Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Render Time:</span>
                <span className={metrics.renderTime > 16.67 ? 'text-red-400' : 'text-green-400'}>
                  {metrics.renderTime.toFixed(2)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Animation Frame Time:</span>
                <span>{metrics.animationFrameTime.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>NPC Processing:</span>
                <span className={metrics.npcProcessingTime > 10 ? 'text-red-400' : 'text-green-400'}>
                  {metrics.npcProcessingTime.toFixed(2)}ms
                </span>
              </div>
            </div>
          </div>

          {/* Room Loading */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">Room Loading</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cache Hit Rate:</span>
                <span className={roomCacheStatus.hitRate > 80 ? 'text-green-400' : 'text-yellow-400'}>
                  {roomCacheStatus.hitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cached Rooms:</span>
                <span>{roomCacheStatus.cachedRooms.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Loading Rooms:</span>
                <span>{roomCacheStatus.loadingRooms.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Loads:</span>
                <span>{roomLoadingMetrics.totalLoads}</span>
              </div>
            </div>
          </div>

          {/* State Optimization */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">State Optimization</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>State Size:</span>
                <span>{(optimizerMetrics.stateSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span>Compression Ratio:</span>
                <span>{optimizerMetrics.compressionRatio.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Cleanups:</span>
                <span>{optimizerMetrics.cleanupCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Optimization:</span>
                <span>
                  {optimizerMetrics.lastOptimization 
                    ? new Date(optimizerMetrics.lastOptimization).toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">System Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>User Agent:</span>
                <span className="truncate max-w-40" title={navigator.userAgent}>
                  {navigator.userAgent.split(' ')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Viewport:</span>
                <span>{window.innerWidth}x{window.innerHeight}</span>
              </div>
              <div className="flex justify-between">
                <span>Device Pixel Ratio:</span>
                <span>{window.devicePixelRatio || 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Online:</span>
                <span className={navigator.onLine ? 'text-green-400' : 'text-red-400'}>
                  {navigator.onLine ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-red-900 bg-opacity-20 border border-red-400 p-4 rounded mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-red-400">Performance Warnings</h3>
              <button
                onClick={clearWarnings}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
              {warnings.map((warning, index) => (
                <div key={index} className="text-red-300">
                  {warning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm"
          >
            Reload Page
          </button>
          <button
            onClick={() => {
              if ('gc' in window) {
                (window as any).gc();
                alert('Garbage collection triggered');
              } else {
                alert('Garbage collection not available');
              }
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
          >
            Force GC
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              alert('Storage cleared');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Clear Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
