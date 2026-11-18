import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  afterDraw,
  createSculpturalBrainGroup,
  detectSoftwareWebGL,
} from '../three/proceduralBrain';

interface HomeBrain3DProps {
  onEnterMind: () => void;
  reducedMotion: boolean;
}

// Pre-allocated scratch math helpers for zero-GC animation ticks
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _mat4 = new THREE.Matrix4();

export const HomeBrain3D: React.FC<HomeBrain3DProps> = ({ onEnterMind, reducedMotion }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef(false);
  const reducedRef = useRef(reducedMotion);
  const pointerTiltRef = useRef({ x: 0, y: 0 });

  reducedRef.current = reducedMotion;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(3.25, 2.48, 3.85);
    camera.lookAt(0, 1.56, 0);

    // Procedural Studio IBL Environment on every device
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.72;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Key Directional Light (warm coral-ivory studio highlight) + Cool Hemisphere Fill + Rim
    const keyLight = new THREE.DirectionalLight('#fff2e6', 2.4);
    keyLight.position.set(4.5, 6.2, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -3.2;
    keyLight.shadow.camera.right = 3.2;
    keyLight.shadow.camera.top = 3.6;
    keyLight.shadow.camera.bottom = -2.4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#c3d8ff', '#161924', 0.52);
    scene.add(hemiLight);

    const rimLight = new THREE.PointLight('#c3b0f6', 5.5, 11, 2);
    rimLight.position.set(-2.6, 2.6, -2.8);
    scene.add(rimLight);

    const warmFill = new THREE.PointLight('#f5a9c8', 2.8, 9, 2);
    warmFill.position.set(2.4, 1.3, 2.6);
    scene.add(warmFill);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const brainAssembly = createSculpturalBrainGroup(maxAnisotropy, { ghostShell: false });
    brainAssembly.group.scale.setScalar(1.06);
    scene.add(brainAssembly.group);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let disposed = false;
    let rafId = 0;
    const activeTimers = new Set<number>();
    const registerTimer = (id: number) => activeTimers.add(id);

    let lastTimestamp = performance.now();
    let elapsed = 0;
    let yaw = -0.45;
    let currentScale = 1.06;
    let tiltX = 0;
    let tiltZ = 0;

    const updateSparks = (timeSec: number, pulseScale: number) => {
      const { sparksMesh, sparkCurves, sparkOffsets } = brainAssembly;
      const count = sparksMesh.count;
      for (let i = 0; i < count; i++) {
        const curve = sparkCurves[i % sparkCurves.length];
        const u = (timeSec * (hoveredRef.current ? 0.24 : 0.14) + sparkOffsets[i]) % 1;
        curve.getPointAt(u, _pos);
        const s = pulseScale * (0.75 + 0.45 * Math.sin(timeSec * 4.5 + i));
        _scale.setScalar(s);
        _mat4.compose(_pos, _quat, _scale);
        sparksMesh.setMatrixAt(i, _mat4);
      }
      sparksMesh.instanceMatrix.needsUpdate = true;
    };

    const renderFrame = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      const isReduced = reducedRef.current;
      if (!isReduced) {
        elapsed += dt;
        const targetYawSpeed = hoveredRef.current ? 0.92 : 0.52;
        yaw += dt * targetYawSpeed;
        brainAssembly.group.position.y = Math.sin(elapsed * 1.35) * 0.045;
      } else {
        brainAssembly.group.position.y = 0;
      }

      const targetScale = hoveredRef.current ? 1.11 : 1.06;
      currentScale = THREE.MathUtils.damp(currentScale, targetScale, 6, dt);
      brainAssembly.group.scale.setScalar(currentScale);

      const targetTiltX = isReduced ? 0 : pointerTiltRef.current.y * 0.16;
      const targetTiltZ = isReduced ? 0 : -pointerTiltRef.current.x * 0.16;
      tiltX = THREE.MathUtils.damp(tiltX, targetTiltX, 6, dt);
      tiltZ = THREE.MathUtils.damp(tiltZ, targetTiltZ, 6, dt);

      brainAssembly.group.rotation.y = yaw + (isReduced ? 0 : pointerTiltRef.current.x * 0.28);
      brainAssembly.group.rotation.x = tiltX;
      brainAssembly.group.rotation.z = tiltZ;

      updateSparks(elapsed, hoveredRef.current ? 1.25 : 1.0);
      renderer.render(scene, camera);
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

    // Initial render immediately
    renderFrame(performance.now());
    scheduleNext();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      activeTimers.forEach((id) => window.clearTimeout(id));
      activeTimers.clear();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);

      brainAssembly.disposables.forEach((d) => d.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    pointerTiltRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
    pointerTiltRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
  };

  return (
    <button
      type="button"
      onClick={onEnterMind}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        pointerTiltRef.current.x = 0;
        pointerTiltRef.current.y = 0;
      }}
      onFocus={() => {
        hoveredRef.current = true;
      }}
      onBlur={() => {
        hoveredRef.current = false;
      }}
      onPointerMove={handlePointerMove}
      aria-label="Enter Nishtha’s 3D brain: explore my interests and builds"
      className="group relative w-full text-center cursor-pointer rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6] p-1"
    >
      <div
        ref={mountRef}
        className="w-full aspect-square rounded-3xl overflow-hidden"
        style={{
          filter: 'drop-shadow(0 0 28px rgba(195, 176, 246, 0.2))',
        }}
      />
      <span className="mt-1 block text-base font-medium text-[#f3edf9]">
        Inside Nishtha’s brain
        <span className="block text-sm font-normal text-[#b7b5c6] mt-0.5 group-hover:text-[#f2f0f7] transition-colors">
          Click to explore
        </span>
      </span>
    </button>
  );
};
