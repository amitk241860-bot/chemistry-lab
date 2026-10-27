import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// Node.js FileReader polyfill for GLTFExporter binary output
if (typeof FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    async readAsArrayBuffer(blob) {
      const buffer = await blob.arrayBuffer();
      this.result = buffer;
      if (this.onloadend) this.onloadend();
    }
  };
}

const outDir = path.resolve('public/models');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function exportGLB(scene, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        const buffer = Buffer.from(result);
        const filePath = path.join(outDir, filename);
        fs.writeFileSync(filePath, buffer);
        console.log(`Saved ${filename} (${buffer.length} bytes)`);
        resolve();
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

// 1. BEAKER (250 mL)
function createBeaker() {
  const group = new THREE.Group();
  group.name = 'Beaker';

  // Body
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xdff6ff,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
    metalness: 0.1,
  });

  const bodyGeo = new THREE.CylinderGeometry(0.7, 0.65, 1.4, 32, 1, true);
  const body = new THREE.Mesh(bodyGeo, glassMat);
  group.add(body);

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.06, 32);
  const base = new THREE.Mesh(baseGeo, glassMat);
  base.position.y = -0.7;
  group.add(base);

  // Rim lip
  const rimGeo = new THREE.TorusGeometry(0.7, 0.03, 16, 32);
  rimGeo.rotateX(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, glassMat);
  rim.position.y = 0.7;
  group.add(rim);

  // Spout
  const spoutGeo = new THREE.ConeGeometry(0.12, 0.2, 16);
  spoutGeo.rotateZ(-Math.PI / 4);
  const spout = new THREE.Mesh(spoutGeo, glassMat);
  spout.position.set(0.72, 0.68, 0);
  group.add(spout);

  return group;
}

// 2. TEST TUBE
function createTestTube() {
  const group = new THREE.Group();
  group.name = 'TestTube';

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xe0f7fa,
    transparent: true,
    opacity: 0.55,
    roughness: 0.05,
  });

  // Tube cylinder
  const cylGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 24, 1, true);
  const cyl = new THREE.Mesh(cylGeo, glassMat);
  cyl.position.y = 0.2;
  group.add(cyl);

  // Rounded bottom sphere
  const botGeo = new THREE.SphereGeometry(0.2, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bot = new THREE.Mesh(botGeo, glassMat);
  bot.position.y = -0.6;
  group.add(bot);

  // Flared rim
  const rimGeo = new THREE.TorusGeometry(0.21, 0.02, 12, 24);
  rimGeo.rotateX(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, glassMat);
  rim.position.y = 1.0;
  group.add(rim);

  return group;
}

// 3. CHINA DISH (Evaporating Dish)
function createChinaDish() {
  const group = new THREE.Group();
  group.name = 'ChinaDish';

  // Glazed white porcelain
  const porcelainMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.2,
    metalness: 0.05,
  });

  // Dish bowl
  const dishGeo = new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2.3);
  dishGeo.scale(1, 0.55, 1);
  const dish = new THREE.Mesh(dishGeo, porcelainMat);
  dish.rotation.x = Math.PI;
  dish.position.y = -0.15;
  group.add(dish);

  // Flat base ring
  const baseGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.05, 32);
  const base = new THREE.Mesh(baseGeo, porcelainMat);
  base.position.y = -0.38;
  group.add(base);

  // Pouring lip
  const lipGeo = new THREE.BoxGeometry(0.12, 0.04, 0.18);
  const lip = new THREE.Mesh(lipGeo, porcelainMat);
  lip.position.set(0.75, 0.02, 0);
  lip.rotation.z = -0.2;
  group.add(lip);

  return group;
}

// 4. BUNSEN BURNER
function createBunsenBurner() {
  const group = new THREE.Group();
  group.name = 'BunsenBurner';

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7, roughness: 0.3 });

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.1, 32);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.8;
  group.add(base);

  // Vertical barrel
  const barrelGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 24);
  const barrel = new THREE.Mesh(barrelGeo, tubeMat);
  barrel.position.y = -0.2;
  group.add(barrel);

  // Air hole collar
  const collarGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.22, 24);
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.y = -0.55;
  group.add(collar);

  // Flame nozzle tip
  const tipGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.08, 24);
  const tip = new THREE.Mesh(tipGeo, tubeMat);
  tip.position.y = 0.42;
  group.add(tip);

  // Gas inlet tube
  const inletGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16);
  inletGeo.rotateZ(Math.PI / 2);
  const inlet = new THREE.Mesh(inletGeo, baseMat);
  inlet.position.set(-0.4, -0.75, 0);
  group.add(inlet);

  return group;
}

// 5. TRIPOD & WIRE GAUZE
function createTripod() {
  const group = new THREE.Group();
  group.name = 'Tripod';

  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
  const gauzeMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.6, roughness: 0.5 });
  const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

  // Top triangular/circular ring
  const ringGeo = new THREE.TorusGeometry(0.7, 0.05, 12, 32);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, ironMat);
  ring.position.y = 0.6;
  group.add(ring);

  // 3 Legs
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3;
    const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.6, 16);
    const leg = new THREE.Mesh(legGeo, ironMat);
    leg.position.set(Math.cos(angle) * 0.7, -0.2, Math.sin(angle) * 0.7);
    leg.rotation.z = Math.cos(angle) * -0.15;
    leg.rotation.x = Math.sin(angle) * 0.15;
    group.add(leg);
  }

  // Wire Gauze on top
  const gauzeGeo = new THREE.BoxGeometry(1.2, 0.02, 1.2);
  const gauze = new THREE.Mesh(gauzeGeo, gauzeMat);
  gauze.position.y = 0.63;
  group.add(gauze);

  // Ceramic center disc
  const centerGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.025, 24);
  const center = new THREE.Mesh(centerGeo, ceramicMat);
  center.position.y = 0.645;
  group.add(center);

  return group;
}

// 6. MEASURING CYLINDER
function createMeasuringCylinder() {
  const group = new THREE.Group();
  group.name = 'MeasuringCylinder';

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
  });

  // Base hexagonal plate
  const baseGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.08, 6);
  const base = new THREE.Mesh(baseGeo, glassMat);
  base.position.y = -1.1;
  group.add(base);

  // Narrow tall cylinder
  const cylGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.2, 32, 1, true);
  const cyl = new THREE.Mesh(cylGeo, glassMat);
  cyl.position.y = 0.0;
  group.add(cyl);

  // Spout
  const spoutGeo = new THREE.ConeGeometry(0.08, 0.15, 16);
  spoutGeo.rotateZ(-Math.PI / 4);
  const spout = new THREE.Mesh(spoutGeo, glassMat);
  spout.position.set(0.32, 1.1, 0);
  group.add(spout);

  return group;
}

// 7. LAB STAND WITH CLAMP
function createLabStand() {
  const group = new THREE.Group();
  group.name = 'LabStand';

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.4 });
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.15 });

  // Heavy rectangular base
  const baseGeo = new THREE.BoxGeometry(1.4, 0.1, 0.9);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -1.15;
  group.add(base);

  // Upright steel rod
  const rodGeo = new THREE.CylinderGeometry(0.035, 0.035, 3.2, 16);
  const rod = new THREE.Mesh(rodGeo, rodMat);
  rod.position.set(0.4, 0.45, 0);
  group.add(rod);

  // Clamp bosshead
  const bossGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const boss = new THREE.Mesh(bossGeo, baseMat);
  boss.position.set(0.4, 0.6, 0);
  group.add(boss);

  // Clamp arm
  const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 12);
  armGeo.rotateZ(Math.PI / 2);
  const arm = new THREE.Mesh(armGeo, rodMat);
  arm.position.set(0.1, 0.6, 0);
  group.add(arm);

  // Clamp fingers
  const ringGeo = new THREE.TorusGeometry(0.16, 0.02, 8, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, rodMat);
  ring.position.set(-0.2, 0.6, 0);
  group.add(ring);

  return group;
}

async function run() {
  console.log('Generating GLB models into public/models...');
  await exportGLB(createBeaker(), 'beaker.glb');
  await exportGLB(createTestTube(), 'test-tube.glb');
  await exportGLB(createChinaDish(), 'china-dish.glb');
  await exportGLB(createBunsenBurner(), 'burner.glb');
  await exportGLB(createTripod(), 'tripod.glb');
  await exportGLB(createMeasuringCylinder(), 'measuring-cylinder.glb');
  await exportGLB(createLabStand(), 'lab-stand.glb');
  console.log('All models generated successfully!');
}

run();
