import React, { useState } from 'react';

const SessionGoalBanner: React.FC = () => {
  const [goal, setGoal] = useState('Stabilise the Control Nexus');
  const [progress, setProgress] = useState(false);

  const markProgress = () => setProgress(true);

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <span>{goal}</span>
      <span style={{ marginLeft: '10px', color: progress ? 'lime' : 'gray' }}>
        {progress ? '✔' : '✖'}
      </span>
      <button
        onClick={markProgress}
        style={{
          marginLeft: '10px',
          backgroundColor: 'transparent',
          color: 'white',
          border: '1px solid white',
          borderRadius: '3px',
          padding: '2px 5px',
          cursor: 'pointer',
        }}
      >
        Mark Complete
      </button>
    </div>
  );
};

export default SessionGoalBanner;
