import * as THREE from "three";
import type { CharacterId, CharacterMood } from "../types/mf02";
import { geo, mat, type Disposables } from "./officeProps";

/**
 * Stylized adult characters, prototype visual assets for this
 * evaluation rather than final art. The direction is soft, rounded
 * and warm: readable eyes with catchlights, tidy distinct hairstyles
 * kept clear of the eyes, individual clothing details, and restrained
 * expression driven by mood.
 */

type CastStyle = {
  skin: number;
  skinShade: number;
  hair: number;
  top: number;
  topAccent: number;
  iris: number;
  lip: number;
  hairStyle: "bun" | "short" | "bob" | "crop";
};

const CAST_STYLE: Record<CharacterId, CastStyle> = {
  avery: {
    skin: 0xc08a5e,
    skinShade: 0xa9744b,
    hair: 0x2e2a26,
    top: 0xc96f5a,
    topAccent: 0xb05a46,
    iris: 0x4a2f1d,
    lip: 0x8f4a3c,
    hairStyle: "bun",
  },
  sam: {
    skin: 0xe8bc93,
    skinShade: 0xd2a377,
    hair: 0x6b5636,
    top: 0x77805a,
    topAccent: 0xf2efe6,
    iris: 0x44604f,
    lip: 0x9c5b47,
    hairStyle: "short",
  },
  riley: {
    skin: 0xf2cda8,
    skinShade: 0xdbb287,
    hair: 0x26211d,
    top: 0x51609e,
    topAccent: 0xf2efe6,
    iris: 0x33302c,
    lip: 0xa05c50,
    hairStyle: "bob",
  },
  jordan: {
    skin: 0x8a5a3b,
    skinShade: 0x74482d,
    hair: 0x191715,
    top: 0xc9a24b,
    topAccent: 0x3a3f45,
    iris: 0x2e1d12,
    lip: 0x6e3a2c,
    hairStyle: "crop",
  },
};

const BREATH_PHASE: Record<CharacterId, number> = {
  avery: 0,
  sam: 1400,
  riley: 2900,
  jordan: 4100,
};

export class CharacterRig {
  readonly id: CharacterId;
  readonly group: THREE.Group;
  readonly headGroup: THREE.Group;
  private torso: THREE.Mesh;
  private mouth: THREE.Mesh;
  private browL: THREE.Mesh;
  private browR: THREE.Mesh;
  private mood: CharacterMood = "idle";
  private moodMs = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private standing: boolean;

  constructor(d: Disposables, id: CharacterId, opts: { standing?: boolean } = {}) {
    this.id = id;
    this.standing = opts.standing ?? false;
    const style = CAST_STYLE[id];
    const g = new THREE.Group();
    this.group = g;

    const skinMat = mat(d, style.skin, { rough: 0.55 });
    const skinShadeMat = mat(d, style.skinShade, { rough: 0.6 });
    const topMat = mat(d, style.top, { rough: 0.85 });
    const accentMat = mat(d, style.topAccent, { rough: 0.8 });
    const hairMat = mat(d, style.hair, { rough: 0.62 });

    const seatLift = this.standing ? 0.42 : 0;

    /* torso with soft shoulders */
    const torsoGeo = geo(d, new THREE.CapsuleGeometry(0.165, 0.24, 6, 14));
    this.torso = new THREE.Mesh(torsoGeo, topMat);
    this.torso.castShadow = true;
    this.torso.position.y = 0.72 + seatLift;
    g.add(this.torso);

    /* collar detail: a slim ring at the neckline in the accent color */
    const collar = new THREE.Mesh(
      geo(d, new THREE.TorusGeometry(0.075, 0.016, 8, 18)),
      accentMat,
    );
    collar.position.y = 0.95 + seatLift;
    collar.rotation.x = Math.PI / 2 - 0.18;
    g.add(collar);

    /* legs only when standing (seated legs are hidden by the table) */
    if (this.standing) {
      const legGeo = geo(d, new THREE.CapsuleGeometry(0.06, 0.4, 4, 8));
      const legMat = mat(d, 0x3c4248, { rough: 0.9 });
      for (const off of [-0.08, 0.08]) {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.castShadow = true;
        leg.position.set(off, 0.3, 0);
        g.add(leg);
      }
    }

    /* arms resting forward */
    const armGeo = geo(d, new THREE.CapsuleGeometry(0.048, 0.3, 4, 10));
    const handGeo = geo(d, new THREE.SphereGeometry(0.042, 10, 8));
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(armGeo, topMat);
      arm.castShadow = true;
      arm.position.set(side * 0.19, 0.68 + seatLift, -0.12);
      arm.rotation.x = this.standing ? -0.25 : -0.95;
      arm.rotation.z = side * 0.18;
      g.add(arm);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.castShadow = true;
      hand.position.set(
        side * 0.23,
        this.standing ? 0.52 : 0.78,
        this.standing ? -0.05 : -0.33,
      );
      g.add(hand);
    }

    /* head */
    const head = new THREE.Group();
    this.headGroup = head;
    head.position.y = 1.13 + seatLift;
    g.add(head);

    const neck = new THREE.Mesh(
      geo(d, new THREE.CylinderGeometry(0.048, 0.058, 0.1, 12)),
      skinMat,
    );
    neck.position.y = -0.13;
    head.add(neck);

    const skull = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.118, 22, 18)), skinMat);
    skull.scale.set(0.94, 1.06, 0.97);
    skull.castShadow = true;
    head.add(skull);

    /* fuller jaw and chin */
    const jaw = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.095, 18, 14)), skinMat);
    jaw.scale.set(0.92, 0.78, 0.9);
    jaw.position.set(0, -0.052, 0.012);
    head.add(jaw);

    /* ears */
    const earGeo = geo(d, new THREE.SphereGeometry(0.023, 10, 8));
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(earGeo, skinShadeMat);
      ear.scale.set(0.6, 1, 0.8);
      ear.position.set(side * 0.108, -0.002, 0.004);
      head.add(ear);
    }

    /* eyes: soft almonds with an iris and a catchlight */
    const whiteMat2 = mat(d, 0xf8f5ee, { rough: 0.3 });
    const irisMat = mat(d, style.iris, { rough: 0.25 });
    const glintMat = mat(d, 0xffffff, { rough: 0.15 });
    const eyeGeo = geo(d, new THREE.SphereGeometry(0.023, 12, 10));
    const irisGeo = geo(d, new THREE.SphereGeometry(0.0115, 10, 8));
    const glintGeo = geo(d, new THREE.SphereGeometry(0.0042, 6, 6));
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, whiteMat2);
      eye.scale.set(1.12, 0.88, 0.62);
      eye.position.set(side * 0.047, 0.014, 0.098);
      head.add(eye);
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(side * 0.047, 0.012, 0.111);
      head.add(iris);
      const glint = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(side * 0.047 + 0.006, 0.019, 0.119);
      head.add(glint);
    }

    /* brows: rounded, gently angled */
    const browGeo = geo(d, new THREE.CapsuleGeometry(0.0062, 0.036, 4, 8));
    const browMat = mat(d, style.hair, { rough: 0.7 });
    this.browL = new THREE.Mesh(browGeo, browMat);
    this.browL.rotation.set(0, 0, Math.PI / 2 - 0.09);
    this.browL.position.set(-0.047, 0.058, 0.105);
    head.add(this.browL);
    this.browR = new THREE.Mesh(browGeo, browMat);
    this.browR.rotation.set(0, 0, Math.PI / 2 + 0.09);
    this.browR.position.set(0.047, 0.058, 0.105);
    head.add(this.browR);

    /* nose */
    const nose = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.016, 10, 8)), skinShadeMat);
    nose.scale.set(0.72, 1.1, 0.72);
    nose.position.set(0, -0.02, 0.114);
    head.add(nose);

    /* mouth: a soft bar that opens while speaking */
    const mouthGeo = geo(d, new THREE.CapsuleGeometry(0.0075, 0.03, 4, 8));
    const mouthMat = mat(d, style.lip, { rough: 0.5 });
    this.mouth = new THREE.Mesh(mouthGeo, mouthMat);
    this.mouth.rotation.z = Math.PI / 2;
    this.mouth.position.set(0, -0.062, 0.104);
    head.add(this.mouth);

    /* hair: four distinct tidy styles, always clear of the eyes */
    const hs = style.hairStyle;
    if (hs === "bun") {
      const cap = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.124, 20, 16)), hairMat);
      cap.scale.set(1.0, 0.96, 1.02);
      cap.position.set(0, 0.048, -0.018);
      head.add(cap);
      const bun = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.058, 12, 10)), hairMat);
      bun.scale.set(1, 0.92, 1);
      bun.position.set(0, 0.132, -0.098);
      head.add(bun);
      const tie = new THREE.Mesh(
        geo(d, new THREE.TorusGeometry(0.032, 0.008, 6, 14)),
        mat(d, 0xb05a46, { rough: 0.7 }),
      );
      tie.position.set(0, 0.108, -0.082);
      tie.rotation.x = 0.9;
      head.add(tie);
    } else if (hs === "short") {
      const cap = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.122, 20, 16)), hairMat);
      cap.scale.set(0.98, 0.78, 0.96);
      cap.position.set(0, 0.072, -0.016);
      head.add(cap);
      /* side-parted sweep above the forehead */
      const sweep = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.05, 12, 10)), hairMat);
      sweep.scale.set(1.5, 0.42, 0.9);
      sweep.position.set(0.028, 0.106, 0.062);
      sweep.rotation.z = -0.14;
      head.add(sweep);
    } else if (hs === "bob") {
      const cap = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.128, 20, 16)), hairMat);
      cap.scale.set(1.05, 1.0, 1.04);
      cap.position.set(0, 0.04, -0.026);
      head.add(cap);
      /* straight fringe sitting well above the brows */
      const fringe = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.052, 12, 10)), hairMat);
      fringe.scale.set(1.75, 0.4, 0.8);
      fringe.position.set(0, 0.108, 0.066);
      head.add(fringe);
      const lockGeo = geo(d, new THREE.CapsuleGeometry(0.034, 0.1, 4, 10));
      for (const side of [-1, 1]) {
        const lock = new THREE.Mesh(lockGeo, hairMat);
        lock.position.set(side * 0.112, -0.04, -0.012);
        lock.rotation.z = side * -0.08;
        head.add(lock);
      }
    } else {
      const cap = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.12, 20, 16)), hairMat);
      cap.scale.set(0.99, 0.66, 0.96);
      cap.position.set(0, 0.084, -0.012);
      head.add(cap);
      /* clean hairline band for the cropped cut */
      const band = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.045, 10, 8)), hairMat);
      band.scale.set(1.6, 0.3, 0.7);
      band.position.set(0, 0.108, 0.06);
      head.add(band);
    }
  }

  setMood(mood: CharacterMood) {
    if (this.mood !== mood) {
      this.mood = mood;
      this.moodMs = 0;
    }
  }

  getMood(): CharacterMood {
    return this.mood;
  }

  /** Point the head toward a world position. */
  lookToward(world: THREE.Vector3 | null) {
    if (!world) {
      this.targetYaw = 0;
      this.targetPitch = 0;
      return;
    }
    const local = this.group.worldToLocal(world.clone());
    local.sub(this.headGroup.position);
    this.targetYaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z), -0.85, 0.85);
    this.targetPitch = THREE.MathUtils.clamp(
      -Math.atan2(local.y, Math.hypot(local.x, local.z)),
      -0.35,
      0.35,
    );
  }

  update(dt: number, realMs: number, reducedMotion: boolean) {
    this.moodMs += dt;
    const head = this.headGroup;

    /* breathing idle, locked 5500 ms period */
    if (!reducedMotion) {
      const phase = ((realMs + BREATH_PHASE[this.id]) % 5500) / 5500;
      const breath = Math.sin(phase * Math.PI * 2);
      this.torso.scale.y = 1 + breath * 0.012;
      head.position.y = (this.standing ? 1.55 : 1.13) + breath * 0.004;
    }

    /* head orientation eases toward the target */
    const ease = reducedMotion ? 1 : Math.min(1, dt / 180);
    let yaw = this.targetYaw;
    let pitch = this.targetPitch;
    let mouthOpen = 0.9;
    let browLift = 0;

    switch (this.mood) {
      case "speaking":
        mouthOpen = reducedMotion
          ? 2.6
          : 1.6 + Math.abs(Math.sin(realMs / 118)) * 2.4;
        if (!reducedMotion) pitch += Math.sin(realMs / 460) * 0.03;
        break;
      case "interrupted":
        mouthOpen = 0.6;
        browLift = 0.02;
        break;
      case "attention-shift":
        if (!reducedMotion) {
          yaw += Math.sin(this.moodMs / 700) * 0.3;
        }
        break;
      case "settled": {
        const t = Math.min(1, this.moodMs / 620);
        if (!reducedMotion) pitch += Math.sin(t * Math.PI) * 0.16;
        break;
      }
      case "unresolved":
        yaw += this.id === "avery" || this.id === "jordan" ? 0.35 : -0.35;
        break;
      default:
        break;
    }

    head.rotation.y += (yaw - head.rotation.y) * ease;
    head.rotation.x += (pitch - head.rotation.x) * ease;
    this.mouth.scale.x +=
      (mouthOpen - this.mouth.scale.x) * (reducedMotion ? 1 : Math.min(1, dt / 70));
    const browY = 0.058 + browLift;
    this.browL.position.y += (browY - this.browL.position.y) * ease;
    this.browR.position.y += (browY - this.browR.position.y) * ease;
  }
}
