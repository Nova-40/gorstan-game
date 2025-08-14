import React from 'react';

interface Room {
  id: string;
  title: string;
  unlocked: boolean;
}

interface QuickMapProps {
  rooms: Room[];
  currentRoomId: string;
}

const QuickMap: React.FC<QuickMapProps> = ({ rooms, currentRoomId }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h3>Quick Map</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rooms.map((room) => (
          <li
            key={room.id}
            style={{
              color: room.id === currentRoomId ? 'lime' : room.unlocked ? 'white' : 'gray',
            }}
          >
            {room.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickMap;
