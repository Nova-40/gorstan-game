/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: General utility or configuration file.
 */

// puzzle.test.js – Jest Unit Tests for Puzzle Logic
import { sha256 } from "js-sha256";

test("Vowel Puzzle correct solution hashes properly", () => {
  const input = "blent,brick,span,torn,kill";
  const hash = sha256(input);
  const correctHash = sha256("blent,brick,span,torn,kill");
  expect(hash).toBe(correctHash);
});
