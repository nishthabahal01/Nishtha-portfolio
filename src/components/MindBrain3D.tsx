import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Eye, EyeOff, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { MIND_NODES } from '../data/portfolioData';
import {
  afterDraw,
  createNeuronAssembly,
  createSculpturalBrainGroup,
  detectSoftwareWebGL,
  NeuronAssemblyResult,
} from '../three/proceduralBrain';

interface MindBrain3DProps {
  selectedIdx: number;
  hoveredIdx: number | null;
  modalOpen: boolean;
  onHoverChange: (idx: number | null) => void;
  onSelectNeuron: (idx: number) => void;
}

interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: 'Overview',
    position: [0.3, 1.3, 6.2],
    target: [0, 0.05, 0],
  },
  {
    id: 'builds',
    label: 'AI & Builds',
    position: [-0.3, 1.55, 4.95],
    target: [0, 0.68, 0.95],
  },
  {
    id: 'roots',
    label: 'Campus & Twin',
    position: [-3.9, 0.75, 3.65],
    target: [-0.95, -0.08, -0.25],
  },
  {
    id: 'growth',
    label: 'Climate & Travel',
    position: [3.9, 0.72, 3.55],
    target: [0.9, -0.05, -0.2],
  },
];

// Spatial 3D cranial positions mapped to anatomical brain regions for the 9 threads
const NEURON_POSITIONS: [number, number, number][] = [
  [-1.18, 0.72, 1.48], // 0: Applied AI Craft (Left Frontal)
  [0.06, 1.32, 0.98], // 1: Zero-to-One Builds (Crown)
  [1.24, 0.74, 1.44], // 2: Signal-Led Growth (Right Frontal)
  [-1.56, 0.16, 0.12], // 3: Four-Campus Education (Left Parietal)
  [0.0, 0.22, 0.14], // 4: SideQuest Yale (Center Hub)
  [1.56, 0.14, -0.08], // 5: Climate & Capital (Right Parietal)
  [-1.22, -0.58, -1.22], // 6: Twin Sister & Family (Left Temporal/Occipital)
  [0.04, -0.78, -1.52], // 7: Passport & Travel (Posterior Cerebellar)
  [1.24, -0.54, -1.16], // 8: Founder Circles (Right Temporal/Occipital)
];

function seededRandom(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Pre-allocated scratch helpers (zero GC inside animation tick)
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _mat4 = new THREE.Matrix4();
const _projVec = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _colorScratch = new THREE.Color();
const _white = new THREE.Color('#ffffff');

export const MindBrain3D: React.FC<MindBrain3DProps> = ({
  selectedIdx,
  hoveredIdx,
  modalOpen,
  onHoverChange,
  onSelectNeuron,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [shellVisible, setShellVisible] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [activePreset, setActivePreset] = useState<string>('overview');

  const activeFocusIdx = hoveredIdx !== null ? hoveredIdx : selectedIdx;

  // Refs read by WebGL loop without triggering scene re-creation
  const activeFocusRef = useRef(activeFocusIdx);
  const shellVisibleRef = useRef(shellVisible);
  const autoOrbitRef = useRef(autoOrbit);
  const onHoverRef = useRef(onHoverChange);
  const onSelectRef = useRef(onSelectNeuron);
  const cameraGoalRef = useRef<{
    active: boolean;
    pos: [number, number, number];
    target: [number, number, number];
  }>({
    active: false,
    pos: CAMERA_PRESETS[0].position,
    target: CAMERA_PRESETS[0].target,
  });

  activeFocusRef.current = activeFocusIdx;
  shellVisibleRef.current = shellVisible;
  autoOrbitRef.current = autoOrbit;
  onHoverRef.current = onHoverChange;
  onSelectRef.current = onSelectNeuron;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'h' || e.key === 'H') {
        setControlsVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    const mount = mountRef.current;
    const container = containerRef.current;
    if (!mount || !container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor('#070910', 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#070910', 0.032);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(...CAMERA_PRESETS[0].position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 9.2;
    controls.autoRotateSpeed = 0.48;
    controls.target.set(...CAMERA_PRESETS[0].target);

    // Manual orbit cancels any active preset glide cleanly
    const onControlStart = () => {
      cameraGoalRef.current.active = false;
    };
    controls.addEventListener('start', onControlStart);

    // Procedural Studio IBL Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.65;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Scene Lighting
    const keyLight = new THREE.DirectionalLight('#f4ecff', 2.0);
    keyLight.position.set(4.5, 6.5, 5.2);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#96baff', '#080a11', 0.56);
    scene.add(hemiLight);

    const focusPointLight = new THREE.PointLight('#c3b0f6', 7.5, 7, 2);
    focusPointLight.position.set(...NEURON_POSITIONS[0]);
    scene.add(focusPointLight);

    const disposables: { dispose: () => void }[] = [];

    // 1. Translucent Outer Cortical Ghost Brain Shell
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const brainShell = createSculpturalBrainGroup(maxAnisotropy, { ghostShell: true });
    brainShell.group.scale.setScalar(2.48);
    brainShell.group.position.set(0, -0.15, -0.05);
    scene.add(brainShell.group);
    disposables.push(...brainShell.disposables);

    // 2. Nine Composite 3D Neuron Assemblies
    const neuronAssemblies: NeuronAssemblyResult[] = [];
    const hitProxies: THREE.Object3D[] = [];
    const primaryAnchors: THREE.Vector3[] = [];

    MIND_NODES.forEach((node, i) => {
      const coords = NEURON_POSITIONS[i] || [0, 0, 0];
      const assembly = createNeuronAssembly(node.color, i);
      assembly.group.position.set(...coords);
      scene.add(assembly.group);
      neuronAssemblies.push(assembly);
      hitProxies.push(assembly.hitProxy);
      primaryAnchors.push(new THREE.Vector3(...coords));
      disposables.push(...assembly.disposables);
    });

    // 3. Ambient Cortical Interneurons via InstancedMesh
    const ambientCount = 40;
    const ambientAnchors: THREE.Vector3[] = [];
    const ambientGeo = new THREE.SphereGeometry(0.055, 10, 8);
    const ambientMat = new THREE.MeshStandardMaterial({
      color: '#d9d4ff',
      emissive: '#6e5ae8',
      emissiveIntensity: 0.75,
      roughness: 0.3,
      metalness: 0.1,
    });
    const ambientMesh = new THREE.InstancedMesh(ambientGeo, ambientMat, ambientCount);
    ambientMesh.frustumCulled = false;

    const ambientPalette = ['#a5b4fc', '#f5b8da', '#99e6ff', '#d4b8ff'];
    for (let i = 0; i < ambientCount; i++) {
      const theta = seededRandom(i * 5 + 1) * Math.PI * 2;
      const phi = (seededRandom(i * 9 + 3) - 0.5) * Math.PI * 0.85;
      const r = 0.55 + seededRandom(i * 13 + 7) * 1.45;
      const ax = Math.cos(theta) * Math.cos(phi) * r * 1.02;
      const ay = Math.sin(phi) * r * 0.78 + 0.05;
      const az = Math.sin(theta) * Math.cos(phi) * r * 1.25;
      ambientAnchors.push(new THREE.Vector3(ax, ay, az));

      _pos.set(ax, ay, az);
      _scale.setScalar(0.65 + seededRandom(i * 17) * 0.8);
      _mat4.compose(_pos, _quat, _scale);
      ambientMesh.setMatrixAt(i, _mat4);

      _colorScratch.set(ambientPalette[i % ambientPalette.length]);
      ambientMesh.setColorAt(i, _colorScratch);
    }
    ambientMesh.instanceMatrix.needsUpdate = true;
    if (ambientMesh.instanceColor) ambientMesh.instanceColor.needsUpdate = true;
    ambientMesh.computeBoundingSphere();
    scene.add(ambientMesh);
    disposables.push(ambientGeo, ambientMat);

    // 4. Curved 3D Axonal Pathways connecting all 9 primary neurons + nearby interneurons
    interface AxonEdge {
      aIdx: number;
      bIdx: number;
      curve: THREE.CatmullRomCurve3;
      material: THREE.MeshBasicMaterial;
    }
    const axonEdges: AxonEdge[] = [];
    const connectedPairs = new Set<string>();

    const allPoints = [...primaryAnchors, ...ambientAnchors];
    for (let i = 0; i < primaryAnchors.length; i++) {
      const pA = primaryAnchors[i];
      // Connect to 4 nearest primary neighbors + 3 ambient interneurons
      const nearestPrimary = primaryAnchors
        .map((pB, j) => ({ j, d: pA.distanceTo(pB) }))
        .filter((item) => item.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 4);

      nearestPrimary.forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (connectedPairs.has(key)) return;
        connectedPairs.add(key);

        const pB = primaryAnchors[j];
        const mid = pA.clone().lerp(pB, 0.5);
        mid.y += 0.22 * (seededRandom(i * 7 + j) - 0.35);
        mid.x += 0.16 * (seededRandom(j * 11 + i) - 0.5);

        const curve = new THREE.CatmullRomCurve3([pA.clone(), mid, pB.clone()]);
        const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.011, 6, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: '#7da5e8',
          transparent: true,
          opacity: 0.26,
          depthWrite: false,
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tubeMesh);
        disposables.push(tubeGeo, tubeMat);
        axonEdges.push({ aIdx: i, bIdx: j, curve, material: tubeMat });
      });

      const nearestAmbient = ambientAnchors
        .map((pB, k) => ({ j: primaryAnchors.length + k, pB, d: pA.distanceTo(pB) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);

      nearestAmbient.forEach(({ j, pB }) => {
        const mid = pA.clone().lerp(pB, 0.5);
        mid.y += 0.14;
        const curve = new THREE.CatmullRomCurve3([pA.clone(), mid, pB.clone()]);
        const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.007, 5, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: '#6b85c9',
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tubeMesh);
        disposables.push(tubeGeo, tubeMat);
        axonEdges.push({ aIdx: i, bIdx: j, curve, material: tubeMat });
      });
    }

    // Light sub-mesh links among ambient interneurons for rich anatomical density
    for (let i = primaryAnchors.length; i < allPoints.length; i++) {
      const pA = allPoints[i];
      const nextIdx =
        primaryAnchors.length + ((i - primaryAnchors.length + 5) % ambientAnchors.length);
      const pB = allPoints[nextIdx];
      if (pA.distanceTo(pB) < 2.2) {
        const mid = pA.clone().lerp(pB, 0.5);
        mid.y += 0.1;
        const curve = new THREE.CatmullRomCurve3([pA.clone(), mid, pB.clone()]);
        const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.005, 4, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: '#4e639e',
          transparent: true,
          opacity: 0.11,
          depthWrite: false,
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tubeMesh);
        disposables.push(tubeGeo, tubeMat);
        axonEdges.push({ aIdx: i, bIdx: nextIdx, curve, material: tubeMat });
      }
    }

    // 5. Instanced Glowing Action-Potential Pulses traveling along Axon Pathways
    const pulsesPerEdge = 2;
    const pulseCount = axonEdges.length * pulsesPerEdge;
    const pulseGeo = new THREE.SphereGeometry(0.029, 10, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const pulsesMesh = new THREE.InstancedMesh(pulseGeo, pulseMat, pulseCount);
    pulsesMesh.frustumCulled = false;

    const pulseOffsets: number[] = [];
    for (let i = 0; i < pulseCount; i++) {
      pulseOffsets.push(seededRandom(i * 13 + 5));
      _colorScratch.set('#9ec5ff');
      pulsesMesh.setColorAt(i, _colorScratch);
    }
    if (pulsesMesh.instanceColor) pulsesMesh.instanceColor.needsUpdate = true;
    pulsesMesh.computeBoundingSphere();
    scene.add(pulsesMesh);
    disposables.push(pulseGeo, pulseMat);

    // 6. Layer 1 Raycasting & Pointer Picking (clean tap vs orbit drag)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };
    let hoverTimer = 0;

    const pickNeuron = (clientX: number, clientY: number): number | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitProxies, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.nodeIndex;
        return typeof idx === 'number' ? idx : null;
      }
      return null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist > 6) return; // User was orbiting the camera
      const hitIdx = pickNeuron(e.clientX, e.clientY);
      if (hitIdx !== null) {
        onSelectRef.current(hitIdx);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - hoverTimer < 40) return;
      hoverTimer = now;

      const hitIdx = pickNeuron(e.clientX, e.clientY);
      renderer.domElement.style.cursor = hitIdx !== null ? 'pointer' : 'grab';
      onHoverRef.current(hitIdx);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 7. Synchronize Projected HTML Labels cleanly without React 60fps setState
    const updateProjectedLabels = (viewW: number, viewH: number) => {
      const focusIdx = activeFocusRef.current;
      for (let i = 0; i < neuronAssemblies.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;

        _projVec.copy(neuronAssemblies[i].group.position);
        _projVec.y -= 0.44; // Position label right beneath neuron orb
        _projVec.project(camera);

        if (_projVec.z > 1 || _projVec.z < -1) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }

        const px = (_projVec.x * 0.5 + 0.5) * viewW;
        const py = (-_projVec.y * 0.5 + 0.5) * viewH;

        // Clamp slightly inside container bounds so labels don't clip abruptly at edges
        const clampedX = THREE.MathUtils.clamp(px, 68, viewW - 68);
        const clampedY = THREE.MathUtils.clamp(py, 24, viewH - 68);
        const isFocus = i === focusIdx;

        el.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0) translate(-50%, 0)`;
        el.style.opacity = isFocus ? '1' : '0.9';
        el.style.pointerEvents = 'auto';
        el.style.zIndex = isFocus ? '25' : '15';
      }
    };

    let disposed = false;
    let rafId = 0;
    const activeTimers = new Set<number>();
    const registerTimer = (id: number) => activeTimers.add(id);

    let lastTimestamp = performance.now();
    let elapsed = 0;

    const renderFrame = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;
      elapsed += dt;

      const focusIdx = activeFocusRef.current;
      const focusAssembly = neuronAssemblies[focusIdx];
      const showShell = shellVisibleRef.current;

      brainShell.group.visible = showShell;
      if (showShell) {
        const shellCount = brainShell.sparksMesh.count;
        for (let i = 0; i < shellCount; i++) {
          const curve = brainShell.sparkCurves[i % brainShell.sparkCurves.length];
          const u = (elapsed * 0.12 + brainShell.sparkOffsets[i]) % 1;
          curve.getPointAt(u, _pos);
          _scale.setScalar(0.85);
          _mat4.compose(_pos, _quat, _scale);
          brainShell.sparksMesh.setMatrixAt(i, _mat4);
        }
        brainShell.sparksMesh.instanceMatrix.needsUpdate = true;
      }

      // Smooth damped camera preset transitions
      const goal = cameraGoalRef.current;
      if (goal.active) {
        _desiredCamPos.set(...goal.pos);
        _desiredTarget.set(...goal.target);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, 4.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, 4.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, 4.5, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, 4.5, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, 4.5, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, 4.5, dt);

        if (
          camera.position.distanceTo(_desiredCamPos) < 0.04 &&
          controls.target.distanceTo(_desiredTarget) < 0.04
        ) {
          goal.active = false;
        }
      }

      controls.autoRotate = !isSoftwareGl && autoOrbitRef.current && !goal.active;
      controls.update();

      // Animate focus light smoothly toward active neuron
      if (focusAssembly) {
        focusPointLight.position.lerp(focusAssembly.group.position, Math.min(1, dt * 6));
        focusPointLight.color.lerp(focusAssembly.baseColor, Math.min(1, dt * 6));
      }

      // Animate each primary 3D neuron assembly (scale, halo ring spin, emissive intensity)
      for (let i = 0; i < neuronAssemblies.length; i++) {
        const n = neuronAssemblies[i];
        const isFocus = i === focusIdx;
        const targetScale = isFocus ? 1.36 : 0.96;
        const nextScale = THREE.MathUtils.damp(n.group.scale.x, targetScale, 7, dt);
        n.group.scale.setScalar(nextScale);

        // Subtle organic float inside cranial volume
        const base = NEURON_POSITIONS[i];
        n.group.position.y = base[1] + Math.sin(elapsed * 1.15 + i * 1.3) * 0.045;

        n.ringOuter.rotation.z += dt * (isFocus ? 1.15 : 0.35);
        n.ringInner.rotation.y -= dt * (isFocus ? 0.95 : 0.28);

        const coreMat = n.coreMesh.material as THREE.MeshStandardMaterial;
        const memMat = n.membraneMesh.material as THREE.MeshPhysicalMaterial;
        coreMat.emissiveIntensity = THREE.MathUtils.damp(
          coreMat.emissiveIntensity,
          isFocus ? 3.2 : 1.9,
          8,
          dt
        );
        memMat.opacity = THREE.MathUtils.damp(memMat.opacity, isFocus ? 0.85 : 0.56, 8, dt);
      }

      // Update axonal edge brightness + action potential pulses
      let colorDirty = false;
      for (let eIdx = 0; eIdx < axonEdges.length; eIdx++) {
        const edge = axonEdges[eIdx];
        const isActiveEdge = edge.aIdx === focusIdx || edge.bIdx === focusIdx;
        edge.material.opacity = isActiveEdge ? 0.72 : 0.16;
        if (isActiveEdge && focusAssembly) {
          edge.material.color.copy(focusAssembly.baseColor);
        } else {
          edge.material.color.set('#5f7ec2');
        }

        for (let p = 0; p < pulsesPerEdge; p++) {
          const instIdx = eIdx * pulsesPerEdge + p;
          const speed = isActiveEdge ? 0.34 : 0.14;
          const u = (elapsed * speed + pulseOffsets[instIdx]) % 1;
          edge.curve.getPointAt(u, _pos);
          _scale.setScalar(isActiveEdge ? 1.45 : 0.8);
          _mat4.compose(_pos, _quat, _scale);
          pulsesMesh.setMatrixAt(instIdx, _mat4);

          if (isActiveEdge && focusAssembly) {
            _colorScratch.copy(focusAssembly.baseColor).lerp(_white, 0.45);
          } else {
            _colorScratch.set('#8db4ff');
          }
          pulsesMesh.setColorAt(instIdx, _colorScratch);
          colorDirty = true;
        }
      }
      pulsesMesh.instanceMatrix.needsUpdate = true;
      if (colorDirty && pulsesMesh.instanceColor) {
        pulsesMesh.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);
      updateProjectedLabels(mount.clientWidth, mount.clientHeight);
    };

    const scheduleNext = () => {
      if (disposed || document.hidden) return;
      if (isSoftwareGl) {
        afterDraw(
          renderer,
          () => {
            if (!disposed && !document.hidden) {
              renderFrame(performance.now());
              scheduleNext();
            }
          },
          registerTimer
        );
      } else {
        rafId = requestAnimationFrame((now) => {
          if (!disposed && !document.hidden) {
            renderFrame(now);
            scheduleNext();
          }
        });
      }
    };

    const handleVisibility = () => {
      if (!document.hidden && !disposed) {
        lastTimestamp = performance.now();
        renderFrame(lastTimestamp);
        scheduleNext();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (disposed || !mount) return;
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderFrame(performance.now());
    });
    resizeObserver.observe(mount);
    document.addEventListener('visibilitychange', handleVisibility);

    renderFrame(performance.now());
    scheduleNext();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      activeTimers.forEach((id) => window.clearTimeout(id));
      activeTimers.clear();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      controls.removeEventListener('start', onControlStart);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);

      controls.dispose();
      disposables.forEach((d) => d.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const applyPreset = (preset: CameraPreset) => {
    setActivePreset(preset.id);
    cameraGoalRef.current = {
      active: true,
      pos: preset.position,
      target: preset.target,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] sm:h-[650px] rounded-2xl border border-white/15 bg-[#070910] overflow-hidden shadow-[0_30px_90px_-30px_rgba(140,115,255,0.28)]"
    >
      {/* Isolated WebGL Mount Target */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Projected 3D Typography Labels Overlay (no 60fps React re-renders) */}
      <div aria-label="Neural threads" className="absolute inset-0 pointer-events-none">
        {MIND_NODES.map((node, i) => {
          const isFocus = i === activeFocusIdx;
          return (
            <button
              key={node.id}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              type="button"
              onMouseEnter={() => onHoverChange(i)}
              onMouseLeave={() => onHoverChange(null)}
              onFocus={() => onHoverChange(i)}
              onBlur={() => onHoverChange(null)}
              onClick={() => onSelectNeuron(i)}
              className="absolute top-0 left-0 flex flex-col items-center text-center cursor-pointer focus-visible:outline-none group"
              style={{
                willChange: 'transform, opacity',
              }}
            >
              <span
                style={{
                  color: isFocus ? node.color : '#f5f2fc',
                  textShadow:
                    '0 2px 12px rgba(4, 6, 12, 0.98), 0 0 22px rgba(4, 6, 12, 0.98)',
                }}
                className="font-display text-xs sm:text-[14px] font-semibold tracking-tight whitespace-nowrap transition-colors duration-200 px-1.5 py-0.5 rounded bg-[#070910]/65 border border-transparent group-hover:border-white/20"
              >
                {node.label}
              </span>
              <span
                style={{
                  textShadow: '0 1px 8px rgba(4, 6, 12, 0.98)',
                }}
                className={`hidden md:block text-[10px] whitespace-nowrap transition-opacity duration-200 mt-0.5 ${
                  isFocus ? 'text-[#e8e4f6] opacity-100' : 'text-[#a39fb8] opacity-80'
                }`}
              >
                {node.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subtle Top-Left 3D Interaction Hint */}
      <div className="pointer-events-none absolute top-3.5 left-4 flex items-center gap-2 text-xs text-[#a5a1b8]">
        <Sparkles className="w-3.5 h-3.5 text-[#c3b0f6]" />
        <span>Drag to orbit · Scroll to zoom · Click any neuron to open showcase</span>
      </div>

      {/* Compact Collapsible Bottom Control Dock (no backdrop-blur over WebGL, no pulse dots) */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        {controlsVisible ? (
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-[#0e111a]/95 shadow-2xl text-xs text-[#e4e1ef]">
            {CAMERA_PRESETS.map((preset) => {
              const active = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#c3b0f6] text-[#121520]'
                      : 'bg-[#171b29] text-[#c7c3d8] hover:text-white hover:bg-[#1f2438]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            <span aria-hidden="true" className="h-4 w-px bg-white/15 mx-0.5" />

            <button
              type="button"
              onClick={() => setShellVisible((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                shellVisible
                  ? 'bg-[#211d38] text-[#e1d4ff] border border-[#c3b0f6]/40'
                  : 'bg-[#171b29] text-[#a39fb8] hover:text-white border border-transparent'
              }`}
            >
              {shellVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Cortex</span>
            </button>

            <button
              type="button"
              onClick={() => setAutoOrbit((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                autoOrbit
                  ? 'bg-[#211d38] text-[#e1d4ff] border border-[#c3b0f6]/40'
                  : 'bg-[#171b29] text-[#a39fb8] hover:text-white border border-transparent'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Orbit</span>
            </button>

            <button
              type="button"
              onClick={() => setControlsVisible(false)}
              title="Hide controls (H)"
              className="px-2 py-1.5 rounded-lg text-[#9c99ad] hover:text-white hover:bg-[#171b29] transition-colors"
            >
              Hide
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setControlsVisible(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-[#0e111a]/95 text-xs font-medium text-[#d8d4e8] hover:text-white shadow-lg"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#c3b0f6]" />
            <span>3D Controls (H)</span>
          </button>
        )}
      </div>
    </div>
  );
};
