// Component: CheatFlyout.jsx

export default function CheatFlyout({ visible, onClose, onCheatCommand }) {
  const [command, setCommand] = useState('');

  if (!visible) return null;

  return (
    <div className="fixed top-0 right-0 w-64 h-full bg-black text-green-300 border-l border-green-600 p-4 z-50 shadow-lg">
      <h2 className="text-lg font-bold mb-4">Cheat Mode</h2>
      <input
        className="w-full p-2 mb-2 bg-gray-900 text-green-200 border border-green-700 rounded"
        placeholder="Enter cheat command"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onCheatCommand(command)}
      />
      <button
        className="mt-2 bg-green-800 hover:bg-green-700 text-white px-3 py-1 rounded"
        onClick={() => onCheatCommand(command)}
      >
        Execute
      </button>
      <button
        className="absolute top-2 right-2 text-green-400 hover:text-red-400"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
