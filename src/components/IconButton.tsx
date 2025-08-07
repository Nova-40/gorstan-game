// src/components/IconButton.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

type IconButtonProps = {
  icon: React.ReactNode;
  label?: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
};

const IconButton: React.FC<IconButtonProps> = ({ icon, label, title, onClick, disabled }) => {
// JSX return block or main return
  return (
    <button
      className="p-2 bg-transparent rounded-xl hover:bg-green-800 text-green-300 disabled:opacity-30"
      onClick={onClick}
      title={title || label}
      disabled={disabled}
      aria-label={label}
      type="button"
    >
      {icon}
    </button>
  );
};

export default IconButton;
