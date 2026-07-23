import type { Outcome, Strength } from "../types/mf02";

/**
 * Small synthesized soundscape. Everything is generated locally, starts
 * only after a user gesture, respects the global sound setting and shuts
 * down on exit. Sound is atmosphere only; every meaningful sound has a
 * visible text equivalent in the game UI.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let roomTone: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
let printer: { src: AudioBufferSourceNode; gain: GainNode; lfo: OscillatorNode } | null =
  null;
let muted = true;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

/** Call from a real user gesture before anything can play. */
export function unlockAudio() {
  const c = getContext();
  if (c && c.state === "suspended") {
    void c.resume().catch(() => undefined);
  }
}

export function setAudioMuted(next: boolean) {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.05);
  }
}

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  return buf;
}

export function startRoomTone() {
  const c = getContext();
  if (!c || !master || roomTone) return;
  try {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 2.5);
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 320;
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.018, c.currentTime, 1.2);
    src.connect(filter).connect(gain).connect(master);
    src.start();
    roomTone = { src, gain };
  } catch {
    roomTone = null;
  }
}

export function stopRoomTone() {
  if (!roomTone || !ctx) return;
  try {
    roomTone.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    roomTone.src.stop(ctx.currentTime + 0.8);
  } catch {
    /* already stopped */
  }
  roomTone = null;
}

export function startPrinter() {
  const c = getContext();
  if (!c || !master || printer) return;
  try {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 1.2);
    src.loop = true;
    const band = c.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 950;
    band.Q.value = 2.2;
    const gain = c.createGain();
    gain.gain.value = 0.012;
    const lfo = c.createOscillator();
    lfo.type = "square";
    lfo.frequency.value = 6.5;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.008;
    lfo.connect(lfoGain).connect(gain.gain);
    src.connect(band).connect(gain).connect(master);
    src.start();
    lfo.start();
    printer = { src, gain, lfo };
  } catch {
    printer = null;
  }
}

export function stopPrinter() {
  if (!printer || !ctx) return;
  try {
    printer.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    printer.src.stop(ctx.currentTime + 0.5);
    printer.lfo.stop(ctx.currentTime + 0.5);
  } catch {
    /* already stopped */
  }
  printer = null;
}

function blip(freq: number, peak: number, decay: number, type: OscillatorType = "sine") {
  const c = getContext();
  if (!c || !master) return;
  try {
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(peak, c.currentTime, 0.012);
    gain.gain.setTargetAtTime(0, c.currentTime + 0.05, decay);
    osc.connect(gain).connect(master);
    osc.start();
    osc.stop(c.currentTime + decay * 6 + 0.2);
  } catch {
    /* context torn down */
  }
}

/** Quiet cue when another participant starts a turn. */
export function playTurnCue() {
  blip(660, 0.012, 0.05);
}

/** Send sound varies subtly with strength. */
export function playSend(strength: Strength) {
  if (strength === "light") blip(420, 0.03, 0.06, "triangle");
  else if (strength === "steady") blip(320, 0.045, 0.09, "triangle");
  else blip(240, 0.06, 0.13, "triangle");
}

export function playConsequence(outcome: Outcome) {
  if (outcome === "crowded") {
    blip(196, 0.028, 0.1, "sawtooth");
  } else if (outcome === "faded") {
    blip(300, 0.014, 0.12);
  }
}

/** Only after demonstrated skill. */
export function playCompletion() {
  blip(523.25, 0.035, 0.16);
  window.setTimeout(() => blip(659.25, 0.03, 0.2), 140);
}

export function disposeAudio() {
  stopRoomTone();
  stopPrinter();
  if (ctx) {
    void ctx.close().catch(() => undefined);
  }
  ctx = null;
  master = null;
}
