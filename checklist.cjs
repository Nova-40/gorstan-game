
#!/usr/bin/env node

// checklist.js — Gorstan Launch Verifier
// Run with: `node checklist.js` from project root

const fs = require("fs");
const path = require("path");

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFolderExists(folderPath) {
  return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory();
}

function getAllRoomFiles(dir) {
  const files = [];
  const walk = (d) => {
    fs.readdirSync(d).forEach(f => {
      const fullPath = path.join(d, f);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (f.endsWith(".json")) {
        files.push(fullPath);
      }
    });
  };
  walk(dir);
  return files;
}

function validateRooms(rooms) {
  let allGood = true;
  const ids = new Set();
  const roomData = {};

  rooms.forEach(r => {
    const content = fs.readFileSync(r, "utf-8");
    try {
      const parsed = JSON.parse(content);
      const room = Array.isArray(parsed) ? parsed[0] : parsed;
      ids.add(room.id);
      roomData[room.id] = room;
    } catch (err) {
      console.error("❌ Invalid JSON:", r);
      allGood = false;
    }
  });

  // Check for broken exits
  for (const [id, room] of Object.entries(roomData)) {
    const exits = room.exits || {};
    for (const dest of Object.values(exits)) {
      if (!ids.has(dest)) {
        console.warn(`⚠️  Room '${id}' has an exit to unknown room '${dest}'`);
        allGood = false;
      }
    }
  }

  return allGood;
}

// Main checklist
const checks = [
  { label: "✔️ src/rooms folder exists", pass: checkFolderExists("src/rooms") },
  { label: "✔️ All room JSON files valid and exits resolvable", pass: validateRooms(getAllRoomFiles("src/rooms")) },
  { label: "✔️ Room images present in public/images/", pass: checkFolderExists("public/images") },
  { label: "✔️ Audio assets present in public/audio/", pass: checkFolderExists("public/audio") },
  { label: "✔️ GameEngine.jsx exists", pass: checkFileExists("src/engine/GameEngine.jsx") },
  { label: "✔️ CommandInput.jsx exists", pass: checkFileExists("src/components/CommandInput.jsx") },
  { label: "✔️ RoomRenderer.jsx exists", pass: checkFileExists("src/components/RoomRenderer.jsx") },
  { label: "✔️ App builds with vite.config.js", pass: checkFileExists("vite.config.js") },
];

let allPassed = true;

console.log("🔍 Running Gorstan Launch Checklist...
");

for (const { label, pass } of checks) {
  console.log(`${pass ? label : label.replace("✔️", "❌")}`);
  if (!pass) allPassed = false;
}

console.log("\n" + (allPassed ? "✅ All checks passed. You're ready to launch!" : "⚠️ Some checks failed. See above and fix before launch."));
