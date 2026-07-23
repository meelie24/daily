import type { Outcome, Strength } from "../types/mf02";

/**
 * Subtle, optional haptics. Where vibration is unavailable or turned
 * off, the same information is always on screen, so nothing is lost.
 */

let enabled = false;

export function setHapticsEnabled(next: boolean) {
  enabled = next;
}

function buzz(pattern: number | number[]) {
  if (!enabled) return;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* not supported */
  }
}

export function hapticSend(strength: Strength) {
  if (strength === "light") buzz(8);
  else if (strength === "steady") buzz(14);
  else buzz(22);
}

export function hapticConsequence(outcome: Outcome) {
  if (outcome === "crowded") buzz([10, 70, 10]);
}
