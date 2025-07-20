// PlayerStatsPanel.tsx — components/PlayerStatsPanel.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: PlayerStatsPanel

import React from 'react';
import { useGameState } from '../state/gameState';
import { Heart, Star, Trophy } from 'lucide-react';
import './PlayerStatsPanel.css';

const PlayerStatsPanel: React.FC = () => {
  const { state } = useGameState();
  const { player } = state;

  const healthPercentage = (player.health / (player.maxHealth || 100)) * 100;
  const healthColor = healthPercentage > 70 ? '#00ff00' : 
                     healthPercentage > 30 ? '#ffff00' : '#ff0000';

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
        <Star size={16} style={{ color: '#ffd700' }} />
        <span className="stat-label">Score:</span>
        <span className="stat-value" style={{ color: '#ffd700' }}>
          {player.score || 0}
        </span>
      </div>

      <div className="stat-item">
        <Trophy size={16} style={{ color: '#c0c0c0' }} />
        <span className="stat-label">Level:</span>
        <span className="stat-value" style={{ color: '#c0c0c0' }}>
          {player.level || 1}
        </span>
      </div>

      {player.experience !== undefined && (
        <div className="stat-item">
          <span className="stat-label">XP:</span>
          <span className="stat-value">
            {player.experience}
          </span>
        </div>
      )}

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
