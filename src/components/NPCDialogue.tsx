import { NPC } from './NPCTypes';



// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: NPCDialogue.tsx

type NPCDialogueProps = {
  npc?: string | null;
  onClose: () => void;
  playerName?: string;
  dispatchGameState?: (action: { type: string }) => void;
};

/**
 * NPCDialogue
 * Renders a dialogue popup for the specified NPC.
 * Handles special logic for "wendell" and displays default lines for others.
 */
const NPCDialogue: React.FC<NPCDialogueProps> = ({
  npc,
  onClose,
  playerName,
  dispatchGameState,
}) => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (
      npc === 'wendell' &&
      playerName?.toLowerCase() !== 'mr wendell'
    ) {
                  setMessage(usedBefore ? `${phrase} Again.` : phrase);
      localStorage.setItem('wendellRude', 'true');

      setTimeout(() => {
        document.body.classList.add('flash-red');
        setTimeout(() => {
          document.body.classList.remove('flash-red');
          if (dispatchGameState) {
            dispatchGameState({ type: 'RESET' });
          }
        }, 1200);
      }, 1800);
    }
  }, [npc, playerName, dispatchGameState]);

  const npcLines: Record<string, string> = {
    dominic: "Bloop. You again?",
    polly: "What do you want? I'm thinking.",
    albie: "Stay in your lane, citizen.",
    chef: "Order up!",
    ayla: "I'm part of the game, not playing it — so they are your choices.",
    'mr wendell': "Greetings. I remember everything. Even you."
  };

  if (!npc) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black border border-green-600 text-green-300 p-4 rounded w-64 shadow-xl z-50">
      <div className="flex justify-between items-center mb-2">
        <strong>{npc.charAt(0).toUpperCase() + npc.slice(1)}</strong>
        <button className="text-green-400 hover:text-red-400" onClick={onClose} type="button">&times;</button>
      </div>
      <p className="text-sm italic">
        {message || npcLines[npc.toLowerCase()] || "They don't respond."}
      </p>
    </div>
  );
};

export default NPCDialogue;
