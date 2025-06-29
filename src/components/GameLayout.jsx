// src/components/GameLayout.jsx
export default function GameLayout({ 
  consoleOutput, roomName, onDirection, onQuickAction, onAskAyla, onCommandSubmit 
}) {
  return (
    <div className="flex h-screen">
      {/* Left column: Main Console */}
      <div className="flex flex-col w-full md:w-2/3 lg:w-3/5 border-r border-gray-200">
        {consoleOutput /* your narrative/Ayla panel */}
        <CommandInput onSubmit={onCommandSubmit} />
      </div>

      {/* Right column: Header + Quick Actions */}
      <div className="hidden md:flex flex-col w-1/3 lg:w-2/5 p-4 space-y-6">
        <RoomHeader name={roomName} />

        <QuickActions 
          onDirection={onDirection} 
          onQuickAction={onQuickAction} 
          onAskAyla={onAskAyla} 
        />
      </div>
    </div>
  );
}
