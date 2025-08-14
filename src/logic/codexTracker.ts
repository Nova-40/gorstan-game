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

import { Achievement } from "../types/GameTypes";

import { Dispatch } from "react";

import { GameAction } from "../types/GameTypes";

import { NPC } from "../types/NPCTypes";

import { Puzzle } from "../types/GameTypes";

import { updateScore } from "../state/scoreManager";

export interface CodexEntry {
  id: string;
  name: string;
  category: ItemCategory;
  description?: string;
  loreDescription?: string;
  discoveredIn: string;
  discoveredAt: number;
  firstEncounter: boolean;
  timesFound: number;
  significance?: "mundane" | "useful" | "rare" | "legendary" | "mysterious";
  relatedQuests?: string[];
  relatedNPCs?: string[];
  tags?: string[];
}

export type ItemCategory =
  | "food_drink"
  | "fae_artifact"
  | "memory_fragment"
  | "dimensional_tool"
  | "puzzle_key"
  | "common_item"
  | "dominic_related"
  | "trap_curse"
  | "document"
  | "magical_scroll"
  | "glitch_relic"
  | "quantum_device"
  | "temporal_artifact";

let globalDispatch: Dispatch<GameAction> | null = null;

const codexEntries: Map<string, CodexEntry> = new Map();

// --- Function: initializeCodexTracker ---
export function initializeCodexTracker(dispatch: Dispatch<GameAction>): void {
  globalDispatch = dispatch;
}

// --- Function: recordItemDiscovery ---
export function recordItemDiscovery(
  itemId: string,
  roomId: string,
  itemData?: {
    name?: string;
    category?: ItemCategory;
    description?: string;
    loreDescription?: string;
    significance?: CodexEntry["significance"];
    tags?: string[];
  },
): void {
  if (!itemId || !roomId) {return;}

  // Variable declaration
  const existingEntry = codexEntries.get(itemId);
  // Variable declaration
  const isFirstEncounter = !existingEntry;

  if (existingEntry) {
    existingEntry.timesFound += 1;
    existingEntry.firstEncounter = false;
  } else {
    // Variable declaration
    const category = itemData?.category || categorizeItem(itemId);
    // Variable declaration
    const significance = itemData?.significance || assessSignificance(itemId);

    const newEntry: CodexEntry = {
      id: itemId,
      name: itemData?.name || formatItemName(itemId),
      category,
      description: itemData?.description,
      loreDescription: itemData?.loreDescription,
      discoveredIn: roomId,
      discoveredAt: Date.now(),
      firstEncounter: true,
      timesFound: 1,
      significance,
      relatedQuests: [],
      relatedNPCs: [],
      tags: itemData?.tags || [],
    };

    codexEntries.set(itemId, newEntry);
  }

  if (globalDispatch) {
    globalDispatch({
      type: "UPDATE_CODEX_ENTRY",
      payload: {
        itemId,
        entry: codexEntries.get(itemId),
        isFirstDiscovery: isFirstEncounter,
      },
    });

    if (isFirstEncounter) {
      // Variable declaration
      const entry = codexEntries.get(itemId)!;
      globalDispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: `codex-discovery-${Date.now()}`,
          text: `📖 Codex updated: ${entry.name} (${entry.category})`,
          type: "achievement",
          timestamp: Date.now(),
        },
      });
    }
  }
}

// --- Function: categorizeItem ---
function categorizeItem(itemId: string): ItemCategory {
  // Variable declaration
  const lowerItem = itemId.toLowerCase();

  if (
    lowerItem.includes("coffee") ||
    lowerItem.includes("burger") ||
    lowerItem.includes("napkin") ||
    lowerItem.includes("menu")
  ) {
    return "food_drink";
  }

  if (
    lowerItem.includes("fae") ||
    lowerItem.includes("silver") ||
    lowerItem.includes("ancient") ||
    lowerItem.includes("butterfly") ||
    lowerItem.includes("ivy") ||
    lowerItem.includes("flower")
  ) {
    return "fae_artifact";
  }

  if (
    lowerItem.includes("memory") ||
    lowerItem.includes("photo") ||
    lowerItem.includes("fragmented")
  ) {
    return "memory_fragment";
  }

  if (
    itemId.includes("remote") ||
    itemId.includes("control") ||
    itemId.includes("teleport")
  ) {
    return "dimensional_tool";
  }
  if (
    lowerItem.includes("dimensional") ||
    lowerItem.includes("portal") ||
    lowerItem.includes("reality") ||
    lowerItem.includes("quantum") ||
    lowerItem.includes("multiverse")
  ) {
    return "dimensional_tool";
  }

  if (
    lowerItem.includes("dominic") ||
    lowerItem.includes("goldfish") ||
    lowerItem.includes("fish") ||
    lowerItem.includes("anchor") ||
    lowerItem.includes("null_pointer")
  ) {
    return "dominic_related";
  }

  if (
    lowerItem.includes("key") ||
    lowerItem.includes("combination") ||
    lowerItem.includes("badge") ||
    lowerItem.includes("override")
  ) {
    return "puzzle_key";
  }

  if (
    lowerItem.includes("glitch") ||
    lowerItem.includes("code") ||
    lowerItem.includes("unstable") ||
    lowerItem.includes("corrupt")
  ) {
    return "glitch_relic";
  }

  if (
    lowerItem.includes("temporal") ||
    lowerItem.includes("time") ||
    lowerItem.includes("chronos")
  ) {
    return "temporal_artifact";
  }

  if (
    lowerItem.includes("scroll") ||
    lowerItem.includes("document") ||
    lowerItem.includes("plans") ||
    lowerItem.includes("newspaper") ||
    lowerItem.includes("receipt") ||
    lowerItem.includes("card")
  ) {
    return "document";
  }

  return "common_item";
}

// --- Function: assessSignificance ---
function assessSignificance(itemId: string): CodexEntry["significance"] {
  // Variable declaration
  const lowerItem = itemId.toLowerCase();

  if (
    lowerItem.includes("reality_anchor") ||
    lowerItem.includes("multiverse") ||
    lowerItem.includes("architect") ||
    lowerItem.includes("genesis")
  ) {
    return "legendary";
  }

  if (
    lowerItem.includes("null_pointer") ||
    lowerItem.includes("unstable") ||
    lowerItem.includes("forbidden") ||
    lowerItem.includes("cursed")
  ) {
    return "mysterious";
  }

  if (
    lowerItem.includes("dimensional") ||
    lowerItem.includes("quantum") ||
    lowerItem.includes("temporal") ||
    lowerItem.includes("fae_")
  ) {
    return "rare";
  }

  if (
    lowerItem.includes("key") ||
    lowerItem.includes("tool") ||
    lowerItem.includes("device") ||
    lowerItem.includes("compass") ||
    lowerItem.includes("scanner")
  ) {
    return "useful";
  }

  return "mundane";
}

// --- Function: formatItemName ---
function formatItemName(itemId: string): string {
  return itemId
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// --- Function: getAllCodexEntries ---
export function getAllCodexEntries(): CodexEntry[] {
  return Array.from(codexEntries.values());
}

// --- Function: getCodexEntry ---
export function getCodexEntry(itemId: string): CodexEntry | undefined {
  return codexEntries.get(itemId);
}

// --- Function: getCodexEntriesByCategory ---
export function getCodexEntriesByCategory(
  category: ItemCategory,
): CodexEntry[] {
  return Array.from(codexEntries.values()).filter(
    (entry) => entry.category === category,
  );
}

// --- Function: isItemDiscovered ---
export function isItemDiscovered(itemId: string): boolean {
  return codexEntries.has(itemId);
}

// --- Function: getCodexStats ---
export function getCodexStats(): {
  totalEntries: number;
  categoryCounts: Record<ItemCategory, number>;
  significanceCounts: Record<string, number>;
  recentDiscoveries: CodexEntry[];
} {
  // Variable declaration
  const entries = Array.from(codexEntries.values());

  // Variable declaration
  const categoryCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    },
    {} as Record<ItemCategory, number>,
  );

  // Variable declaration
  const significanceCounts = entries.reduce(
    (acc, entry) => {
      // Variable declaration
      const sig = entry.significance || "mundane";
      acc[sig] = (acc[sig] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Variable declaration
  const recentDiscoveries = entries
    .sort((a, b) => b.discoveredAt - a.discoveredAt)
    .slice(0, 5);

  return {
    totalEntries: entries.length,
    categoryCounts,
    significanceCounts,
    recentDiscoveries,
  };
}

// --- Function: updateCodexEntry ---
export function updateCodexEntry(
  itemId: string,
  updates: Partial<Omit<CodexEntry, "id" | "discoveredAt" | "firstEncounter">>,
): void {
  // Variable declaration
  const entry = codexEntries.get(itemId);
  if (!entry) {return;}

  Object.assign(entry, updates);

  if (globalDispatch) {
    globalDispatch({
      type: "UPDATE_CODEX_ENTRY",
      payload: {
        itemId,
        entry,
        isFirstDiscovery: false,
      },
    });
  }
}

// --- Function: linkItemToQuest ---
export function linkItemToQuest(itemId: string, questId: string): void {
  // Variable declaration
  const entry = codexEntries.get(itemId);
  if (!entry) {return;}

  if (!entry.relatedQuests!.includes(questId)) {
    entry.relatedQuests!.push(questId);
  }
}

// --- Function: linkItemToNPC ---
export function linkItemToNPC(itemId: string, npcId: string): void {
  // Variable declaration
  const entry = codexEntries.get(itemId);
  if (!entry) {return;}

  if (!entry.relatedNPCs!.includes(npcId)) {
    entry.relatedNPCs!.push(npcId);
  }
}

// --- Function: displayCodex ---
export function displayCodex(filter?: {
  category?: ItemCategory;
  significance?: string;
}): void {
  if (!globalDispatch) {return;}

  let entries = Array.from(codexEntries.values());

  if (filter?.category) {
    entries = entries.filter((entry) => entry.category === filter.category);
  }

  if (filter?.significance) {
    entries = entries.filter(
      (entry) => entry.significance === filter.significance,
    );
  }

  // Variable declaration
  const stats = getCodexStats();

  globalDispatch({
    type: "ADD_MESSAGE",
    payload: {
      id: `codex-header-${Date.now()}`,
      text: `📖 Item Codex (${entries.length}/${stats.totalEntries} entries)`,
      type: "system",
      timestamp: Date.now(),
    },
  });

  // Variable declaration
  const byCategory = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.category]) {acc[entry.category] = [];}
      acc[entry.category].push(entry);
      return acc;
    },
    {} as Record<ItemCategory, CodexEntry[]>,
  );

  Object.entries(byCategory).forEach(([category, categoryEntries]) => {
    globalDispatch!({
      type: "ADD_MESSAGE",
      payload: {
        id: `codex-category-${Date.now()}-${category}`,
        text: `\n--- ${category.replace(/_/g, " ").toUpperCase()} ---`,
        type: "system",
        timestamp: Date.now(),
      },
    });

    categoryEntries.forEach((entry) => {
      // Variable declaration
      const significance =
        entry.significance === "mundane" ? "" : ` (${entry.significance})`;
      // Variable declaration
      const timesSeen = entry.timesFound > 1 ? ` [x${entry.timesFound}]` : "";

      globalDispatch!({
        type: "ADD_MESSAGE",
        payload: {
          id: `codex-entry-${Date.now()}-${entry.id}`,
          text: `• ${entry.name}${significance}${timesSeen}`,
          type: "info",
          timestamp: Date.now(),
        },
      });

      if (entry.loreDescription) {
        globalDispatch!({
          type: "ADD_MESSAGE",
          payload: {
            id: `codex-lore-${Date.now()}-${entry.id}`,
            text: `  "${entry.loreDescription}"`,
            type: "narrative",
            timestamp: Date.now(),
          },
        });
      }
    });
  });
}

// --- Function: recordMiniquestCompletion ---
export function recordMiniquestCompletion(
  questId: string,
  questTitle: string,
  roomId: string,
  points: number = 25,
): void {
  const entry: CodexEntry = {
    id: `miniquest_${questId}`,
    name: questTitle,
    category: "common_item",
    description: `Completed miniquest: ${questTitle}`,
    loreDescription: `You successfully completed this optional challenge in ${roomId}.`,
    significance: "useful",
    firstEncounter: true,
    timesFound: 1,
    discoveredIn: roomId,
    discoveredAt: Date.now(),
    tags: ["miniquest", "completed", roomId],
  };
  codexEntries.set(`miniquest_${questId}`, entry);
  updateScore(points);
  console.log(
    `📖 Codex: Recorded miniquest completion - ${questTitle} (+${points} points)`,
  );
}
