import * as THREE from "three";
import type { CharacterId, SceneSnapshot } from "../types/mf02";
import { CharacterRig } from "./characterRig";
import {
  buildOffice,
  disposeAll,
  makeDisposables,
  pulseTexture,
} from "./officeProps";

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

const FOCUS = new THREE.Vector3(0, 1.02, -0.62);
const CAMERA_POS = new THREE.Vector3(0, 1.34, 1.42);
const USER_ORIGIN = new THREE.Vector3(0, 0.95, 0.7);
const JORDAN_DOOR = new THREE.Vector3(2.75, 0, -0.45);
const JORDAN_SPOT = new THREE.Vector3(0.9, 0, -1.36);

const STRENGTH_COLOR = { light: 0x74cdc9, steady: 0x0b8fa8, strong: 0x007a7e };
const OUTCOME_COLOR = { settled: 0x35b5ae, crowded: 0x8d949a, faded: 0xd8cdb6 };

type Pulse = {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  from: THREE.Vector3;
  startMs: number;
  lifeMs: number;
  active: boolean;
};

export type SceneHandle = { dispose: () => void };

export function createOfficeScene(
  container: HTMLElement,
  opts: {
    getSnapshot: () => SceneSnapshot;
    isReducedMotion: () => boolean;
  },
): SceneHandle | null {
  if (!webglAvailable()) return null;

  const d = makeDisposables();
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch {
    disposeAll(d);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xf3ece0);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3ece0, 7, 12);

  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 20);
  camera.position.copy(CAMERA_POS);
  camera.lookAt(0, 0.93, -1.3);

  /* lights: warm white room light plus window daylight */
  const hemi = new THREE.HemisphereLight(0xfff6e6, 0xc9b190, 0.95);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1dc, 1.25);
  key.position.set(1.4, 2.7, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3.4;
  key.shadow.camera.right = 3.4;
  key.shadow.camera.top = 3.5;
  key.shadow.camera.bottom = -1;
  scene.add(key);
  const windowLight = new THREE.DirectionalLight(0xdcecf4, 0.55);
  windowLight.position.set(-0.5, 2.1, -3);
  scene.add(windowLight);
  /* soft fill from the viewer's side keeps faces readable */
  const faceFill = new THREE.DirectionalLight(0xfff7ea, 0.4);
  faceFill.position.set(0, 1.6, 3.2);
  scene.add(faceFill);

  const office = buildOffice(d);
  scene.add(office.group);

  /* the cast */
  const rigs = new Map<CharacterId, CharacterRig>();
  const place = (
    id: CharacterId,
    x: number,
    z: number,
    standing = false,
  ): CharacterRig => {
    const rig = new CharacterRig(d, id, { standing });
    rig.group.position.set(x, 0, z);
    rig.group.rotation.y = Math.atan2(0 - x, 0.62 - z);
    scene.add(rig.group);
    rigs.set(id, rig);
    return rig;
  };
  place("avery", -0.72, -1.26);
  place("sam", 0.05, -1.42);
  place("riley", 0.68, -1.24);
  const jordan = place("jordan", JORDAN_DOOR.x, JORDAN_DOOR.z, true);
  jordan.group.visible = false;

  /* conversation pulses */
  const pulseTex = pulseTexture(d);
  const pulses: Pulse[] = [];
  for (let i = 0; i < 8; i++) {
    const material = new THREE.SpriteMaterial({
      map: pulseTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    d.materials.push(material);
    const sprite = new THREE.Sprite(material);
    sprite.scale.setScalar(0.16);
    sprite.visible = false;
    scene.add(sprite);
    pulses.push({
      sprite,
      material,
      from: new THREE.Vector3(),
      startMs: 0,
      lifeMs: 1100,
      active: false,
    });
  }
  const takePulse = (): Pulse | null => pulses.find((p) => !p.active) ?? null;

  /* user turn sprite + consequence flash */
  const userMat = new THREE.SpriteMaterial({
    map: pulseTex,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  d.materials.push(userMat);
  const userSprite = new THREE.Sprite(userMat);
  userSprite.visible = false;
  scene.add(userSprite);

  const flashMat = new THREE.SpriteMaterial({
    map: pulseTex,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  d.materials.push(flashMat);
  const flash = new THREE.Sprite(flashMat);
  flash.position.copy(FOCUS);
  flash.visible = false;
  scene.add(flash);

  /* hold glow near the user's edge of the table */
  const holdMat = new THREE.SpriteMaterial({
    map: pulseTex,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    color: 0x0b8fa8,
  });
  d.materials.push(holdMat);
  const holdGlow = new THREE.Sprite(holdMat);
  holdGlow.position.copy(USER_ORIGIN);
  holdGlow.visible = false;
  scene.add(holdGlow);

  const speakerHead = (id: CharacterId): THREE.Vector3 => {
    const rig = rigs.get(id)!;
    const v = new THREE.Vector3();
    rig.headGroup.getWorldPosition(v);
    return v;
  };

  let lastSpawnMs = -9999;
  let lastSpeaker: CharacterId | null = null;
  let paperCycle = 0;
  let disposed = false;
  let rafId: number | null = null;
  let lastReal = performance.now();

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  ro?.observe(container);

  const frame = (now: number) => {
    if (disposed) return;
    const dt = Math.min(64, now - lastReal);
    lastReal = now;
    const snap = opts.getSnapshot();
    const reduced = opts.isReducedMotion();
    const worldMs = snap.worldMs;

    /* character moods and gaze */
    for (const [id, rig] of rigs) {
      rig.setMood(snap.moods[id]);
      const mood = snap.moods[id];
      if (mood === "speaking") {
        /* while Jordan is coming in, speakers turn to bring them in */
        if (snap.phase === "room-change" && snap.jordanEntry < 1) {
          rig.lookToward(speakerHead("jordan"));
        } else {
          rig.lookToward(FOCUS);
        }
      } else if (mood === "interrupted") {
        rig.lookToward(CAMERA_POS);
      } else if (snap.userTurn) {
        rig.lookToward(CAMERA_POS);
      } else if (snap.activeSpeaker && snap.activeSpeaker !== id) {
        rig.lookToward(speakerHead(snap.activeSpeaker));
      } else if (mood === "attention-shift") {
        rig.lookToward(FOCUS);
      } else {
        rig.lookToward(null);
      }
      rig.update(dt, now, reduced);
    }

    /* Jordan's entrance */
    if (snap.jordanPresent) {
      jordan.group.visible = true;
      const t = reduced ? 1 : snap.jordanEntry;
      const eased = 1 - Math.pow(1 - t, 2);
      jordan.group.position.lerpVectors(JORDAN_DOOR, JORDAN_SPOT, eased);
      if (!reduced && t < 1) {
        jordan.group.position.y = Math.abs(Math.sin(t * Math.PI * 5)) * 0.02;
      } else {
        jordan.group.position.y = 0;
      }
      jordan.group.rotation.y = Math.atan2(
        0 - jordan.group.position.x,
        -0.62 - jordan.group.position.z,
      );
      office.door.rotation.y = -0.55 - Math.sin(Math.min(1, t * 1.6) * Math.PI) * 0.5;
    } else {
      jordan.group.visible = false;
      office.door.rotation.y = -0.55;
    }

    /* conversation pulses from the active speaker */
    if (snap.activeSpeaker) {
      if (snap.activeSpeaker !== lastSpeaker) lastSpawnMs = -9999;
      if (!reduced && worldMs - lastSpawnMs > 700 && !snap.paused) {
        const p = takePulse();
        if (p) {
          p.active = true;
          p.startMs = worldMs;
          p.from.copy(speakerHead(snap.activeSpeaker));
          p.material.color.setHex(0xfff3d8);
          lastSpawnMs = worldMs;
        }
      }
    }
    lastSpeaker = snap.activeSpeaker;

    for (const p of pulses) {
      if (!p.active) continue;
      const t = (worldMs - p.startMs) / p.lifeMs;
      if (t >= 1 || t < 0) {
        p.active = false;
        p.sprite.visible = false;
        continue;
      }
      p.sprite.visible = true;
      p.sprite.position.lerpVectors(p.from, FOCUS, t);
      p.sprite.scale.setScalar(0.1 + t * 0.12);
      p.material.opacity = 0.5 * Math.sin(Math.PI * t);
    }

    /* reduced motion: a steady glow at the focus instead of travel */
    if (reduced) {
      for (const p of pulses) {
        p.active = false;
        p.sprite.visible = false;
      }
      const speaking = Boolean(snap.activeSpeaker);
      flash.visible = true;
      flashMat.color.setHex(0xfff3d8);
      flashMat.opacity = speaking ? 0.4 : 0;
      flash.scale.setScalar(0.3);
    }

    /* live hold feedback near the user's seat */
    if (snap.hold) {
      holdGlow.visible = true;
      holdMat.color.setHex(STRENGTH_COLOR[snap.hold.strength]);
      holdMat.opacity = 0.28 + snap.hold.progress * 0.3;
      holdGlow.scale.setScalar(0.14 + snap.hold.progress * 0.2);
    } else {
      holdGlow.visible = false;
    }

    /* released user turn traveling into the exchange */
    if (snap.userTurn) {
      const t = snap.userTurn.progress;
      userSprite.visible = true;
      userMat.color.setHex(STRENGTH_COLOR[snap.userTurn.strength]);
      if (reduced) {
        userSprite.position.copy(FOCUS);
        userMat.opacity = 0.7;
      } else if (snap.userTurn.outcome === "faded" && t > 0.75) {
        const over = (t - 0.75) / 0.25;
        userSprite.position.lerpVectors(FOCUS, new THREE.Vector3(0, 1.5, -2.4), over);
        userMat.opacity = 0.6 * (1 - over);
      } else {
        userSprite.position.lerpVectors(USER_ORIGIN, FOCUS, 1 - Math.pow(1 - t, 2));
        userMat.opacity = 0.75;
      }
      const sc =
        snap.userTurn.strength === "light"
          ? 0.13
          : snap.userTurn.strength === "steady"
            ? 0.19
            : 0.26;
      userSprite.scale.setScalar(sc);
      if (t > 0.82 && snap.userTurn.outcome !== "faded" && !reduced) {
        const ft = (t - 0.82) / 0.18;
        flash.visible = true;
        flashMat.color.setHex(OUTCOME_COLOR[snap.userTurn.outcome]);
        flashMat.opacity = 0.5 * Math.sin(Math.PI * Math.min(1, ft));
        flash.scale.setScalar(0.3 + ft * 0.4);
      }
    } else {
      userSprite.visible = false;
      if (!reduced) {
        flashMat.opacity = Math.max(0, flashMat.opacity - dt / 400);
        if (flashMat.opacity <= 0.01) flash.visible = false;
      }
    }

    /* printer */
    if (snap.printerOn) {
      office.printerLight.color.setHex(0x2fa66a);
      office.printerLight.emissive.setHex(0x2fa66a);
      office.printerLight.emissiveIntensity = reduced
        ? 0.9
        : 0.5 + Math.abs(Math.sin(now / 320)) * 0.7;
      if (reduced) {
        office.printerPaper.scale.z = 1;
        office.printerPaper.position.x = -2.3;
      } else {
        paperCycle = (paperCycle + dt) % 1500;
        const t = paperCycle / 1500;
        office.printerPaper.scale.z = 0.05 + Math.min(1, t * 1.4) * 0.95;
        office.printerPaper.position.x = -2.44 + Math.min(1, t * 1.4) * 0.14;
      }
    } else {
      office.printerLight.color.setHex(0x9aa2a6);
      office.printerLight.emissive.setHex(0x9aa2a6);
      office.printerLight.emissiveIntensity = 0.15;
      office.printerPaper.scale.z = 0.01;
    }

    /* calendar / call status */
    if (snap.callSoon) {
      office.callDot.color.setHex(0xc57800);
      office.callDot.emissive.setHex(0xc57800);
      office.callDot.emissiveIntensity = 0.9;
    } else {
      office.callDot.color.setHex(0xb9c0c3);
      office.callDot.emissive.setHex(0xb9c0c3);
      office.callDot.emissiveIntensity = 0.2;
    }

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  };
  rafId = requestAnimationFrame(frame);

  return {
    dispose() {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      ro?.disconnect();
      disposeAll(d);
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
