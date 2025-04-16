// CoffeeDispenserButton.jsx
export default function CoffeeDispenserButton() {
  const handleClick = () => {
    alert("Dispensing multiversal caffeine...\nAchievement unlocked: Supportive Being");
    window.open("https://buymeacoffee.com/gorstan", "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 bg-yellow-700 text-white px-3 py-2 rounded-full shadow hover:bg-yellow-800"
      title="Coffee Dispenser"
    >
      ☕
    </button>
  );
}
