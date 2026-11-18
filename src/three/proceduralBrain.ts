import * as THREE from 'three';

export interface BrainAssemblyResult {
  group: THREE.Group;
  sparksMesh: THREE.InstancedMesh;
  sparkCurves: THREE.CatmullRomCurve3[];
  sparkOffsets: number[];
  disposables: { dispose: () => void }[];
}

export interface NeuronAssemblyResult {
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  membraneMesh: THREE.Mesh;
  ringOuter: THREE.Mesh;
  ringInner: THREE.Mesh;
  hitProxy: THREE.Mesh;
  baseColor: THREE.Color;
  disposables: { dispose: () => void }[];
}

// Pre-allocated scratch math helpers for zero-GC animation ticks
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _c = new THREE.Color();

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function afterDraw(
  renderer: THREE.WebGLRenderer,
  cb: () => void,
  registerTimer: (id: number) => void
) {
  try {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          registerTimer(window.setTimeout(poll, 5));
        } else {
          if (sync) gl.deleteSync(sync);
          registerTimer(window.setTimeout(cb, 28));
        }
      };
      registerTimer(window.setTimeout(poll, 4));
      return;
    }
  } catch {
    // Fallback below if sync fence unavailable
  }
  registerTimer(window.setTimeout(cb, 28));
}

function pseudoNoise3D(x: number, y: number, z: number): number {
  const s1 = Math.sin(x * 3.7 + y * 2.3) * Math.cos(z * 3.1 - x * 1.9);
  const s2 = Math.sin(y * 6.4 - z * 5.2) * Math.cos(x * 5.7 + y * 4.1);
  const s3 = Math.sin((x + y + z) * 9.5) * 0.35;
  return s1 * 0.55 + s2 * 0.35 + s3 * 0.25;
}

export function createCorticalBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 420; i++) {
      const x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
      const y = ((Math.sin(i * 78.233) * 23421.631) % 1 + 1) % 1;
      const px = x * size;
      const py = y * size;
      const radius = 8 + (i % 14);
      const grad = ctx.createRadialGradient(px, py, 1, px, py, radius);
      grad.addColorStop(0, i % 2 === 0 ? 'rgba(235,235,235,0.22)' : 'rgba(45,45,45,0.25)');
      grad.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = Math.min(8, maxAnisotropy);
  // Data map stays linear (NoColorSpace)
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

export function createRadialShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.05,
      size / 2,
      size / 2,
      size * 0.5
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.28)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildHemisphereGeometry(side: -1 | 1): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 52, 38);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  const cTop = new THREE.Color('#d7b6ff');
  const cMid = new THREE.Color('#f4a6c8');
  const cDeep = new THREE.Color('#7cc9e8');

  for (let i = 0; i < pos.count; i++) {
    _v.fromBufferAttribute(pos, i);

    // Flatten medial fissure face so hemispheres sit side-by-side cleanly
    const isMedial = _v.x * side < 0;
    if (isMedial) {
      _v.x *= 0.14;
    }

    // Anatomical brain silhouette shaping: longer front-back (Z), wider temporal flare, tapered frontal pole
    let x = _v.x * 0.92 + side * 0.08;
    let y = _v.y * 0.96;
    let z = _v.z * 1.38;

    // Taper frontal lobe (+Z) & round occipital pole (-Z)
    if (z > 0) {
      x *= 1 - 0.16 * Math.min(1, z / 1.38);
    }
    // Slight inferior concavity & temporal bulge
    if (y < -0.15) {
      const inf = Math.min(1, (-y - 0.15) / 0.85);
      x *= 1 - 0.12 * inf;
      if (z > -0.35 && z < 0.55) {
        x += side * 0.14 * (1 - Math.abs(z - 0.1) * 1.4) * inf;
      }
    }

    // Sculptural gyri / sulci cortical folding
    const ridge = pseudoNoise3D(
      _v.x * 2.1 + side * 0.7,
      _v.y * 2.4,
      _v.z * 2.2
    );
    const fold = Math.abs(ridge); // Sharp sulci valleys + pillowed gyri crests
    const foldDisplacement = (0.5 - fold) * 0.13;
    _v2.set(x, y, z).normalize();
    x += _v2.x * foldDisplacement;
    y += _v2.y * foldDisplacement;
    z += _v2.z * foldDisplacement;

    pos.setXYZ(i, x, y, z);

    // Iridescent vertex tint blending frontal-occipital & dorsal-ventral gradients
    const tHeight = THREE.MathUtils.clamp((y + 1) * 0.5, 0, 1);
    const tFront = THREE.MathUtils.clamp((z + 1.4) / 2.8, 0, 1);
    _c.copy(cDeep).lerp(cMid, tFront).lerp(cTop, tHeight * 0.72);
    // Slightly darken deep sulci creases for crisp surface depth
    const creaseShade = 0.76 + (1 - fold) * 0.34;
    _c.multiplyScalar(creaseShade);

    colors[i * 3] = _c.r;
    colors[i * 3 + 1] = _c.g;
    colors[i * 3 + 2] = _c.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeTangents();
  return geo;
}

function buildCerebellumGeometry(side: -1 | 1): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.46, 36, 28);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    _v.fromBufferAttribute(pos, i);
    // Fine horizontal cerebellar folia ridges
    const folia = Math.sin(_v.y * 28 + side * 0.4) * 0.022;
    const x = _v.x * 1.05 + folia * 0.4;
    const y = _v.y * 0.72 + folia * 0.6;
    const z = _v.z * 0.92 + folia;
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createSculpturalBrainGroup(
  maxAnisotropy: number,
  options: { ghostShell?: boolean } = {}
): BrainAssemblyResult {
  const ghostShell = Boolean(options.ghostShell);
  const disposables: { dispose: () => void }[] = [];
  const root = new THREE.Group();

  // Inner anatomical sculpture group centered above plinth/ground (y = 0 at plinth base)
  const brainBody = new THREE.Group();
  brainBody.position.set(0, ghostShell ? 0 : 1.72, 0);
  root.add(brainBody);

  const bumpTex = createCorticalBumpTexture(maxAnisotropy);
  disposables.push(bumpTex);

  const cortexMat = ghostShell
    ? new THREE.MeshPhysicalMaterial({
        color: '#8aa8f8',
        roughness: 0.25,
        metalness: 0.08,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        transparent: true,
        opacity: 0.085,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    : new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.28,
        metalness: 0.08,
        clearcoat: 0.76,
        clearcoatRoughness: 0.2,
        sheen: 0.85,
        sheenColor: new THREE.Color('#f7b8ff'),
        sheenRoughness: 0.35,
        bumpMap: bumpTex,
        bumpScale: 0.035,
        emissive: new THREE.Color('#211740'),
        emissiveIntensity: 0.5,
      });
  disposables.push(cortexMat);

  // 1 & 2. Left and Right Cerebral Hemispheres
  const leftGeo = buildHemisphereGeometry(-1);
  const rightGeo = buildHemisphereGeometry(1);
  disposables.push(leftGeo, rightGeo);

  const leftHemi = new THREE.Mesh(leftGeo, cortexMat);
  leftHemi.position.set(-0.04, 0.14, 0.04);
  leftHemi.castShadow = !ghostShell;
  leftHemi.receiveShadow = !ghostShell;

  const rightHemi = new THREE.Mesh(rightGeo, cortexMat);
  rightHemi.position.set(0.04, 0.14, 0.04);
  rightHemi.castShadow = !ghostShell;
  rightHemi.receiveShadow = !ghostShell;

  brainBody.add(leftHemi, rightHemi);

  // Ghost shell subtle wireframe ridge overlay for spatial orientation inside /mind/
  if (ghostShell) {
    const wireMat = new THREE.MeshBasicMaterial({
      color: '#6e8ae8',
      wireframe: true,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
    });
    const leftWire = new THREE.Mesh(leftGeo, wireMat);
    leftWire.position.copy(leftHemi.position);
    const rightWire = new THREE.Mesh(rightGeo, wireMat);
    rightWire.position.copy(rightHemi.position);
    brainBody.add(leftWire, rightWire);
    disposables.push(wireMat);
  }

  // 3. Corpus Callosum Luminous Inner Bridge (differs in roughness/emissive)
  const callosumGeo = new THREE.CapsuleGeometry(0.18, 0.78, 12, 20);
  callosumGeo.rotateX(Math.PI * 0.5);
  const callosumMat = new THREE.MeshStandardMaterial({
    color: '#c3b0f6',
    emissive: '#7e5cf6',
    emissiveIntensity: ghostShell ? 0.45 : 0.9,
    roughness: 0.18,
    metalness: 0.2,
    transparent: ghostShell,
    opacity: ghostShell ? 0.25 : 1,
  });
  const callosum = new THREE.Mesh(callosumGeo, callosumMat);
  callosum.position.set(0, 0.06, 0.05);
  brainBody.add(callosum);
  disposables.push(callosumGeo, callosumMat);

  // 4 & 5. Left and Right Cerebellum Lobes (matte folia surface, roughness 0.58 vs 0.28 cortex)
  const cereLeftGeo = buildCerebellumGeometry(-1);
  const cereRightGeo = buildCerebellumGeometry(1);
  const cereMat = new THREE.MeshStandardMaterial({
    color: '#9bb5eb',
    roughness: 0.58,
    metalness: 0.05,
    emissive: '#1e2747',
    emissiveIntensity: 0.35,
    transparent: ghostShell,
    opacity: ghostShell ? 0.14 : 1,
    depthWrite: !ghostShell,
  });
  const cereLeft = new THREE.Mesh(cereLeftGeo, cereMat);
  cereLeft.position.set(-0.34, -0.58, -0.68);
  const cereRight = new THREE.Mesh(cereRightGeo, cereMat);
  cereRight.position.set(0.34, -0.58, -0.68);
  cereLeft.castShadow = !ghostShell;
  cereRight.castShadow = !ghostShell;
  brainBody.add(cereLeft, cereRight);
  disposables.push(cereLeftGeo, cereRightGeo, cereMat);

  // 6. Brainstem Lathe Profile + Brushed Metal Plinth Collar (home sculpture only)
  if (!ghostShell) {
    const stemPoints = [
      new THREE.Vector2(0.01, -0.98),
      new THREE.Vector2(0.14, -0.92),
      new THREE.Vector2(0.19, -0.64),
      new THREE.Vector2(0.28, -0.34),
      new THREE.Vector2(0.22, 0.02),
    ];
    const stemGeo = new THREE.LatheGeometry(stemPoints, 28);
    const stemMat = new THREE.MeshStandardMaterial({
      color: '#b8c3e6',
      roughness: 0.56,
      metalness: 0.08,
      emissive: '#182038',
      emissiveIntensity: 0.3,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.set(0, -0.34, -0.22);
    stemMesh.rotation.x = 0.22;
    stemMesh.castShadow = true;
    brainBody.add(stemMesh);
    disposables.push(stemGeo, stemMat);

    // Sculptural brushed champagne-titanium base ring grounded at y = 0.04
    const collarGeo = new THREE.TorusGeometry(0.68, 0.028, 16, 64);
    collarGeo.rotateX(Math.PI / 2);
    const collarMat = new THREE.MeshPhysicalMaterial({
      color: '#d8cef8',
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.6,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.set(0, 0.06, 0);
    root.add(collarMesh);
    disposables.push(collarGeo, collarMat);

    // Soft radial contact shadow grounded at y = 0.01
    const shadowTex = createRadialShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.y = 0.01;
    root.add(shadowPlane);
    disposables.push(shadowTex, shadowGeo, shadowMat);
  }

  // 7. Curved Internal Neural Filaments & Action-Potential Instanced Sparks
  const sparkCurves: THREE.CatmullRomCurve3[] = [];
  const axonMat = new THREE.MeshBasicMaterial({
    color: '#c7b8ff',
    transparent: true,
    opacity: ghostShell ? 0.14 : 0.42,
    depthWrite: false,
  });
  disposables.push(axonMat);

  for (let c = 0; c < 12; c++) {
    const a1 = (c / 12) * Math.PI * 2;
    const a2 = a1 + 1.35 + (c % 3) * 0.4;
    const side1 = c % 2 === 0 ? -1 : 1;
    const pStart = new THREE.Vector3(
      side1 * (0.25 + Math.abs(Math.cos(a1)) * 0.55),
      Math.sin(a1 * 1.7) * 0.55 + 0.1,
      Math.sin(a1) * 0.95
    );
    const pMid = new THREE.Vector3(
      side1 * 0.18 * Math.cos(c),
      Math.cos(a2) * 0.5 + 0.18,
      Math.cos(a1 + a2) * 0.65
    );
    const pEnd = new THREE.Vector3(
      -side1 * (0.22 + Math.abs(Math.sin(a2)) * 0.58),
      Math.cos(a2 * 1.3) * 0.48 + 0.15,
      Math.cos(a2) * 0.92
    );
    const curve = new THREE.CatmullRomCurve3([pStart, pMid, pEnd]);
    sparkCurves.push(curve);

    const tubeGeo = new THREE.TubeGeometry(curve, 24, ghostShell ? 0.008 : 0.014, 6, false);
    const tube = new THREE.Mesh(tubeGeo, axonMat);
    brainBody.add(tube);
    disposables.push(tubeGeo);
  }

  // Instanced Sparks gliding along the internal neural curves
  const sparkCount = sparkCurves.length * 3;
  const sparkGeo = new THREE.SphereGeometry(ghostShell ? 0.022 : 0.036, 10, 8);
  const sparkMat = new THREE.MeshBasicMaterial({
    color: '#ffffff',
  });
  const sparksMesh = new THREE.InstancedMesh(sparkGeo, sparkMat, sparkCount);
  sparksMesh.frustumCulled = false;

  const sparkOffsets: number[] = [];
  const sparkPalette = ['#9ee7ff', '#ffd6a5', '#f9a8d4', '#c4b5fd'];
  for (let i = 0; i < sparkCount; i++) {
    sparkOffsets.push((i / sparkCount) + seededRand(i) * 0.2);
    _c.set(sparkPalette[i % sparkPalette.length]);
    sparksMesh.setColorAt(i, _c);
  }
  if (sparksMesh.instanceColor) sparksMesh.instanceColor.needsUpdate = true;
  brainBody.add(sparksMesh);
  disposables.push(sparkGeo, sparkMat);

  return {
    group: root,
    sparksMesh,
    sparkCurves,
    sparkOffsets,
    disposables,
  };
}

function seededRand(n: number): number {
  const x = Math.sin(n * 91.3 + 47.9) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Composite 7-Part Procedural Neuron Assembly (nucleus, membrane, brushed metallic ring,
 * tilted polar halo, 5 curved TubeGeometry dendrites, terminal boutons, and layer-1 hit proxy).
 */
export function createNeuronAssembly(
  colorHex: string,
  nodeIndex: number
): NeuronAssemblyResult {
  const disposables: { dispose: () => void }[] = [];
  const group = new THREE.Group();
  const baseColor = new THREE.Color(colorHex);

  // 1. Radiant Bioluminescent Core Jewel
  const coreGeo = new THREE.IcosahedronGeometry(0.145, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: baseColor,
    emissiveIntensity: 2.2,
    roughness: 0.15,
    metalness: 0.1,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);
  disposables.push(coreGeo, coreMat);

  // 2. Translucent Soma Membrane
  const membraneGeo = new THREE.SphereGeometry(0.24, 28, 22);
  const membraneMat = new THREE.MeshPhysicalMaterial({
    color: baseColor,
    emissive: baseColor,
    emissiveIntensity: 0.55,
    roughness: 0.22,
    metalness: 0.05,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
  });
  const membraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
  group.add(membraneMesh);
  disposables.push(membraneGeo, membraneMat);

  // 3. Brushed Metallic Equatorial Ring (distinct high-metalness contrast against membrane)
  const ringOuterGeo = new THREE.TorusGeometry(0.35, 0.017, 12, 48);
  const ringOuterMat = new THREE.MeshStandardMaterial({
    color: '#e6e4f2',
    emissive: baseColor,
    emissiveIntensity: 0.35,
    metalness: 0.9,
    roughness: 0.16,
  });
  const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
  ringOuter.rotation.x = Math.PI * 0.35 + nodeIndex * 0.3;
  group.add(ringOuter);
  disposables.push(ringOuterGeo, ringOuterMat);

  // 4. Secondary Polar Halo Filament
  const ringInnerGeo = new THREE.TorusGeometry(0.42, 0.009, 8, 48);
  const ringInnerMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    emissive: baseColor,
    emissiveIntensity: 0.9,
    metalness: 0.4,
    roughness: 0.25,
    transparent: true,
    opacity: 0.8,
  });
  const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
  ringInner.rotation.y = Math.PI * 0.25 + nodeIndex * 0.5;
  ringInner.rotation.x = -Math.PI * 0.28;
  group.add(ringInner);
  disposables.push(ringInnerGeo, ringInnerMat);

  // 5 & 6. Five Curved Dendrite Arbors + Terminal Boutons
  const dendriteMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    emissive: baseColor,
    emissiveIntensity: 0.65,
    roughness: 0.45,
    metalness: 0.12,
  });
  const boutonGeo = new THREE.SphereGeometry(0.036, 12, 10);
  const boutonMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  disposables.push(dendriteMat, boutonGeo, boutonMat);

  for (let b = 0; b < 5; b++) {
    const theta = (b / 5) * Math.PI * 2 + seededRand(nodeIndex * 11 + b) * 0.8;
    const phi = (seededRand(nodeIndex * 19 + b) - 0.5) * 2.1;
    const dir = new THREE.Vector3(
      Math.cos(theta) * Math.cos(phi),
      Math.sin(phi),
      Math.sin(theta) * Math.cos(phi)
    ).normalize();

    const p0 = dir.clone().multiplyScalar(0.18);
    const p1 = dir
      .clone()
      .multiplyScalar(0.42)
      .add(new THREE.Vector3(Math.sin(b * 2.1) * 0.08, Math.cos(b * 1.7) * 0.08, 0.04));
    const p2 = dir
      .clone()
      .multiplyScalar(0.68 + seededRand(nodeIndex + b) * 0.18)
      .add(new THREE.Vector3(Math.cos(b * 3.1) * 0.07, Math.sin(b * 2.4) * 0.07, -0.04));

    const branchCurve = new THREE.CatmullRomCurve3([p0, p1, p2]);
    const branchGeo = new THREE.TubeGeometry(branchCurve, 12, 0.015, 6, false);
    const branchMesh = new THREE.Mesh(branchGeo, dendriteMat);
    group.add(branchMesh);
    disposables.push(branchGeo);

    const bouton = new THREE.Mesh(boutonGeo, boutonMat);
    bouton.position.copy(p2);
    group.add(bouton);
  }

  // 7. Generous Invisible Proxy Sphere on Raycast Layer 1 for Instant Picking
  const hitGeo = new THREE.SphereGeometry(0.58, 12, 10);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitProxy = new THREE.Mesh(hitGeo, hitMat);
  hitProxy.layers.set(1);
  hitProxy.userData.nodeIndex = nodeIndex;
  group.add(hitProxy);
  disposables.push(hitGeo, hitMat);

  return {
    group,
    coreMesh,
    membraneMesh,
    ringOuter,
    ringInner,
    hitProxy,
    baseColor,
    disposables,
  };
}
