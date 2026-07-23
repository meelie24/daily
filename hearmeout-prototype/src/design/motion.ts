/** Locked motion grammar, mirrored for scripted animation. */
export const motion = {
  enterMs: 320,
  exitMs: 280,
  overlayMs: 300,
  idleBreathMs: 5500,
  clarityPulseMs: 1200,
  curve: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/** Ease matching --motion-curve closely enough for JS-driven motion. */
export function easeOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}
