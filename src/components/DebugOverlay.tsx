import React, { useState, useEffect } from 'react';
import { getTelemetry } from '../utils/telemetry';

const DebugOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [metrics, setMetrics] = useState(getTelemetry());

  useEffect(() => {
    const toggleOverlay = (event: KeyboardEvent) => {
      if (event.key === 'F9') {
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', toggleOverlay);
    return () => window.removeEventListener('keydown', toggleOverlay);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getTelemetry());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      zIndex: 1000,
      fontFamily: 'monospace',
    }}>
      <h3>Debug Metrics</h3>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
};

export default DebugOverlay;
