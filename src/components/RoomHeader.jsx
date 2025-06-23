// src/components/RoomHeader.jsx
export function RoomHeader({ name }) {
  return (
    <h1 className="text-2xl font-semibold pb-2 border-b border-gray-300">
      {name}
    </h1>
  );
}
