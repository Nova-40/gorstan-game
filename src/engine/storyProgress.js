// src/engine/storyProgress.js

const flags = new Set();
const flagTimestamps = {}; // Stores expiry time for flags
const flagDependencies = {}; // Defines dependencies between flags
const categorizedFlags = {
  quest: new Set(),
  story_event: new Set(),
  chapter_progress: new Set(),
};
const eventTriggers = {}; // Stores event handlers for each flag

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
 */
export function loadFlags() {
  const savedFlags = localStorage.getItem('storyFlags');
  if (savedFlags) {
    savedFlags.split(',').forEach(flag => flags.add(flag));
  }
}

/**
 * Saves flags to localStorage (for persistence across sessions).
 */
export function saveFlags() {
  localStorage.setItem('storyFlags', [...flags].join(','));
}

/**
 * Initializes the story flags to their default values.
 */
export function initialiseStoryProgress() {
  const initialFlags = [
    'firstVisit',
    'hasMap',
    'foundArtifact',
    'questCompleted',
  ];

  // Set initial flags
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
