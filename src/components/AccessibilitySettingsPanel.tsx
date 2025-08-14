import React, { useState } from "react";
import { getAccessibilityProvider } from "../npc/accessibilityProvider";

const AccessibilitySettingsPanel: React.FC = () => {
  const provider = getAccessibilityProvider();
  const [settings, setSettings] = useState(provider.getSettings());

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    provider.updateSettings(newSettings);
  };

  return (
    <div className="accessibility-settings-panel">
      <h2>Accessibility Settings</h2>
      <label>
        <input
          type="checkbox"
          checked={settings.textScaling}
          onChange={() => toggleSetting("textScaling")}
        />
        Enable Text Scaling
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.highContrast}
          onChange={() => toggleSetting("highContrast")}
        />
        Enable High Contrast
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.reduceMotion}
          onChange={() => toggleSetting("reduceMotion")}
        />
        Enable Reduced Motion
      </label>
    </div>
  );
};

export default AccessibilitySettingsPanel;
