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

// src/celebrate/test/CelebrationTest.tsx
// Test component to verify celebration system functionality

import React, { useEffect, useState } from 'react';
import { 
  loadCelebrationIndex, 
  getActiveCelebrations, 
  getCelebrationById 
} from '../celebrateGate';
import { CelebrationIndex, Span } from '../index';

export const CelebrationTest: React.FC = () => {
  const [index, setIndex] = useState<CelebrationIndex | null>(null);
  const [activeCelebrations, setActiveCelebrations] = useState<Span[]>([]);
  const [testCelebration, setTestCelebration] = useState<Span | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testCelebrationSystem();
  }, []);

  const testCelebrationSystem = async () => {
    try {
      setLoading(true);
      
      // Test 1: Load index
      console.log('Loading celebration index...');
      const indexData = await loadCelebrationIndex();
      setIndex(indexData);
      console.log('Index loaded:', indexData);
      
      // Test 2: Check active celebrations for today
      console.log('Checking active celebrations for today...');
      const todaysCelebrations = await getActiveCelebrations();
      setActiveCelebrations(todaysCelebrations);
      console.log('Active celebrations:', todaysCelebrations);
      
      // Test 3: Get a specific celebration (Christmas 2025)
      console.log('Testing specific celebration lookup...');
      const christmas = await getCelebrationById('2025-12-25_christmas_2025');
      setTestCelebration(christmas);
      console.log('Christmas 2025:', christmas);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      console.error('Celebration test error:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-800">Testing Celebration System...</h3>
        <p className="text-blue-600">Loading celebration data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-bold text-red-800">Celebration System Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
      <h3 className="font-bold text-green-800">🎉 Celebration System Test Results</h3>
      
      {}
      <div className="bg-white p-3 rounded border">
        <h4 className="font-semibold text-gray-800">Celebration Index</h4>
        {index ? (
          <div className="text-sm text-gray-600">
            <p>Generated: {new Date(index.generated).toLocaleString()}</p>
            <p>Year Range: {index.yearRange.start} - {index.yearRange.end}</p>
            <p>Total Celebrations: {index.totalCelebrations}</p>
            <p>Traditions: {Object.keys(index.traditions).join(', ')}</p>
          </div>
        ) : (
          <p className="text-red-500">Failed to load index</p>
        )}
      </div>

      {/* Active Celebrations */}
      <div className="bg-white p-3 rounded border">
        <h4 className="font-semibold text-gray-800">Active Celebrations Today</h4>
        {activeCelebrations.length > 0 ? (
          <ul className="text-sm text-gray-600">
            {activeCelebrations.map(celebration => (
              <li key={celebration.id} className="py-1">
                <strong>{celebration.label}</strong> ({celebration.start} to {celebration.end})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No active celebrations today</p>
        )}
      </div>

      {/* Test Lookup */}
      <div className="bg-white p-3 rounded border">
        <h4 className="font-semibold text-gray-800">Test Lookup (Christmas 2025)</h4>
        {testCelebration ? (
          <div className="text-sm text-gray-600">
            <p><strong>Label:</strong> {testCelebration.label}</p>
            <p><strong>Date:</strong> {testCelebration.start}</p>
            <p><strong>ID:</strong> {testCelebration.id}</p>
          </div>
        ) : (
          <p className="text-red-500 text-sm">Failed to find Christmas 2025</p>
        )}
      </div>

      <button 
        onClick={testCelebrationSystem}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Re-run Test
      </button>
    </div>
  );
};

export default CelebrationTest;
