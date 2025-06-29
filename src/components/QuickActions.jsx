
export default function QuickActions({ onDirection, onQuickAction, onAskAyla }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {['north', 'south', 'east', 'west'].map(dir => (
          <button
            key={dir}
            onClick={() => onDirection(dir)}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md shadow transition-all duration-300"
            aria-label={`Go ${dir}`}
          >
            {dir.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['INV', 'LOOK', 'HELP', 'USE'].map(act => (
          <button
            key={act}
            onClick={() => onQuickAction(act.toLowerCase())}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md shadow transition-all duration-300"
            aria-label={`Action: ${act}`}
          >
            {act}
          </button>
        ))}
      </div>
      <button
        onClick={onAskAyla}
        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md shadow transition-all duration-300 self-end text-sm"
        aria-label="Ask Ayla"
      >
        Ask Ayla
      </button>
    </div>
  );
}
