import * as THREE from "three";

/**
 * Shared geometry, material and prop builders for the office scene.
 * Everything created here is registered for disposal.
 */

export type Disposables = {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
};

export function makeDisposables(): Disposables {
  return { geometries: [], materials: [], textures: [] };
}

export function disposeAll(d: Disposables) {
  for (const g of d.geometries) g.dispose();
  for (const m of d.materials) m.dispose();
  for (const t of d.textures) t.dispose();
  d.geometries.length = 0;
  d.materials.length = 0;
  d.textures.length = 0;
}

export function mat(
  d: Disposables,
  color: number,
  opts: { rough?: number; emissive?: number; emissiveIntensity?: number } = {},
): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.82,
    metalness: 0.02,
  });
  if (opts.emissive !== undefined) {
    m.emissive = new THREE.Color(opts.emissive);
    m.emissiveIntensity = opts.emissiveIntensity ?? 1;
  }
  d.materials.push(m);
  return m;
}

export function geo<T extends THREE.BufferGeometry>(d: Disposables, g: T): T {
  d.geometries.push(g);
  return g;
}

export function box(
  d: Disposables,
  w: number,
  h: number,
  depth: number,
  material: THREE.Material,
): THREE.Mesh {
  const m = new THREE.Mesh(geo(d, new THREE.BoxGeometry(w, h, depth)), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Soft radial dot texture used by conversation pulses. */
export function pulseTexture(d: Disposables): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  d.textures.push(tex);
  return tex;
}

function skyTexture(d: Disposables): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "#cfe4ee");
  grad.addColorStop(0.55, "#e9f1ef");
  grad.addColorStop(1, "#f7efe0");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 128);
  g.fillStyle = "rgba(255,255,255,0.75)";
  g.beginPath();
  g.ellipse(18, 34, 14, 7, 0, 0, Math.PI * 2);
  g.ellipse(40, 52, 17, 8, 0, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  d.textures.push(tex);
  return tex;
}

function calendarTexture(d: Disposables): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 96;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 128, 96);
  g.fillStyle = "#e8e2d6";
  g.fillRect(0, 0, 128, 26);
  g.fillStyle = "#4c5a5e";
  g.font = "600 15px sans-serif";
  g.fillText("Today", 10, 19);
  g.fillStyle = "#172126";
  g.font = "700 26px sans-serif";
  g.fillText("2:30", 10, 62);
  g.fillStyle = "#667478";
  g.font = "500 13px sans-serif";
  g.fillText("Client call", 10, 84);
  const tex = new THREE.CanvasTexture(c);
  d.textures.push(tex);
  return tex;
}

export type OfficeProps = {
  group: THREE.Group;
  printerLight: THREE.MeshStandardMaterial;
  printerPaper: THREE.Mesh;
  callDot: THREE.MeshStandardMaterial;
  door: THREE.Mesh;
  laptopScreen: THREE.MeshStandardMaterial;
};

export function buildOffice(d: Disposables): OfficeProps {
  const group = new THREE.Group();

  const wallMat = mat(d, 0xefe8da, { rough: 0.95 });
  const floorMat = mat(d, 0xc7ab86, { rough: 0.9 });
  const woodMat = mat(d, 0xa9805a, { rough: 0.75 });
  const darkWood = mat(d, 0x7a5c40, { rough: 0.8 });
  const whiteMat = mat(d, 0xf6f4ef, { rough: 0.7 });
  const grayMat = mat(d, 0x9aa2a6, { rough: 0.6 });

  /* floor */
  const floor = new THREE.Mesh(geo(d, new THREE.PlaneGeometry(7.2, 6.4)), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -1);
  floor.receiveShadow = true;
  group.add(floor);

  /* back wall with window */
  const backWall = new THREE.Mesh(geo(d, new THREE.PlaneGeometry(7.2, 3.1)), wallMat);
  backWall.position.set(0, 1.55, -3.1);
  group.add(backWall);

  const winFrame = box(d, 2.5, 1.5, 0.08, whiteMat);
  winFrame.position.set(-0.4, 1.7, -3.06);
  group.add(winFrame);
  const winGlass = new THREE.Mesh(
    geo(d, new THREE.PlaneGeometry(2.3, 1.3)),
    new THREE.MeshBasicMaterial({ map: skyTexture(d) }),
  );
  d.materials.push(winGlass.material as THREE.Material);
  winGlass.position.set(-0.4, 1.7, -3.01);
  group.add(winGlass);
  const mullion = box(d, 0.04, 1.3, 0.02, whiteMat);
  mullion.position.set(-0.4, 1.7, -3.0);
  group.add(mullion);

  /* side walls */
  const leftWall = new THREE.Mesh(geo(d, new THREE.PlaneGeometry(6.4, 3.1)), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-3.1, 1.55, -1);
  group.add(leftWall);
  const rightWall = new THREE.Mesh(geo(d, new THREE.PlaneGeometry(6.4, 3.1)), wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(3.1, 1.55, -1);
  group.add(rightWall);

  /* doorway on the right wall, slightly open door */
  const frameMat = mat(d, 0xdfd8c8, { rough: 0.85 });
  const jambL = box(d, 0.09, 2.15, 0.12, frameMat);
  jambL.position.set(3.06, 1.05, -0.02);
  group.add(jambL);
  const jambR = box(d, 0.09, 2.15, 0.12, frameMat);
  jambR.position.set(3.06, 1.05, -1.06);
  group.add(jambR);
  const lintel = box(d, 0.09, 0.12, 1.16, frameMat);
  lintel.position.set(3.06, 2.14, -0.54);
  group.add(lintel);
  const doorMat = mat(d, 0xcab08a, { rough: 0.7 });
  const door = box(d, 0.05, 2.05, 0.98, doorMat);
  door.geometry.translate(0, 0, -0.49);
  door.position.set(3.05, 1.03, -0.06);
  door.rotation.y = -0.55;
  group.add(door);

  /* meeting table */
  const top = box(d, 2.3, 0.07, 1.2, woodMat);
  top.position.set(0, 0.74, -0.62);
  group.add(top);
  const legA = box(d, 0.09, 0.7, 1.0, darkWood);
  legA.position.set(-0.95, 0.36, -0.62);
  group.add(legA);
  const legB = box(d, 0.09, 0.7, 1.0, darkWood);
  legB.position.set(0.95, 0.36, -0.62);
  group.add(legB);

  /* chairs (simple office chairs) */
  const chairMat = mat(d, 0x5d6a70, { rough: 0.75 });
  const chairAt = (x: number, z: number, ry: number) => {
    const c = new THREE.Group();
    const seat = box(d, 0.42, 0.06, 0.4, chairMat);
    seat.position.y = 0.46;
    c.add(seat);
    const backRest = box(d, 0.42, 0.5, 0.05, chairMat);
    backRest.position.set(0, 0.75, -0.2);
    c.add(backRest);
    const post = new THREE.Mesh(
      geo(d, new THREE.CylinderGeometry(0.03, 0.03, 0.42, 10)),
      grayMat,
    );
    post.position.y = 0.24;
    c.add(post);
    const base = new THREE.Mesh(
      geo(d, new THREE.CylinderGeometry(0.2, 0.22, 0.03, 14)),
      grayMat,
    );
    base.position.y = 0.02;
    c.add(base);
    c.position.set(x, 0, z);
    c.rotation.y = ry;
    group.add(c);
    return c;
  };
  chairAt(-0.72, -1.26, 0.35);
  chairAt(0.05, -1.42, 0);
  chairAt(0.68, -1.24, -0.35);
  chairAt(1.55, -1.0, -0.7);

  /* apron panel keeps the under-table zone quiet */
  const panel = box(d, 2.24, 0.3, 0.04, woodMat);
  panel.position.set(0, 0.57, -0.26);
  group.add(panel);

  /* laptop on the table, angled open so it never hides a face */
  const lapBase = box(d, 0.3, 0.014, 0.2, grayMat);
  lapBase.position.set(0.34, 0.785, -0.8);
  lapBase.rotation.y = -0.25;
  group.add(lapBase);
  const screenMat = mat(d, 0x30373b, {
    rough: 0.4,
    emissive: 0xdfe8ea,
    emissiveIntensity: 0.35,
  });
  const lapScreen = box(d, 0.3, 0.17, 0.012, screenMat);
  lapScreen.position.set(0.32, 0.845, -0.89);
  lapScreen.rotation.set(-0.62, -0.25, 0);
  group.add(lapScreen);

  /* notebook + pen near Avery */
  const notebook = box(d, 0.24, 0.012, 0.17, whiteMat);
  notebook.position.set(-0.66, 0.782, -0.7);
  notebook.rotation.y = 0.3;
  group.add(notebook);
  const pen = box(d, 0.11, 0.01, 0.012, mat(d, 0x27484f, { rough: 0.5 }));
  pen.position.set(-0.5, 0.783, -0.62);
  pen.rotation.y = -0.5;
  group.add(pen);

  /* mug near Riley */
  const mug = new THREE.Mesh(
    geo(d, new THREE.CylinderGeometry(0.04, 0.036, 0.09, 14)),
    mat(d, 0xbf6a4f, { rough: 0.6 }),
  );
  mug.castShadow = true;
  mug.position.set(0.72, 0.825, -0.72);
  group.add(mug);

  /* plant against the back wall, in frame on phones */
  const pot = new THREE.Mesh(
    geo(d, new THREE.CylinderGeometry(0.17, 0.13, 0.26, 12)),
    mat(d, 0xb0714f, { rough: 0.85 }),
  );
  pot.castShadow = true;
  pot.position.set(-1.42, 0.13, -2.62);
  group.add(pot);
  const leafMat = mat(d, 0x4d7a52, { rough: 0.9 });
  const leafGeo = geo(d, new THREE.SphereGeometry(0.2, 10, 8));
  const leafSpots: Array<[number, number, number]> = [
    [-1.42, 0.55, -2.62],
    [-1.28, 0.74, -2.66],
    [-1.55, 0.76, -2.58],
    [-1.42, 0.94, -2.64],
  ];
  for (const [x, y, z] of leafSpots) {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.castShadow = true;
    leaf.scale.set(1, 1.25, 1);
    leaf.position.set(x, y, z);
    group.add(leaf);
  }

  /* sideboard + printer against the back wall, right of the window */
  const sideboard = box(d, 0.92, 0.72, 0.42, mat(d, 0xd8c9ad, { rough: 0.85 }));
  sideboard.position.set(1.44, 0.36, -2.78);
  group.add(sideboard);
  const printerBody = box(d, 0.44, 0.26, 0.34, mat(d, 0xe8e6e0, { rough: 0.6 }));
  printerBody.position.set(1.42, 0.85, -2.76);
  group.add(printerBody);
  const printerSlot = box(d, 0.32, 0.02, 0.05, grayMat);
  printerSlot.position.set(1.42, 0.93, -2.58);
  group.add(printerSlot);
  const printerLight = mat(d, 0x9aa2a6, {
    rough: 0.4,
    emissive: 0x9aa2a6,
    emissiveIntensity: 0.15,
  });
  const lightDot = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.018, 8, 8)), printerLight);
  lightDot.position.set(1.6, 0.97, -2.56);
  group.add(lightDot);
  const paper = box(d, 0.22, 0.006, 0.26, whiteMat);
  paper.position.set(1.42, 0.945, -2.52);
  paper.scale.z = 0.01;
  group.add(paper);

  /* wall art for warmth */
  const art = box(d, 0.5, 0.64, 0.03, whiteMat);
  art.position.set(-3.07, 1.7, -0.4);
  art.rotation.y = Math.PI / 2;
  group.add(art);
  const artInner = new THREE.Mesh(
    geo(d, new THREE.PlaneGeometry(0.4, 0.52)),
    mat(d, 0xdbc9e8, { rough: 0.9 }),
  );
  artInner.rotation.y = Math.PI / 2;
  artInner.position.set(-3.05, 1.7, -0.4);
  group.add(artInner);

  /* calendar / call status beside the window */
  const calendar = new THREE.Mesh(
    geo(d, new THREE.PlaneGeometry(0.44, 0.33)),
    new THREE.MeshBasicMaterial({ map: calendarTexture(d) }),
  );
  d.materials.push(calendar.material as THREE.Material);
  calendar.position.set(1.42, 1.88, -3.05);
  group.add(calendar);
  const callDot = mat(d, 0xb9c0c3, {
    rough: 0.4,
    emissive: 0xb9c0c3,
    emissiveIntensity: 0.2,
  });
  const callSphere = new THREE.Mesh(geo(d, new THREE.SphereGeometry(0.024, 10, 10)), callDot);
  callSphere.position.set(1.64, 1.76, -3.03);
  group.add(callSphere);

  return {
    group,
    printerLight,
    printerPaper: paper,
    callDot,
    door,
    laptopScreen: screenMat,
  };
}
