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

// (c) Geoff Webster 2025

import type { Room } from "../types/Room";

interface RoomLoader {
  (): Promise<Room>;
}

interface LazyRoomRegistry {
  [roomId: string]: RoomLoader;
}

/**
 * Optimized lazy-loading room registry
 * Only loads room modules when actually needed
 */
const lazyRoomRegistry: LazyRoomRegistry = {
  // Core intro rooms (always loaded for performance)
  controlnexus: () =>
    import("../rooms/introZone_controlnexus").then((m) => m.default),
  controlroom: () =>
    import("../rooms/introZone_controlroom").then((m) => m.default),
  crossing: () => import("../rooms/introZone_crossing").then((m) => m.default),
  hiddenlab: () =>
    import("../rooms/introZone_hiddenlab").then((m) => m.default),

  // Elfhame Zone - lazy loaded
  elfhame: () => import("../rooms/elfhameZone_elfhame").then((m) => m.default),
  faeglade: () =>
    import("../rooms/elfhameZone_faeglade").then((m) => m.default),
  faelake: () => import("../rooms/elfhameZone_faelake").then((m) => m.default),
  faelakenorthshore: () =>
    import("../rooms/elfhameZone_faelakenorthshore").then((m) => m.default),
  faepalacedungeons: () =>
    import("../rooms/elfhameZone_faepalacedungeons").then((m) => m.default),
  faepalacemainhall: () =>
    import("../rooms/elfhameZone_faepalacemainhall").then((m) => m.default),
  faepalacerhianonsroom: () =>
    import("../rooms/elfhameZone_faepalacerhianonsroom").then((m) => m.default),

  // Glitch Zone - lazy loaded
  datavoid: () => import("../rooms/glitchZone_datavoid").then((m) => m.default),
  failure: () => import("../rooms/glitchZone_failure").then((m) => m.default),
  glitchinguniverse: () =>
    import("../rooms/glitchZone_glitchinguniverse").then((m) => m.default),
  issuesdetected: () =>
    import("../rooms/glitchZone_issuesdetected").then((m) => m.default),
  moreissues: () =>
    import("../rooms/glitchZone_moreissues").then((m) => m.default),
  ravenchamber: () =>
    import("../rooms/glitchZone_ravenchamber").then((m) => m.default),

  // Gorstan Zone - lazy loaded
  carronspire: () =>
    import("../rooms/gorstanZone_carronspire").then((m) => m.default),
  gorstanhub: () =>
    import("../rooms/gorstanZone_gorstanhub").then((m) => m.default),
  gorstanvillage: () =>
    import("../rooms/gorstanZone_gorstanvillage").then((m) => m.default),
  torridon: () =>
    import("../rooms/gorstanZone_torridon").then((m) => m.default),
  torridoninn: () =>
    import("../rooms/gorstanZone_torridoninn").then((m) => m.default),
  torridoninthepast: () =>
    import("../rooms/gorstanZone_torridoninthepast").then((m) => m.default),

  // Lattice Zone - lazy loaded
  hiddenlibrary: () =>
    import("../rooms/latticeZone_hiddenlibrary").then((m) => m.default),
  lattice: () => import("../rooms/latticeZone_lattice").then((m) => m.default),
  latticehub: () =>
    import("../rooms/latticeZone_latticehub").then((m) => m.default),
  latticelibrary: () =>
    import("../rooms/latticeZone_latticelibrary").then((m) => m.default),
  latticeobservationentrance: () =>
    import("../rooms/latticeZone_latticeobservationentrance").then(
      (m) => m.default,
    ),
  latticeobservatory: () =>
    import("../rooms/latticeZone_latticeobservatory").then((m) => m.default),
  latticespire: () =>
    import("../rooms/latticeZone_latticespire").then((m) => m.default),
  libraryofnine: () =>
    import("../rooms/latticeZone_libraryofnine").then((m) => m.default),

  // London Zone - lazy loaded
  cafeoffice: () =>
    import("../rooms/londonZone_cafeoffice").then((m) => m.default),
  dalesapartment: () =>
    import("../rooms/londonZone_dalesapartment").then((m) => m.default),
  findlaters: () =>
    import("../rooms/londonZone_findlaters").then((m) => m.default),
  findlaterscornercoffeeshop: () =>
    import("../rooms/londonZone_findlaterscornercoffeeshop").then(
      (m) => m.default,
    ),
  londonhub: () =>
    import("../rooms/londonZone_londonhub").then((m) => m.default),
  stkatherinesdock: () =>
    import("../rooms/londonZone_stkatherinesdock").then((m) => m.default),
  trentpark: () =>
    import("../rooms/londonZone_trentpark").then((m) => m.default),

  // Other zones continue...
};

// Room cache for loaded rooms
const roomCache = new Map<string, Room>();
const loadingPromises = new Map<string, Promise<Room>>();

/**
 * Performance metrics
 */
interface LoadingMetrics {
  cacheHits: number;
  cacheMisses: number;
  loadTimes: Record<string, number>;
  totalLoads: number;
}

const metrics: LoadingMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  loadTimes: {},
  totalLoads: 0,
};

/**
 * Load a room with caching and performance optimization
 */
export async function loadOptimizedRoom(roomId: string): Promise<Room | null> {
  const startTime = performance.now();

  // Check cache first
  if (roomCache.has(roomId)) {
    metrics.cacheHits++;
    console.log(`[OptimizedRoomLoader] Cache hit for room: ${roomId}`);
    return roomCache.get(roomId)!;
  }

  // Check if already loading
  if (loadingPromises.has(roomId)) {
    console.log(`[OptimizedRoomLoader] Already loading room: ${roomId}`);
    return loadingPromises.get(roomId)!;
  }

  // Get the loader
  const loader = lazyRoomRegistry[roomId];
  if (!loader) {
    console.warn(`[OptimizedRoomLoader] No loader found for room: ${roomId}`);
    return null;
  }

  metrics.cacheMisses++;
  metrics.totalLoads++;

  // Create loading promise
  const loadingPromise = loader()
    .then((room) => {
      const loadTime = performance.now() - startTime;
      metrics.loadTimes[roomId] = loadTime;

      console.log(
        `[OptimizedRoomLoader] Loaded room ${roomId} in ${loadTime.toFixed(2)}ms`,
      );

      // Cache the room
      roomCache.set(roomId, room);

      // Remove from loading promises
      loadingPromises.delete(roomId);

      return room;
    })
    .catch((error) => {
      console.error(
        `[OptimizedRoomLoader] Failed to load room ${roomId}:`,
        error,
      );
      loadingPromises.delete(roomId);
      throw error;
    });

  // Store the loading promise
  loadingPromises.set(roomId, loadingPromise);

  return loadingPromise;
}

/**
 * Preload critical rooms for faster access
 */
export async function preloadCriticalRooms(): Promise<void> {
  const criticalRooms = [
    "controlnexus",
    "controlroom",
    "crossing",
    "hiddenlab",
  ];

  console.log("[OptimizedRoomLoader] Preloading critical rooms...");

  const preloadPromises = criticalRooms.map((roomId) =>
    loadOptimizedRoom(roomId).catch((error) => {
      console.warn(`[OptimizedRoomLoader] Failed to preload ${roomId}:`, error);
    }),
  );

  await Promise.all(preloadPromises);
  console.log("[OptimizedRoomLoader] Critical rooms preloaded");
}

/**
 * Preload adjacent rooms for smoother navigation
 */
export async function preloadAdjacentRooms(
  currentRoomId: string,
): Promise<void> {
  const currentRoom = roomCache.get(currentRoomId);
  if (!currentRoom?.exits) {return;}

  const adjacentRoomIds = Object.values(currentRoom.exits).filter(
    Boolean,
  ) as string[];

  // Load adjacent rooms in background
  adjacentRoomIds.forEach((roomId) => {
    if (!roomCache.has(roomId) && !loadingPromises.has(roomId)) {
      loadOptimizedRoom(roomId).catch((error) => {
        console.debug(
          `[OptimizedRoomLoader] Background load failed for ${roomId}:`,
          error,
        );
      });
    }
  });
}

/**
 * Get performance metrics
 */
export function getLoadingMetrics(): LoadingMetrics {
  return { ...metrics };
}

/**
 * Clear cache (useful for development)
 */
export function clearRoomCache(): void {
  roomCache.clear();
  loadingPromises.clear();
  console.log("[OptimizedRoomLoader] Cache cleared");
}

/**
 * Get all available room IDs
 */
export function getAvailableRoomIds(): string[] {
  return Object.keys(lazyRoomRegistry);
}

/**
 * Check if room is available without loading it
 */
export function isRoomAvailable(roomId: string): boolean {
  return roomId in lazyRoomRegistry;
}

/**
 * Get cache status
 */
export function getCacheStatus(): {
  cachedRooms: string[];
  loadingRooms: string[];
  hitRate: number;
} {
  const hitRate =
    metrics.totalLoads > 0
      ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100
      : 0;

  return {
    cachedRooms: Array.from(roomCache.keys()),
    loadingRooms: Array.from(loadingPromises.keys()),
    hitRate: Math.round(hitRate * 100) / 100,
  };
}
