
// gameEngine.jsx – Gorstan Core Game Logic
// (c) Geoff Webster – Modularised Engine with Item Pickup, UI Enhancements

import React, { useState, useEffect, useMemo } from 'react';
import rooms from './rooms';
import puzzles from './puzzles';
import npcs from './npcs';
import items from './items';
import codexData from './codex';
import questData from './questsData';
import { evaluateQuestProgress } from './quests';
import { saveGame, loadGame, clearGame, getHighScore, updateHighScore } from './gameUtils';

export default function GameEngine({ playerName, onReady }) {
  const [currentRoom, setCurrentRoom] = useState('OpeningScene');
  const [inventory, setInventory] = useState([]);
  const [message, setMessage] = useState('');
  const [alComment, setAlComment] = useState('');
  const [score, setScore] = useState(0);
  const [resetCount, setResetCount] = useState(0);
  const [highScore, setHighScore] = useState(getHighScore());
  const [puzzleAnswer, setPuzzleAnswer] = useState(null);
  const [dialogueStage, setDialogueStage] = useState(0);
  const [showCodex, setShowCodex] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [codex, setCodex] = useState(codexData);
  const [quests, setQuests] = useState(questData);
  const [zappedByPolly, setZappedByPolly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onReady) onReady();
    }, 500);
    return () => clearTimeout(timer);
  }, [onReady]);

  const room = useMemo(() => rooms[currentRoom], [currentRoom]);
  const npc = room?.npc ? npcs[room.npc] : null;
  const puzzle = room?.puzzle ? puzzles[room.puzzle] : null;
  const hasPremiumAccess = inventory.includes('Premium Token');
  const canEnterRoom = !room?.premiumOnly || hasPremiumAccess;

  const handleNPCInteraction = (name) => {
    if (name === 'Polly') {
      if (zappedByPolly) {
        resetPlayer();
        return;
      }
      const firstResponse = window.confirm("Polly looks at you. 'Do you remember?\n\nClick OK for Yes, Cancel for No.'");
      if (firstResponse) {
        resetPlayer();
      } else {
        alert("Polly sighs and makes you a cup of tea. Then asks: 'But do you really not remember anything?'");
        const secondResponse = window.confirm("Click OK for Yes, Cancel for No.");
        if (secondResponse) {
          resetPlayer();
        } else {
          notify("Polly rubs your hair. 'I've a book club meeting I need to go to. See you later.'");
          setMessage("Polly makes you tea and leaves you in peace.");
          setCodex((prev) => ({
            ...prev,
            Polly: {
              unlocked: true,
              text: "Polly may seem harsh, but sometimes tea and quiet are all she needs."
            }
          }));
        }
      }
    }
  };

  const handlePickup = (item) => {
    if (!inventory.includes(item)) {
      setInventory([...inventory, item]);
      notify(`You picked up: ${item}`);
    }
  };

  const handleMove = (direction) => {
    setMessage('');
    const nextRoom = room.exits[direction];
    if (nextRoom && rooms[nextRoom]) {
      const next = rooms[nextRoom];
      if (next.premiumOnly && !hasPremiumAccess) {
        setMessage('You need a Premium Token to enter this area.');
        return;
      }
      setCurrentRoom(nextRoom);
      if (next.id === 'PollysApartment') {
        handleNPCInteraction('Polly');
      } 
      setQuests(evaluateQuestProgress({
        quests,
        location: nextRoom,
        inventory,
        puzzleAnswer,
        room: next,
        codex,
        notify,
        setInventory,
        setScore
      }));
      if (next.item && !inventory.includes(next.item)) {
        setMessage(`You see a ${next.item} here.`);
      }
    } else {
      setMessage("You can't go that way.");
    }
  };

  if (currentRoom === 'OpeningScene') {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
        <h2>{playerName}, you are rushing to get home and walk into the road...</h2>
        <p>A massive yellow truck is barreling toward you.</p>
        <p>A strange shimmering portal opens beneath your feet.</p>
        <button onClick={() => setCurrentRoom('Crossing')} style={{ marginTop: '2rem', padding: '0.75rem 1.5rem' }}>
          Jump into the portal
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, fontSize: '0.8rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', maxWidth: '300px', color: '#666' }}>
        <strong>Under Construction</strong>
        <p style={{ margin: '0.5rem 0 0 0' }}>You're welcome to try the game as it is—keep in mind that it's still a work in progress, and I'm actively improving it.<br /><br />Thanks for your patience and feedback!<br /><br /><em>Best regards,<br />Geoff</em></p>
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#666' }}>Version 2.0.0</div>
      <h2>Welcome, {playerName}</h2>

      {room.image && (
        <img
          src={room.image}
          alt={room.name}
          style={{
            width: '100%',
            maxWidth: '900px',
            borderRadius: '12px',
            marginBottom: '1rem',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}
        />
      )}

      <p><em>{room.name}:</em> {room.description}</p>

      {room.item && !inventory.includes(room.item) && (
        <button onClick={() => handlePickup(room.item)} style={{ marginBottom: '1rem' }}>
          Pick up {room.item}
        </button>
      )}
      <p><strong>Inventory:</strong> {inventory.join(', ') || 'Empty'}</p>
      <p><strong>Score:</strong> {score} (High: {highScore})</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {Object.entries(room.exits).map(([dir]) => (
          <button key={dir} onClick={() => handleMove(dir)}>{dir.toUpperCase()}</button>
        ))}
        <button onClick={() => setShowCodex(!showCodex)}>📘 Codex</button>
        <button onClick={() => setShowQuests(!showQuests)}>📜 Quests</button>
        <button onClick={() => window.location.href = 'https://www.thegorstanchronicles.com/book-showcase'}>
          ❌ Quit Game
        </button>
      </div>

      {message && <p>{message}</p>}
      {alComment && <p><i>{alComment}</i></p>}
      {notifications.map((n, i) => (
        <div key={i} style={{ background: '#333', color: '#fff', marginTop: '0.5rem', padding: '0.5rem' }}>{n}</div>
      ))}
    </div>
  );
}