// codexTracker.ts — logic/codexTracker.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Initialize the codex tracker with dispatch function

// Filename: codexTracker.ts
// Location: logic/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License

import { GameAction } from '../types/GameTypes';
import { Dispatch } from 'react';

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
  significance?: 'mundane' | 'useful' | 'rare' | 'legendary' | 'mysterious';
  relatedQuests?: string[];
  relatedNPCs?: string[];
  tags?: string[];
}

export type ItemCategory = 
  | 'food_drink' 
  | 'fae_artifact' 
  | 'memory_fragment' 
  | 'dimensional_tool' 
  | 'puzzle_key' 
  | 'common_item' 
  | 'dominic_related' 
  | 'trap_curse' 
  | 'document' 
  | 'magical_scroll'
  | 'glitch_relic'
  | 'quantum_device'
  | 'temporal_artifact';

// Global dispatch reference
let globalDispatch: Dispatch<GameAction> | null = null;

// In-memory codex storage (could be persisted)
let codexEntries: Map<string, CodexEntry> = new Map();

/**
 * Initialize the codex tracker with dispatch function
 */
export function initializeCodexTracker(dispatch: Dispatch<GameAction>): void {
  globalDispatch = dispatch;
}

/**
 * Record item discovery in the codex
 */
export function recordItemDiscovery(
  itemId: string, 
  roomId: string, 
  itemData?: {
    name?: string;
    category?: ItemCategory;
    description?: string;
    loreDescription?: string;
    significance?: CodexEntry['significance'];
    tags?: string[];
  }
): void {
  if (!itemId || !roomId) return;

  const existingEntry = codexEntries.get(itemId);
  const isFirstEncounter = !existingEntry;
  
  if (existingEntry) {
    // Update existing entry
    existingEntry.timesFound += 1;
    existingEntry.firstEncounter = false;
  } else {
    // Create new entry
    const category = itemData?.category || categorizeItem(itemId);
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

  // Dispatch to game state for UI updates
  if (globalDispatch) {
    globalDispatch({
      type: 'UPDATE_CODEX_ENTRY',
      payload: {
        itemId,
        entry: codexEntries.get(itemId),
        isFirstDiscovery: isFirstEncounter,
      }
    });

    // Add discovery message if it's the first time
    if (isFirstEncounter) {
      const entry = codexEntries.get(itemId)!;
      globalDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `codex-discovery-${Date.now()}`,
          text: `📖 Codex updated: ${entry.name} (${entry.category})`,
          type: 'achievement',
          timestamp: Date.now(),
        }
      });
    }
  }
}

/**
 * Categorize an item based on its ID
 */
function categorizeItem(itemId: string): ItemCategory {
  const lowerItem = itemId.toLowerCase();
  
  // Food and drink
  if (lowerItem.includes('coffee') || lowerItem.includes('burger') || lowerItem.includes('napkin') || lowerItem.includes('menu')) {
    return 'food_drink';
  }
  
  // Fae items
  if (lowerItem.includes('fae') || lowerItem.includes('silver') || lowerItem.includes('ancient') || 
      lowerItem.includes('butterfly') || lowerItem.includes('ivy') || lowerItem.includes('flower')) {
    return 'fae_artifact';
  }
  
  // Memory items
  if (lowerItem.includes('memory') || lowerItem.includes('photo') || lowerItem.includes('fragmented')) {
    return 'memory_fragment';
  }
  
    // Dimensional and travel tools
  if (itemId.includes('remote') || itemId.includes('control') || itemId.includes('teleport')) {
    return 'dimensional_tool';
  }
  if (lowerItem.includes('dimensional') || lowerItem.includes('portal') || lowerItem.includes('reality') || 
      lowerItem.includes('quantum') || lowerItem.includes('multiverse')) {
    return 'dimensional_tool';
  }
  
  // Dominic related
  if (lowerItem.includes('dominic') || lowerItem.includes('goldfish') || lowerItem.includes('fish') || 
      lowerItem.includes('anchor') || lowerItem.includes('null_pointer')) {
    return 'dominic_related';
  }
  
  // Puzzle keys
  if (lowerItem.includes('key') || lowerItem.includes('combination') || lowerItem.includes('badge') || 
      lowerItem.includes('override')) {
    return 'puzzle_key';
  }
  
  // Glitch items
  if (lowerItem.includes('glitch') || lowerItem.includes('code') || lowerItem.includes('unstable') || 
      lowerItem.includes('corrupt')) {
    return 'glitch_relic';
  }
  
  // Temporal items
  if (lowerItem.includes('temporal') || lowerItem.includes('time') || lowerItem.includes('chronos')) {
    return 'temporal_artifact';
  }
  
  // Documents and scrolls
  if (lowerItem.includes('scroll') || lowerItem.includes('document') || lowerItem.includes('plans') || 
      lowerItem.includes('newspaper') || lowerItem.includes('receipt') || lowerItem.includes('card')) {
    return 'document';
  }
  
  return 'common_item';
}

/**
 * Assess item significance
 */
function assessSignificance(itemId: string): CodexEntry['significance'] {
  const lowerItem = itemId.toLowerCase();
  
  // Legendary items
  if (lowerItem.includes('reality_anchor') || lowerItem.includes('multiverse') || 
      lowerItem.includes('architect') || lowerItem.includes('genesis')) {
    return 'legendary';
  }
  
  // Mysterious items
  if (lowerItem.includes('null_pointer') || lowerItem.includes('unstable') || 
      lowerItem.includes('forbidden') || lowerItem.includes('cursed')) {
    return 'mysterious';
  }
  
  // Rare items
  if (lowerItem.includes('dimensional') || lowerItem.includes('quantum') || 
      lowerItem.includes('temporal') || lowerItem.includes('fae_')) {
    return 'rare';
  }
  
  // Useful items
  if (lowerItem.includes('key') || lowerItem.includes('tool') || lowerItem.includes('device') || 
      lowerItem.includes('compass') || lowerItem.includes('scanner')) {
    return 'useful';
  }
  
  return 'mundane';
}

/**
 * Format item name for display
 */
function formatItemName(itemId: string): string {
  return itemId
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get all codex entries
 */
export function getAllCodexEntries(): CodexEntry[] {
  return Array.from(codexEntries.values());
}

/**
 * Get codex entry by item ID
 */
export function getCodexEntry(itemId: string): CodexEntry | undefined {
  return codexEntries.get(itemId);
}

/**
 * Get codex entries by category
 */
export function getCodexEntriesByCategory(category: ItemCategory): CodexEntry[] {
  return Array.from(codexEntries.values()).filter(entry => entry.category === category);
}

/**
 * Check if item is discovered
 */
export function isItemDiscovered(itemId: string): boolean {
  return codexEntries.has(itemId);
}

/**
 * Get codex statistics
 */
export function getCodexStats(): {
  totalEntries: number;
  categoryCounts: Record<ItemCategory, number>;
  significanceCounts: Record<string, number>;
  recentDiscoveries: CodexEntry[];
} {
  const entries = Array.from(codexEntries.values());
  
  const categoryCounts = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {} as Record<ItemCategory, number>);
  
  const significanceCounts = entries.reduce((acc, entry) => {
    const sig = entry.significance || 'mundane';
    acc[sig] = (acc[sig] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
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

/**
 * Update codex entry with additional information
 */
export function updateCodexEntry(
  itemId: string,
  updates: Partial<Omit<CodexEntry, 'id' | 'discoveredAt' | 'firstEncounter'>>
): void {
  const entry = codexEntries.get(itemId);
  if (!entry) return;
  
  Object.assign(entry, updates);
  
  if (globalDispatch) {
    globalDispatch({
      type: 'UPDATE_CODEX_ENTRY',
      payload: {
        itemId,
        entry,
        isFirstDiscovery: false,
      }
    });
  }
}

/**
 * Link item to quest
 */
export function linkItemToQuest(itemId: string, questId: string): void {
  const entry = codexEntries.get(itemId);
  if (!entry) return;
  
  if (!entry.relatedQuests!.includes(questId)) {
    entry.relatedQuests!.push(questId);
  }
}

/**
 * Link item to NPC
 */
export function linkItemToNPC(itemId: string, npcId: string): void {
  const entry = codexEntries.get(itemId);
  if (!entry) return;
  
  if (!entry.relatedNPCs!.includes(npcId)) {
    entry.relatedNPCs!.push(npcId);
  }
}

/**
 * Display codex in game console
 */
export function displayCodex(filter?: { category?: ItemCategory; significance?: string }): void {
  if (!globalDispatch) return;
  
  let entries = Array.from(codexEntries.values());
  
  if (filter?.category) {
    entries = entries.filter(entry => entry.category === filter.category);
  }
  
  if (filter?.significance) {
    entries = entries.filter(entry => entry.significance === filter.significance);
  }
  
  const stats = getCodexStats();
  
  // Display header
  globalDispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: `codex-header-${Date.now()}`,
      text: `📖 Item Codex (${entries.length}/${stats.totalEntries} entries)`,
      type: 'system',
      timestamp: Date.now(),
    }
  });
  
  // Group by category
  const byCategory = entries.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<ItemCategory, CodexEntry[]>);
  
  // Display entries
  Object.entries(byCategory).forEach(([category, categoryEntries]) => {
    globalDispatch!({
      type: 'ADD_MESSAGE',
      payload: {
        id: `codex-category-${Date.now()}-${category}`,
        text: `\n--- ${category.replace(/_/g, ' ').toUpperCase()} ---`,
        type: 'system',
        timestamp: Date.now(),
      }
    });
    
    categoryEntries.forEach(entry => {
      const significance = entry.significance === 'mundane' ? '' : ` (${entry.significance})`;
      const timesSeen = entry.timesFound > 1 ? ` [x${entry.timesFound}]` : '';
      
      globalDispatch!({
        type: 'ADD_MESSAGE',
        payload: {
          id: `codex-entry-${Date.now()}-${entry.id}`,
          text: `• ${entry.name}${significance}${timesSeen}`,
          type: 'info',
          timestamp: Date.now(),
        }
      });
      
      if (entry.loreDescription) {
        globalDispatch!({
          type: 'ADD_MESSAGE',
          payload: {
            id: `codex-lore-${Date.now()}-${entry.id}`,
            text: `  "${entry.loreDescription}"`,
            type: 'narrative',
            timestamp: Date.now(),
          }
        });
      }
    });
  });
}

/**
 * Record miniquest completion
 */
export function recordMiniquestCompletion(
  questId: string,
  questTitle: string, 
  roomId: string
): void {
  const entry: CodexEntry = {
    id: `miniquest_${questId}`,
    name: questTitle,
    category: 'common_item', // Using existing category
    description: `Completed miniquest: ${questTitle}`,
    loreDescription: `You successfully completed this optional challenge in ${roomId}.`,
    significance: 'useful', // Using valid significance level
    firstEncounter: true,
    timesFound: 1,
    discoveredIn: roomId,
    discoveredAt: Date.now(),
    tags: ['miniquest', 'completed', roomId]
  };
  
  codexEntries.set(`miniquest_${questId}`, entry);
  console.log(`📖 Codex: Recorded miniquest completion - ${questTitle}`);
}
