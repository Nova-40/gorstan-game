# Gorstan v4.0.0-preprod

**Gorstan** is a React-based text adventure game exploring multiversal narratives, surreal puzzles, and adaptive NPCs. This version (v4.0.0-preprod) represents the current state of development and integrates new UI features, game logic enhancements, and a modular engine with persistent state and room schema validation.

## 🛠 Project Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Run Locally**
```bash
npm run dev
```

3. **Build for Production**
```bash
npm run build
```

4. **Preview Production Build**
```bash
npm run preview
```

## 🗂 Project Structure

```
/public             → Static assets (audio, images)
/src
  /components       → React components (UI, layout, game systems)
  /engine           → Core game logic (GameEngine, roomLoader, npcEngine)
  /rooms            → JSON room definitions (do not version stamp)
/tools              → Developer utilities (e.g. validateRooms.js)
index.html          → Entry point
```

## ✅ Current Features

- Intro with teletype storytelling and branching options
- Dynamic room navigation with direction icons and tooltips
- Intelligent NPC engine (non-LLM)
- Player inventory, score, memory, and puzzle tracking
- Codex panel, Achievements, and AskAyla hint system
- Persistent state using `localStorage`
- Trap handling, reset logic, and multiversal mechanics

## 📦 Deployment Notes

This version is optimised for Vercel and can be deployed directly.
Ensure `.vercel.json` and base assets are correctly structured.

## 🧠 Development Notes

- All `.jsx`/`.js` files now include a copyright header.
- Room files in `/src/rooms/` are validated via `/tools/validateRooms.js`.
- Use this version as a reference for building forward into `v4.1.0-beta`.

---

**MIT Licensed** — All logic and code are free to reuse with attribution.  
(c) 2025 Geoffrey Alan Webster — World, names and characters copyright reserved.


## 🤖 NPC Intelligence (v4.0.0-preprod-r2)

Gorstan includes a modular deterministic AI system for NPCs:
- **Contextual Responses** based on player memory and actions
- **NPC Memory Engine** tracks past conversations, trust, and key topics
- **Reactive Behaviours** like Dominic remembering past deaths or resets
- Each NPC has:
  - A `knowledge` array (what they can speak about)
  - A `responses` dictionary keyed to topics
  - A `npcReact()` function that uses player state to deliver meaningful, unique feedback

This system is found in:
- `src/engine/npcEngine.js`
- `src/engine/npcMemory.js`
