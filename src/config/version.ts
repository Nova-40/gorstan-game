/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  Version tracking for deployment verification
*/

export const BUILD_VERSION = "Beta 2";
export const BUILD_DATE = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
export const BUILD_TIMESTAMP = "2025-08-12T20:00:00Z"; // Beta 2 with Librarian and enhanced lore
export const COMMIT_HASH =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";

export const getVersionString = () =>
  `build: ${BUILD_VERSION} | ${BUILD_DATE} | ${COMMIT_HASH}`;
export const getShortVersion = () => `${BUILD_VERSION}`;
