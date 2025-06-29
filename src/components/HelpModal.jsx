
import React from 'react';
import { X } from 'lucide-react';

const HelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-xl max-w-md w-full relative shadow-lg">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close Help"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl mb-4 font-bold">Gorstan Help</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Explore using buttons or quick actions.</li>
          <li>Hold <kbd>Ctrl</kbd> and click certain links for hidden cheats.</li>
          <li>Use the top-right tray to mute sound or toggle fullscreen.</li>
          <li>Your progress is saved automatically in this browser.</li>
          <li>If things break, click "Reset to Welcome".</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpModal;
