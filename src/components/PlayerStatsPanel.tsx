// src/components/PlayerStatsPanel.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// User interface panel display.

import './PlayerStatsPanel.css';

import React from 'react';

import { Heart, Star, Trophy } from 'lucide-react';

import { useGameState } from '../state/gameState';









const PlayerStatsPanel: React.FC = () => {
  const { state } = useGameState();
  const { player } = state;

  const healthPercentage = (player.health / (player.maxHealth || 100)) * 100;
  const healthColor = healthPercentage > 70 ? '#00ff00' :
                     healthPercentage > 30 ? '#ffff00' : '#ff0000';

  // Score color and rating based on current score
  const getScoreColor = (score: number) => {
    if (score >= 1000) return '#ff69b4'; // Legendary - hot pink
    if (score >= 600) return '#9370db';  // Master - medium slate blue
    if (score >= 300) return '#20b2aa';  // Explorer - light sea green
    if (score >= 100) return '#ffd700';  // Rookie - gold
    if (score >= 0) return '#87ceeb';    // Neutral - sky blue
    return '#ff6347';                    // Negative - tomato red
  };

  const getScoreRating = (score: number) => {
    if (score >= 1000) return 'Legendary';
    if (score >= 600) return 'Master';
    if (score >= 300) return 'Explorer';
    if (score >= 100) return 'Rookie';
    if (score >= 0) return 'Novice';
    return 'Chaotic';
  };

  const currentScore = player.score || 0;
  const scoreColor = getScoreColor(currentScore);
  const scoreRating = getScoreRating(currentScore);

// JSX return block or main return
  return (
    <div className="player-stats-panel">
      <div className="stats-header">Player Stats</div>

      <div className="stat-item">
        <Heart size={16} style={{ color: healthColor }} />
        <span className="stat-label">Health:</span>
        <span className="stat-value" style={{ color: healthColor }}>
          {player.health}/{player.maxHealth || 100}
        </span>
        <div className="health-bar">
          <div
            className="health-fill"
            style={{
              width: `${healthPercentage}%`,
              backgroundColor: healthColor
            }}
          />
        </div>
      </div>

      <div className="stat-item">
        <Star size={16} style={{ color: scoreColor }} />
        <span className="stat-label">Score:</span>
        <span className="stat-value" style={{ color: scoreColor }}>
          {currentScore}
        </span>
        <span className="score-rating" style={{ color: scoreColor, fontSize: '0.8em', marginLeft: '8px' }}>
          ({scoreRating})
        </span>
      </div>



      <div className="stat-item">
        <span className="stat-label">Rooms Visited:</span>
        <span className="stat-value">
          {player.visitedRooms?.length || 0}
        </span>
      </div>
    </div>
  );
};

export default PlayerStatsPanel;
