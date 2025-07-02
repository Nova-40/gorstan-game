// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: storyProgress.js
// Path: src/engine/storyProgress.js


// src/engine/storyProgress.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// storyProgress utility for Gorstan game.
// Provides a flexible flag and event system for tracking story, quest, and chapter progress.
// Supports flag expiry, dependencies, categories, event triggers, and persistence.

/**
 * In-memory set of all active flags.
 * Not all flags are persisted unless explicitly saved.
 * @type {Set<string>}
 */
const flags = new Set();

/**
 * Stores expiry timestamps for flags (ms since epoch).
 * @type {Object.<string, number>}
 */
const flagTimestamps = {};

/**
 * Defines dependencies between flags (flag: [requiredFlags]).
 * @type {Object.<string, string[]>}
 */
const flagDependencies = {};

/**
 * Categorized flag sets for quest, story event, and chapter progress.
 * @type {Object.<string, Set<string>>}
 */
const categorizedFlags = {
  quest: new Set(),
  story_event: new Set(),
  chapter_progress: new Set(),
};

/**
 * Stores event handler functions for each flag.
 * @type {Object.<string, Function>}
 */
const eventTriggers = {};

/**
 * Sets a story flag, with optional expiry and category.
 * @param {string} flag - The flag to set.
 * @param {number} [expiry=null] - Optional expiry time in ms.
 * @param {string} [category=''] - Optional category for flag organization.
 */
export function setFlag(flag, expiry = null, category = '') {
  flags.add(flag);
  if (expiry) flagTimestamps[flag] = Date.now() + expiry;
  if (category && categorizedFlags[category]) {
    categorizedFlags[category].add(flag);
  }
}

/**
 * Checks if a flag has been set.
 * @param {string} flag - The flag to check.
 * @returns {boolean} - True if the flag is set, false otherwise.
 */
export function hasFlag(flag) {
  return flags.has(flag);
}

/**
 * Checks if a flag has expired based on its timestamp.
 * @param {string} flag - The flag to check.
 * @returns {boolean} - True if the flag has expired, false otherwise.
 */
export function isFlagExpired(flag) {
  const expiryTime = flagTimestamps[flag];
  return expiryTime ? Date.now() > expiryTime : false;
}

/**
 * Retrieves all currently set flags.
 * @returns {string[]} - An array of all flags.
 */
export function getAllFlags() {
  return [...flags];
}

/**
 * Retrieves flags by category (e.g., 'quest', 'story_event').
 * @param {string} category - The category of flags to retrieve.
 * @returns {string[]} - An array of flags in the specified category.
 */
export function getFlagsByCategory(category) {
  return [...(categorizedFlags[category] || [])];
}

/**
 * Checks if a flag can be activated, considering its dependencies.
 * @param {string} flag - The flag to check.
 * @returns {boolean} - True if all required flags are set, false otherwise.
 */
export function canActivateFlag(flag) {
  const requiredFlags = flagDependencies[flag] || [];
  return requiredFlags.every(dep => hasFlag(dep));
}

/**
 * Registers a trigger function for an event when a flag is set.
 * @param {string} flag - The flag to listen for.
 * @param {function} eventCallback - The function to call when the flag is set.
 */
export function registerEventTrigger(flag, eventCallback) {
  eventTriggers[flag] = eventCallback;
}

/**
 * Triggers an event based on the flag being set.
 * @param {string} flag - The flag to check and trigger the event.
 */
export function triggerEvent(flag) {
  if (eventTriggers[flag]) {
    eventTriggers[flag]();
  }
}

/**
 * Loads flags from localStorage (for persistence across sessions).
 * Only loads the flag names, not expiry or categories.
 */
export function loadFlags() {
  const savedFlags = localStorage.getItem('storyFlags');
  if (savedFlags) {
    savedFlags.split(',').forEach(flag => flags.add(flag));
  }
  // TODO: Load flagTimestamps and categorizedFlags if persistence is needed.
}

/**
 * Saves flags to localStorage (for persistence across sessions).
 * Only saves the flag names.
 */
export function saveFlags() {
  localStorage.setItem('storyFlags', [...flags].join(','));
  // TODO: Save flagTimestamps and categorizedFlags if persistence is needed.
}

/**
 * Initializes the story flags to their default values.
 * Sets a predefined list of initial flags.
 */
export function initialiseStoryProgress() {
  const initialFlags = [
    'firstVisit',
    'hasMap',
    'foundArtifact',
    'questCompleted',
  ];
  initialFlags.forEach(flag => setFlag(flag));
}

/**
 * Retrieves the current flags in a safe manner (returns a copy).
 * @returns {string[]} - A copy of the currently set flags.
 */
export function getStoryFlags() {
  return [...flags]; // Return a copy to avoid external mutation
}

/**
 * Exports utility functions for flag management and event handling.
 */
const StoryProgressUtils = {
  setFlag,
  hasFlag,
  isFlagExpired,
  getAllFlags,
  getFlagsByCategory,
  canActivateFlag,
  registerEventTrigger,
  triggerEvent,
  loadFlags,
  saveFlags,
  initialiseStoryProgress,
  getStoryFlags,
};

export default StoryProgressUtils;

// All functions and StoryProgressUtils object are exported for use in story, quest, and event logic.
// TODO: Expand persistence to include expiry and categories. Add flag removal and advanced dependency logic