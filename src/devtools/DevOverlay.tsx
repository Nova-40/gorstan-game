import React, { useState } from "react";

const DevOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const toggleOverlay = (event: KeyboardEvent) => {
    if (event.key === "F9") {
      setVisible((prev) => !prev);
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", toggleOverlay);
    return () => window.removeEventListener("keydown", toggleOverlay);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "10px",
      zIndex: 1000,
    }}>
      <h3>Dev Overlay</h3>
      <p>Current Objective: TBD</p>
      <p>Exits: TBD</p>
      <p>Hint Availability: TBD</p>
      <p>Live Counters: TBD</p>
    </div>
  );
};

export default DevOverlay;
