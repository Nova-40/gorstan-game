import React, { useState } from 'react';

interface QuestLogEntry {
  goal: string;
  nextStep: string;
  clues?: string[];
}

const initialQuestLog: QuestLogEntry[] = [
  {
    goal: 'Stabilise the Control Nexus',
    nextStep: 'Find the power core in the Control Room.',
    clues: ['The Control Room is located north of the starting area.'],
  },
];

const QuestLog: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [questLog, setQuestLog] = useState(initialQuestLog);

  const toggleVisibility = () => setVisible((prev) => !prev);

  return (
    <div>
      <button
        onClick={toggleVisibility}
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 15px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        {visible ? 'Close Quest Log' : 'What now?'}
      </button>

      {visible && (
        <div
          style={{
            position: 'fixed',
            bottom: 50,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '15px',
            borderRadius: '5px',
            zIndex: 1000,
            maxWidth: '300px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <h3>Quest Log</h3>
          {questLog.map((entry, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>Goal:</strong> {entry.goal}
              <br />
              <strong>Next Step:</strong> {entry.nextStep}
              {entry.clues && (
                <div>
                  <strong>Clues:</strong>
                  <ul>
                    {entry.clues.map((clue, i) => (
                      <li key={i}>{clue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestLog;
