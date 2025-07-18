// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: IconButton.tsx

type IconButtonProps = {
  icon: React.ReactNode;
  label?: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
};

const IconButton: React.FC<IconButtonProps> = ({ icon, label, title, onClick, disabled }) => {
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
