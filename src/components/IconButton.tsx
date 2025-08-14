/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// Gorstan and characters (c) Geoff Webster 2025
// Game module.

type IconButtonProps = {
  icon: React.ReactNode;
  label?: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
};

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  title,
  onClick,
  disabled,
}) => {
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
