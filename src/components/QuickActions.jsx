// src/components/QuickActions.jsx
export default function QuickActions({ onDirection, onQuickAction, onAskAyla }) {
  return (
    <div className="space-y-4">
      {/* Directions row */}
      <div className="grid grid-cols-2 gap-2">
        {["north", "south", "east", "west"].map(dir => (
          <button
            key={dir}
            onClick={() => onDirection(dir)}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md shadow"
          >
            {dir.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Quick-action row */}
      <div className="grid grid-cols-2 gap-2">
        {["INV", "LOOK", "HELP", "USE"].map(act => (
          <button
            key={act}
            onClick={() => onQuickAction(act.toLowerCase())}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md shadow"
          >
            {act}
          </button>
        ))}
      </div>

      {/* Ask Ayla */}
      <button
        onClick={onAskAyla}
        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md shadow self-end text-sm"
      >
        Ask Ayla
      </button>
    </div>
  );
}
