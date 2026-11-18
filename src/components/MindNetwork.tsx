import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  ImagePlus,
  Sparkles,
  Trash2,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  MIND_NODES,
  CASE_STUDIES,
  CaseStudy,
  CaseLinksMap,
  MindPhotoSlot,
} from '../data/portfolioData';

interface MindNetworkProps {
  onExitMind: () => void;
  onOpenCase: (study: CaseStudy) => void;
  onOpenResume: () => void;
  caseLinks: CaseLinksMap;
  initialNodeId?: string | null;
  onConsumeInitialNode?: () => void;
}

export interface UploadedMindPhoto {
  id: string;
  slotId?: string;
  url: string;
  fileName: string;
  caption: string;
  alt: string;
  uploadedAt: string;
}

export interface MindNodePhotos {
  slots: Record<string, UploadedMindPhoto>;
  extra: UploadedMindPhoto[];
}

export type MindPhotosMap = Record<string, MindNodePhotos>;

interface LightboxItem {
  url: string;
  title: string;
  caption: string;
  alt: string;
}

function seededRandom(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function normalizeFileKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

function findMatchingSlotAcrossNodes(
  fileName: string,
  fallbackNodeId: string
): { nodeId: string; slot?: MindPhotoSlot } {
  const clean = normalizeFileKey(fileName);
  const cleanNoExt = clean.replace(/\.[^.]+$/, '');

  for (const node of MIND_NODES) {
    if (!node.photoSlots) continue;
    for (const slot of node.photoSlots) {
      for (const expected of slot.expectedFilenames) {
        const expClean = normalizeFileKey(expected);
        const expNoExt = expClean.replace(/\.[^.]+$/, '');
        if (clean === expClean || cleanNoExt === expNoExt) {
          return { nodeId: node.id, slot };
        }
      }
    }
  }

  for (const node of MIND_NODES) {
    if (!node.photoSlots) continue;
    for (const slot of node.photoSlots) {
      for (const expected of slot.expectedFilenames) {
        const expClean = normalizeFileKey(expected);
        if (expClean.length >= 5 && !expClean.includes('.') && cleanNoExt.includes(expClean)) {
          return { nodeId: node.id, slot };
        }
      }
    }
  }

  return { nodeId: fallbackNodeId };
}

async function prepareImageDataUrl(file: File): Promise<string> {
  if (file.size <= 1_200_000) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Invalid image file.'));
      image.src = objectUrl;
    });

    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable.');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.88);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export const MindNetwork: React.FC<MindNetworkProps> = ({
  onExitMind,
  onOpenCase,
  onOpenResume,
  caseLinks,
  initialNodeId,
  onConsumeInitialNode,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [mindPhotos, setMindPhotos] = useState<MindPhotosMap>({});
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<LightboxItem | null>(null);
  const [dragSlotId, setDragSlotId] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const batchInputRef = useRef<HTMLInputElement | null>(null);
  const slotInputRef = useRef<HTMLInputElement | null>(null);
  const pendingSlotRef = useRef<{ nodeId: string; slot: MindPhotoSlot } | null>(null);

  const activeFocusIdx = hoveredIdx !== null ? hoveredIdx : selectedIdx;
  const activeFocusRef = useRef(activeFocusIdx);
  activeFocusRef.current = activeFocusIdx;
  const selectedNode = MIND_NODES[selectedIdx];
  const nodePhotos = mindPhotos[selectedNode.id] ?? { slots: {}, extra: [] };
  const featuredCases = CASE_STUDIES.filter((c) => selectedNode.featuredCaseIds.includes(c.id));
  const flagshipNodes = MIND_NODES.filter((n) => n.featuredFlagship);
  const threadNodes = MIND_NODES.filter((n) => !n.featuredFlagship);

  useEffect(() => {
    if (!initialNodeId) return;
    const idx = MIND_NODES.findIndex((n) => n.id === initialNodeId);
    if (idx !== -1) {
      setSelectedIdx(idx);
      setUploadStatus(null);
      setModalOpen(true);
    }
    onConsumeInitialNode?.();
  }, [initialNodeId, onConsumeInitialNode]);

  useEffect(() => {
    fetch('/api/mind-photos')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: MindPhotosMap) => {
        if (data && typeof data === 'object') {
          setMindPhotos(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (lightboxItem) {
        setLightboxItem(null);
      } else if (modalOpen) {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxItem, modalOpen]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const anchorCount = MIND_NODES.length;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = 0;
    let w = 0;
    let h = 0;
    let anchors: { x: number; y: number }[] = [];
    let edges: [number, number][] = [];
    let dendrites: { x: number; y: number; endX: number; endY: number; depth: number }[][] = [];

    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      w = bounds.width;
      h = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      anchors = MIND_NODES.map((node, i) => {
        const el = orbRefs.current[i];
        if (el) {
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 - bounds.left,
            y: r.top + 14 - bounds.top,
          };
        }
        return { x: (node.xPercent / 100) * w, y: (node.yPercent / 100) * h };
      });

      const ambientCount = w < 650 ? 55 : 90;
      for (let i = 0; i < ambientCount; i++) {
        anchors.push({
          x: w * (0.06 + seededRandom(i + 2) * 0.88),
          y: h * (0.08 + seededRandom(i + 90) * 0.82),
        });
      }

      edges = [];
      anchors.forEach((p, i) => {
        const nearby = anchors
          .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
          .filter((a) => a.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, i < anchorCount ? 6 : 2);
        nearby.forEach(({ j }) => {
          if (i < j || i < anchorCount) edges.push([i, j]);
        });
      });

      dendrites = anchors.map((_, index) => {
        const isPrimary = index < anchorCount;
        const branches: { x: number; y: number; endX: number; endY: number; depth: number }[] = [];
        const branch = (
          x: number,
          y: number,
          angle: number,
          length: number,
          depth: number,
          seed: number
        ) => {
          const endX = x + Math.cos(angle) * length;
          const endY = y + Math.sin(angle) * length;
          branches.push({ x, y, endX, endY, depth });
          if (depth > 0) {
            branch(
              endX,
              endY,
              angle - 0.36 - seededRandom(seed) * 0.45,
              length * 0.66,
              depth - 1,
              seed + 11
            );
            branch(
              endX,
              endY,
              angle + 0.36 + seededRandom(seed + 1) * 0.45,
              length * 0.62,
              depth - 1,
              seed + 23
            );
          }
        };
        const count = isPrimary ? 8 : 3 + Math.floor(seededRandom(index + 11) * 3);
        for (let r = 0; r < count; r++) {
          const baseLength = isPrimary
            ? 24 + seededRandom(index * 9 + r) * 20
            : 12 + seededRandom(index * 7 + r) * 18;
          branch(
            0,
            0,
            (r / count) * Math.PI * 2 + seededRandom(index) * 2,
            baseLength,
            2,
            index * 17 + r
          );
        }
        return branches;
      });

      if (reduced.matches) draw(0);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const moving = anchors.map((p, i) =>
        i < anchorCount || reduced.matches
          ? p
          : {
              x: p.x + Math.sin(time * 0.00045 + i * 1.7) * 7,
              y: p.y + Math.cos(time * 0.00055 + i * 1.3) * 9,
            }
      );

      // Subtle dendritic arbors from primary neurons
      const currentFocusIdx = activeFocusRef.current;
      for (let idx = 0; idx < anchorCount; idx++) {
        const p = moving[idx];
        const node = MIND_NODES[idx];
        if (!p || !node) continue;
        const [r, g, b] = hexToRgb(node.color);
        const isFocus = idx === currentFocusIdx;
        const pulse = reduced.matches ? 0.45 : (Math.sin(time * 0.0014 + idx * 1.1) + 1) / 2;

        // Calm, restrained ambient halo
        const auraRadius = isFocus ? 42 + pulse * 6 : 28 + pulse * 4;
        const aura = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, auraRadius);
        aura.addColorStop(0, `rgba(${r},${g},${b},${isFocus ? 0.24 : 0.11})`);
        aura.addColorStop(0.55, `rgba(${r},${g},${b},${isFocus ? 0.09 : 0.03})`);
        aura.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(p.x, p.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Delicate dendritic filaments
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(reduced.matches ? 0 : Math.sin(time * 0.00025 + idx) * 0.04);
        dendrites[idx]?.forEach((branchItem) => {
          ctx.beginPath();
          ctx.moveTo(branchItem.x, branchItem.y);
          ctx.quadraticCurveTo(
            branchItem.x + (branchItem.endX - branchItem.x) * 0.45 - 3,
            branchItem.y + (branchItem.endY - branchItem.y) * 0.65,
            branchItem.endX,
            branchItem.endY
          );
          ctx.strokeStyle = `rgba(${r},${g},${b},${
            (isFocus ? 0.26 : 0.11 + pulse * 0.06) * ((branchItem.depth + 1) / 3)
          })`;
          ctx.lineWidth = (isFocus ? 0.65 : 0.45) + branchItem.depth * 0.25;
          ctx.stroke();
        });
        ctx.restore();
      }

      // Fine background dendritic arbors
      moving.slice(anchorCount).forEach((p, n) => {
        const i = n + anchorCount;
        const activity = reduced.matches ? 0.3 : (Math.sin(time * 0.0012 + n * 0.8) + 1) / 2;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(reduced.matches ? 0 : Math.sin(time * 0.0002 + n) * 0.04);
        dendrites[i]?.forEach((b) => {
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.quadraticCurveTo(
            b.x + (b.endX - b.x) * 0.35 - 3,
            b.y + (b.endY - b.y) * 0.7,
            b.endX,
            b.endY
          );
          ctx.strokeStyle = `rgba(${n % 2 === 0 ? '186,174,230' : '142,165,204'},${
            (0.06 + activity * 0.1) * ((b.depth + 1) / 3)
          })`;
          ctx.lineWidth = 0.35 + b.depth * 0.25;
          ctx.stroke();
        });
        ctx.restore();
      });

      // Quiet axonal filaments & gentle pulses
      edges.forEach(([i, j], k) => {
        const a = moving[i];
        const b = moving[j];
        if (!a || !b) return;
        const active = i === currentFocusIdx || j === currentFocusIdx;
        const focusColor = '#c3b0f6';

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(
          a.x + (b.x - a.x) * 0.35,
          a.y - 16,
          b.x - (b.x - a.x) * 0.3,
          b.y + 16,
          b.x,
          b.y
        );
        const glow = reduced.matches
          ? 0.35
          : 0.25 + 0.55 * Math.pow((Math.sin(time * 0.0014 + k * 0.9) + 1) / 2, 3);
        ctx.strokeStyle = active
          ? `rgba(195,176,246,${0.26 + glow * 0.28})`
          : `rgba(148,166,204,${0.08 + glow * 0.12})`;
        ctx.lineWidth = active ? 1.3 : 0.8;
        ctx.shadowColor = active ? focusColor : 'transparent';
        ctx.shadowBlur = active ? 6 : 0;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (!reduced.matches && (k % 3 === 0 || active)) {
          const t = (time * (active ? 0.00022 : 0.00016) + k * 0.13) % 1;
          const u = 1 - t;
          const x =
            u * u * u * a.x +
            3 * u * u * t * (a.x + (b.x - a.x) * 0.35) +
            3 * u * t * t * (b.x - (b.x - a.x) * 0.3) +
            t * t * t * b.x;
          const y =
            u * u * u * a.y +
            3 * u * u * t * (a.y - 16) +
            3 * u * t * t * (b.y + 16) +
            t * t * t * b.y;
          ctx.beginPath();
          ctx.arc(x, y, active ? 2.2 : 1.4, 0, Math.PI * 2);
          ctx.fillStyle = active ? 'rgba(225,215,252,0.85)' : 'rgba(155,172,204,0.45)';
          ctx.fill();
        }
      });

      // Quiet ambient starlight somas
      moving.slice(anchorCount).forEach((p, i) => {
        const pulse = reduced.matches
          ? 0.4
          : Math.pow((Math.sin(time * 0.0015 + i * 1.9) + 1) / 2, 3);
        const radius = 1.1 + seededRandom(i) * 1.2 + pulse * 1.4;
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9 + pulse * 6);
        halo.addColorStop(0, `rgba(182,168,228,${0.1 + pulse * 0.16})`);
        halo.addColorStop(1, 'rgba(140,165,210,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${i % 2 ? '176,196,232' : '202,186,240'},${0.25 + pulse * 0.38})`;
        ctx.fill();
      });

      if (!reduced.matches && !document.hidden) {
        frameId = requestAnimationFrame(draw);
      }
    };

    const start = () => {
      cancelAnimationFrame(frameId);
      resize();
      if (!reduced.matches && !document.hidden) {
        frameId = requestAnimationFrame(draw);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    reduced.addEventListener('change', start);
    document.addEventListener('visibilitychange', start);
    start();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      reduced.removeEventListener('change', start);
      document.removeEventListener('visibilitychange', start);
    };
  }, []);

  const openNeuronModal = (idx: number) => {
    setSelectedIdx(idx);
    setUploadStatus(null);
    setModalOpen(true);
  };

  const handlePrimaryCta = () => {
    setModalOpen(false);
    if (selectedNode.targetRoute === 'resume') {
      onOpenResume();
      return;
    }
    const found = CASE_STUDIES.find((c) => c.id === selectedNode.targetId);
    if (found) onOpenCase(found);
  };

  const uploadSinglePhoto = async (
    file: File,
    targetNodeId: string,
    slot?: MindPhotoSlot
  ): Promise<boolean> => {
    const dataUrl = await prepareImageDataUrl(file);
    const resp = await fetch('/api/mind-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodeId: targetNodeId,
        slotId: slot?.id,
        fileName: file.name,
        caption: slot?.caption ?? file.name.replace(/\.[^.]+$/, ''),
        alt: slot?.alt ?? file.name.replace(/\.[^.]+$/, ''),
        dataUrl,
      }),
    });
    if (!resp.ok) return false;
    const json = (await resp.json()) as { photos?: MindPhotosMap };
    if (json.photos) setMindPhotos(json.photos);
    return true;
  };

  const handleBatchFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadStatus(null);
    let savedCount = 0;

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const matched = findMatchingSlotAcrossNodes(file.name, selectedNode.id);
        const ok = await uploadSinglePhoto(file, matched.nodeId, matched.slot);
        if (ok) savedCount += 1;
      }
      setUploadStatus(
        savedCount > 0
          ? `Saved ${savedCount} photo${savedCount > 1 ? 's' : ''} to your brain gallery.`
          : 'No supported image files were uploaded.'
      );
    } catch {
      setUploadStatus('Some files could not be saved. Try JPG, PNG, or WEBP.');
    } finally {
      setUploading(false);
    }
  };

  const handleSlotFileChange = async (files: FileList | null) => {
    const target = pendingSlotRef.current;
    pendingSlotRef.current = null;
    if (!files || files.length === 0 || !target) return;
    setUploading(true);
    setUploadStatus(null);

    try {
      const ok = await uploadSinglePhoto(files[0], target.nodeId, target.slot);
      if (ok) {
        setUploadStatus(`Added photo for “${target.slot.title}”.`);
      } else {
        setUploadStatus('Upload failed. Please try a JPG, PNG, or WEBP photo.');
      }
    } catch {
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (slotId?: string, photoId?: string) => {
    try {
      const resp = await fetch('/api/mind-photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: selectedNode.id,
          slotId,
          photoId,
        }),
      });
      if (resp.ok) {
        const json = (await resp.json()) as { photos?: MindPhotosMap };
        if (json.photos) setMindPhotos(json.photos);
      }
    } catch {
      // Ignore transient delete error
    }
  };

  const hasPhotoGallerySection =
    Boolean(selectedNode.photoSlots?.length) || nodePhotos.extra.length > 0;

  return (
    <section
      aria-labelledby="neural-title"
      className="animate-iris-in min-h-[calc(100vh-6rem)] bg-[#0c0e15] text-[#f2f0f7] py-10 md:py-14"
    >
      <div className="max-w-[1280px] mx-auto px-[6%] space-y-8">
        <button
          type="button"
          onClick={onExitMind}
          className="inline-flex items-center gap-2 text-sm text-[#b7b5c6] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to the outside world</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="uppercase text-[13px] tracking-[2px] font-semibold text-[#c3b0f6]">
              Inside Nishtha’s brain
            </div>
            <h1
              id="neural-title"
              className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-white"
            >
              A few things on my mind.
            </h1>
            <p className="text-base text-[#b7b5c6]">
              Click any node to open what I built, ventures like NightShift AI &amp;
              Entrepreneurship, and the real photos behind them.
            </p>
          </div>

          <button
            type="button"
            disabled={uploading}
            onClick={() => batchInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 bg-[#141827] hover:bg-[#1e2438] text-xs sm:text-sm font-medium text-[#f2f0f7] transition-colors self-start md:self-auto shrink-0 disabled:opacity-50"
          >
            <ImagePlus className="w-4 h-4 text-[#c3b0f6]" />
            <span>{uploading ? 'Assigning photos…' : 'Auto-assign photos'}</span>
          </button>
        </div>

        {uploadStatus && !modalOpen && (
          <p className="text-xs sm:text-sm text-[#d0bdfb] bg-[#161926] border border-[#c3b0f6]/35 rounded-xl px-4 py-2.5">
            {uploadStatus}
          </p>
        )}

        {/* Calm Neural Stage */}
        <div
          ref={stageRef}
          className="relative w-full h-[520px] sm:h-[580px] rounded-2xl border border-white/12 bg-[#090b12] overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {MIND_NODES.map((node, i) => {
            const active = i === activeFocusIdx;
            const isFlagship = Boolean(node.featuredFlagship);
            return (
              <button
                key={node.id}
                ref={(el) => {
                  orbRefs.current[i] = el;
                }}
                type="button"
                aria-label={`Open ${node.label} — ${node.subtitle}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(i)}
                onBlur={() => setHoveredIdx(null)}
                onClick={() => openNeuronModal(i)}
                style={{
                  left: `${node.xPercent}%`,
                  top: `${node.yPercent}%`,
                }}
                className="group absolute -translate-x-1/2 -translate-y-3.5 flex flex-col items-center cursor-pointer focus-visible:outline-none z-10"
              >
                {/* Calm Minimal Soma Node (Flagship nodes get a slightly larger gentle beacon) */}
                <span
                  className={`relative flex items-center justify-center ${
                    isFlagship ? 'w-10 h-10' : 'w-8 h-8'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      borderColor: active
                        ? 'rgba(195,176,246,0.85)'
                        : isFlagship
                          ? 'rgba(195,176,246,0.45)'
                          : 'rgba(255,255,255,0.22)',
                      backgroundColor: active
                        ? 'rgba(195,176,246,0.16)'
                        : isFlagship
                          ? 'rgba(195,176,246,0.08)'
                          : 'rgba(18,21,32,0.55)',
                      boxShadow: active
                        ? '0 0 20px rgba(195,176,246,0.4)'
                        : isFlagship
                          ? '0 0 14px rgba(195,176,246,0.2)'
                          : 'none',
                    }}
                    className={`absolute inset-0 rounded-full border transition-all duration-300 ${
                      active ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      backgroundColor: active ? '#e9e2ff' : node.color,
                      boxShadow: active || isFlagship ? `0 0 10px ${node.color}99` : 'none',
                    }}
                    className={`relative block rounded-full transition-transform duration-300 ${
                      isFlagship ? 'w-3 h-3' : 'w-2.5 h-2.5'
                    } ${active ? 'scale-115' : 'group-hover:scale-115'}`}
                  />
                </span>

                {/* Clean Minimal Typography Label */}
                <span className="mt-1.5 flex flex-col items-center text-center pointer-events-none select-none">
                  <span
                    style={{
                      textShadow: '0 2px 10px rgba(6, 8, 14, 0.96)',
                    }}
                    className={`font-display tracking-tight whitespace-nowrap transition-colors duration-200 ${
                      isFlagship
                        ? 'text-xs sm:text-[15px] font-semibold'
                        : 'text-xs sm:text-sm font-medium'
                    } ${active ? 'text-[#e5dcff]' : isFlagship ? 'text-white' : 'text-[#d8d4e8] group-hover:text-white'}`}
                  >
                    {node.label}
                  </span>
                  <span
                    style={{
                      textShadow: '0 1px 8px rgba(6, 8, 14, 0.96)',
                    }}
                    className={`hidden sm:block text-[11px] whitespace-nowrap transition-opacity duration-200 ${
                      isFlagship ? 'text-[#b7aee0]' : 'text-[#8f93ab]'
                    } ${
                      active
                        ? 'opacity-100'
                        : isFlagship
                          ? 'opacity-75 group-hover:opacity-100'
                          : 'opacity-0 group-hover:opacity-90'
                    }`}
                  >
                    {node.subtitle}
                  </span>
                </span>
              </button>
            );
          })}

          <span className="absolute bottom-3.5 left-4 text-xs text-[#8c869a] pointer-events-none flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#b4a9d8]" />
            <span>Select any node to view built work &amp; assigned photos</span>
          </span>
          <span className="hidden sm:block absolute bottom-3.5 right-4 text-xs text-[#7c788a] pointer-events-none">
            An evolving map of my curiosity
          </span>
        </div>

        {/* Prominent Flagship Spotlights: NightShift AI & Entrepreneurship */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[1.8px] font-semibold text-[#c3b0f6]">
            Flagship ventures · NightShift AI &amp; Entrepreneurship
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flagshipNodes.map((node) => {
              const idx = MIND_NODES.findIndex((n) => n.id === node.id);
              const isSelected = modalOpen && idx === selectedIdx;
              const uploadedCount = Object.keys(mindPhotos[node.id]?.slots || {}).length +
                (mindPhotos[node.id]?.extra.length || 0);
              return (
                <button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => openNeuronModal(idx)}
                  style={{
                    borderColor: isSelected ? 'rgba(195,176,246,0.75)' : 'rgba(195,176,246,0.28)',
                    backgroundImage:
                      'linear-gradient(135deg, rgba(195,176,246,0.1) 0%, #141827 55%, #111420 100%)',
                  }}
                  className="text-left rounded-2xl border p-6 transition-all flex items-start justify-between gap-4 group hover:border-[#c3b0f6]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6]"
                >
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: node.color }}
                        className="w-2.5 h-2.5 rounded-full"
                      />
                      <span className="uppercase text-[11px] tracking-[1.6px] font-semibold text-[#d0bdfb]">
                        {node.categoryBadge || node.subtitle}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-medium text-white group-hover:text-[#e5dcff] transition-colors">
                      {node.label}
                      <span className="text-[#c3b0f6]">.</span>
                    </h2>
                    <p className="text-sm text-[#c7c4d6] leading-relaxed line-clamp-2">
                      {node.summary}
                    </p>
                    <div className="text-xs text-[#b4a9d8] pt-1">
                      {node.highlights?.length || 0} founder milestones ·{' '}
                      {node.photoSlots?.length || 0} photo slots
                      {uploadedCount > 0 ? ` (${uploadedCount} added)` : ''}
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[#c3b0f6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 transition-transform mt-1" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean 4-col × 2-row Index Below */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[1.8px] font-semibold text-[#8c869a]">
            All other threads · click any to open
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {threadNodes.map((node) => {
              const i = MIND_NODES.findIndex((n) => n.id === node.id);
              const isSelected = modalOpen && i === selectedIdx;
              const itemCount =
                node.featuredCaseIds.length +
                (node.workHighlights?.length || 0) +
                (node.highlights?.length || 0);
              return (
                <button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => openNeuronModal(i)}
                  style={{
                    borderColor: isSelected ? 'rgba(195,176,246,0.55)' : 'rgba(255,255,255,0.1)',
                  }}
                  className="text-left rounded-xl border bg-[#121520] hover:bg-[#161a28] p-4 transition-all flex items-start justify-between gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6]"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: node.color }}
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 opacity-85"
                    />
                    <div className="min-w-0">
                      <div className="font-display text-base font-medium text-[#f2f0f7] group-hover:text-[#d0bdfb] transition-colors">
                        {node.label}
                      </div>
                      <div className="text-xs text-[#9c99ad] truncate">{node.subtitle}</div>
                      <div className="text-[11px] text-[#b4a9d8] mt-1.5">
                        {itemCount} highlight{itemCount !== 1 ? 's' : ''}
                        {node.photoSlots?.length ? ` · ${node.photoSlots.length} photos` : ''}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#7c788a] group-hover:text-[#d0bdfb] shrink-0 mt-1 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Opened Showcase Modal Box on Neuron Click */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="neuron-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#121520] text-[#f2f0f7] border border-white/15 shadow-2xl">
            {/* Calm Dark Header Band */}
            <div
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(195, 176, 246, 0.08) 0%, #161924 60%, #121520 100%)',
              }}
              className="sticky top-0 z-20 px-6 sm:px-9 py-6 border-b border-white/15 backdrop-blur-md space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 max-w-[64ch]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: selectedNode.color }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span className="uppercase text-[11px] tracking-[1.8px] font-semibold text-[#c7c3d8]">
                      {selectedNode.subtitle}
                    </span>
                    <span className="text-xs font-mono-tabular text-[#8c869a]">
                      · {String(selectedIdx + 1).padStart(2, '0')} /{' '}
                      {String(MIND_NODES.length).padStart(2, '0')}
                    </span>
                  </div>
                  <h2
                    id="neuron-modal-title"
                    className="font-display text-2xl sm:text-4xl font-medium tracking-tight text-white"
                  >
                    {selectedNode.label}
                  </h2>
                  <p className="text-sm sm:text-base text-[#d2cfe0] leading-relaxed">
                    {selectedNode.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label="Previous neuron"
                    onClick={() => {
                      setUploadStatus(null);
                      setSelectedIdx((prev) => (prev - 1 + MIND_NODES.length) % MIND_NODES.length);
                    }}
                    className="w-9 h-9 rounded-full border border-white/15 bg-[#181c2b] text-[#d8d4e8] hover:text-white hover:border-white/35 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next neuron"
                    onClick={() => {
                      setUploadStatus(null);
                      setSelectedIdx((prev) => (prev + 1) % MIND_NODES.length);
                    }}
                    className="w-9 h-9 rounded-full border border-white/15 bg-[#181c2b] text-[#d8d4e8] hover:text-white hover:border-white/35 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Close neuron details"
                    onClick={() => setModalOpen(false)}
                    className="w-9 h-9 rounded-full border border-white/15 bg-[#181c2b] text-white hover:bg-[#242a40] flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-9 space-y-8">
              {/* Built Work & Relevant Case Screenshots (only rendered when this node owns cases or work highlights) */}
              {(featuredCases.length > 0 || (selectedNode.workHighlights && selectedNode.workHighlights.length > 0)) && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="uppercase text-[11px] tracking-[1.8px] font-semibold text-[#c3b0f6]">
                      {featuredCases.length > 0 ? 'What I built & led' : 'Highlights & notes'}
                    </span>
                    <button
                      type="button"
                      onClick={handlePrimaryCta}
                      className="text-xs sm:text-sm text-[#d0bdfb] underline underline-offset-4 hover:text-white transition-colors"
                    >
                      {selectedNode.ctaLabel}
                    </button>
                  </div>

                  {featuredCases.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {featuredCases.map((project) => {
                        const custom = caseLinks[project.id] || {};
                        const lovableUrl =
                          custom.lovableUrl !== undefined
                            ? custom.lovableUrl
                            : project.defaultLovableUrl;
                        const githubUrl = custom.githubUrl;

                        return (
                          <article
                            key={project.id}
                            className="rounded-xl border border-white/15 bg-[#161924] overflow-hidden flex flex-col justify-between"
                          >
                            <div>
                              {/* Real Screenshot OR Workflow Diagram */}
                              {project.imageSrc ? (
                                <div className="relative aspect-[16/10] w-full bg-[#0a0c13] border-b border-white/10 overflow-hidden group">
                                  <img
                                    src={project.imageSrc}
                                    alt={project.imageAlt || project.title}
                                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                                  />
                                  <button
                                    type="button"
                                    aria-label={`Zoom screenshot of ${project.title}`}
                                    onClick={() =>
                                      setLightboxItem({
                                        url: project.imageSrc!,
                                        title: project.title,
                                        caption: project.imageCaption || project.summary,
                                        alt: project.imageAlt || project.title,
                                      })
                                    }
                                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-black flex items-center justify-center transition-opacity"
                                  >
                                    <ZoomIn className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : project.isWorkflowPreview ? (
                                <div className="p-4 bg-gradient-to-br from-[#191d2d] to-[#111420] border-b border-white/10 grid grid-cols-3 gap-2">
                                  <div className="rounded-lg bg-[#0d1018] border border-white/10 p-2.5">
                                    <div className="text-[11px] font-semibold text-white">Target</div>
                                    <div className="text-[10px] text-[#9c99ad] mt-0.5">
                                      Offer + context
                                    </div>
                                  </div>
                                  <div className="rounded-lg bg-[#0d1018] border border-white/10 p-2.5">
                                    <div className="text-[11px] font-semibold text-white">Rank</div>
                                    <div className="text-[10px] text-[#9c99ad] mt-0.5">
                                      Pain points &amp; openers
                                    </div>
                                  </div>
                                  <div className="rounded-lg bg-[#0d1018] border border-white/10 p-2.5">
                                    <div className="text-[11px] font-semibold text-white">Verify</div>
                                    <div className="text-[10px] text-[#9c99ad] mt-0.5">
                                      LinkedIn search link
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              <div className="p-4 sm:p-5 space-y-2">
                                <div className="flex items-center justify-between gap-2 text-[11px] text-[#9c99ad]">
                                  <span className="uppercase tracking-[1.4px]">{project.label}</span>
                                  <span>{project.tags.slice(0, 2).join(' · ')}</span>
                                </div>
                                <h3 className="font-display text-lg font-medium text-white">
                                  {project.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-[#b7b5c6] leading-relaxed">
                                  {project.summary}
                                </p>
                              </div>
                            </div>

                            <div className="px-4 sm:px-5 pb-4 pt-2 flex flex-wrap items-center gap-3 border-t border-white/8">
                              <button
                                type="button"
                                onClick={() => {
                                  setModalOpen(false);
                                  onOpenCase(project);
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-[#c3b0f6] text-[#161924] text-xs font-semibold hover:bg-[#d7c9fb] transition-colors"
                              >
                                Read case study
                              </button>
                              {lovableUrl && (
                                <a
                                  href={lovableUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-[#d0bdfb] hover:text-white underline underline-offset-4"
                                >
                                  <span>{project.lovableLabel || 'Live app'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {githubUrl && (
                                <a
                                  href={githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-[#d0bdfb] hover:text-white underline underline-offset-4"
                                >
                                  <Github className="w-3 h-3" />
                                  <span>GitHub</span>
                                </a>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {/* Work / Experience Highlights connected to this neuron */}
                  {selectedNode.workHighlights && selectedNode.workHighlights.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {selectedNode.workHighlights.map((work) => (
                        <div
                          key={work.title}
                          className="rounded-xl border border-white/12 bg-[#0e111a] p-4 space-y-1.5"
                        >
                          <div className="text-xs font-semibold text-white">{work.title}</div>
                          <div className="text-[11px] text-[#c3b0f6]">{work.role}</div>
                          <p className="text-xs text-[#b7b5c6] leading-relaxed">{work.summary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Campus / Community Milestones */}
              {selectedNode.highlights && selectedNode.highlights.length > 0 && (
                <div className="space-y-3 border-t border-white/12 pt-6">
                  <span className="uppercase text-[11px] tracking-[1.6px] font-semibold text-[#a89aba] block">
                    KEY MILESTONES
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {selectedNode.highlights.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/10 bg-[#0e111a] px-4 py-3 space-y-1"
                      >
                        <div className="text-xs font-semibold text-white">{item.label}</div>
                        <div className="text-xs text-[#b7b5c6] leading-relaxed">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3-Step Thought Story */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/12 pt-6">
                <div>
                  <span className="block text-[10px] tracking-[1.5px] text-[#a89aba] uppercase">
                    THE SPARK
                  </span>
                  <p className="text-sm text-[#e4e1ef] mt-2 leading-relaxed">
                    {selectedNode.thoughtStory.spark}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] tracking-[1.5px] text-[#a89aba] uppercase">
                    WHAT I TRIED
                  </span>
                  <p className="text-sm text-[#e4e1ef] mt-2 leading-relaxed">
                    {selectedNode.thoughtStory.tried}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] tracking-[1.5px] text-[#a89aba] uppercase">
                    WHAT’S NEXT
                  </span>
                  <p className="text-sm text-[#e4e1ef] mt-2 leading-relaxed">
                    {selectedNode.thoughtStory.next}
                  </p>
                </div>
              </div>

              {/* Moments & Photos Gallery */}
              {hasPhotoGallerySection && (
                <div className="border-t border-white/12 pt-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="uppercase text-[10px] tracking-[1.5px] text-[#a89aba] block">
                        MOMENTS &amp; PHOTOS
                      </span>
                      <p className="text-xs text-[#9c99ad] mt-1">
                        Attach your photos individually or in a batch — filenames automatically map to
                        Education, SideQuest Yale, Twin Sister &amp; Family, and Travel.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => batchInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/20 bg-[#181c2b] hover:bg-[#22273c] text-xs font-medium text-white transition-colors disabled:opacity-50"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>{uploading ? 'Saving…' : 'Add / match photos'}</span>
                    </button>
                  </div>

                  {uploadStatus && (
                    <p className="text-xs text-[#d0bdfb] bg-[#1a1829] border border-[#a89bea]/30 rounded-lg px-3.5 py-2">
                      {uploadStatus}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedNode.photoSlots?.map((slot) => {
                      const uploaded = nodePhotos.slots[slot.id];
                      if (uploaded) {
                        return (
                          <figure
                            key={slot.id}
                            className="group relative rounded-xl border border-white/15 bg-[#0e111a] overflow-hidden flex flex-col"
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                              <img
                                src={uploaded.url}
                                alt={slot.alt}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2.5 gap-1.5">
                                <button
                                  type="button"
                                  aria-label={`View ${slot.title} larger`}
                                  onClick={() =>
                                    setLightboxItem({
                                      url: uploaded.url,
                                      title: slot.title,
                                      caption: slot.caption,
                                      alt: slot.alt,
                                    })
                                  }
                                  className="w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center"
                                >
                                  <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Remove ${slot.title}`}
                                  onClick={() => handleDeletePhoto(slot.id)}
                                  className="w-8 h-8 rounded-full bg-black/70 text-red-200 hover:bg-red-900/90 flex items-center justify-center"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <figcaption className="p-3.5 space-y-1 flex-1">
                              <div className="text-xs font-semibold text-white">{slot.title}</div>
                              <p className="text-xs text-[#b7b5c6] leading-relaxed">
                                {slot.caption}
                              </p>
                            </figcaption>
                          </figure>
                        );
                      }

                      const isDragged = dragSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragSlotId(slot.id);
                          }}
                          onDragLeave={() => setDragSlotId(null)}
                          onDrop={async (e) => {
                            e.preventDefault();
                            setDragSlotId(null);
                            const file = e.dataTransfer.files?.[0];
                            if (!file || !file.type.startsWith('image/')) return;
                            setUploading(true);
                            try {
                              const ok = await uploadSinglePhoto(file, selectedNode.id, slot);
                              setUploadStatus(
                                ok
                                  ? `Assigned photo to “${slot.title}”.`
                                  : 'Upload failed. Please try a JPG, PNG, or WEBP photo.'
                              );
                            } finally {
                              setUploading(false);
                            }
                          }}
                          onClick={() => {
                            pendingSlotRef.current = { nodeId: selectedNode.id, slot };
                            slotInputRef.current?.click();
                          }}
                          className={`text-left rounded-xl border border-dashed transition-all overflow-hidden flex flex-col group ${
                            isDragged
                              ? 'border-[#c3b0f6] bg-[#1a1f33]'
                              : 'border-white/20 bg-[#0d1018]/80 hover:border-[#d0bdfb]/60 hover:bg-[#141827]'
                          }`}
                        >
                          <div className="aspect-[4/3] w-full flex flex-col items-center justify-center gap-2 px-4 text-center border-b border-white/10 bg-[#0a0c13]">
                            <div className="w-10 h-10 rounded-full border border-white/15 bg-[#161924] flex items-center justify-center text-[#b7b5c6] group-hover:text-white group-hover:border-[#d0bdfb]/50 transition-colors">
                              <ImagePlus className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium text-[#e4e1ef]">
                              Drop or click · {slot.title}
                            </span>
                            <span className="text-[11px] font-mono-tabular text-[#8c869a] truncate max-w-full">
                              {slot.expectedFilenames[0]}
                            </span>
                          </div>
                          <div className="p-3.5 space-y-1">
                            <div className="text-xs font-semibold text-white">{slot.title}</div>
                            <p className="text-xs text-[#9c99ad] leading-relaxed">{slot.caption}</p>
                          </div>
                        </button>
                      );
                    })}

                    {nodePhotos.extra.map((photo) => (
                      <figure
                        key={photo.id}
                        className="group relative rounded-xl border border-white/15 bg-[#0e111a] overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                          <img
                            src={photo.url}
                            alt={photo.alt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2.5 gap-1.5">
                            <button
                              type="button"
                              aria-label={`View ${photo.caption} larger`}
                              onClick={() =>
                                setLightboxItem({
                                  url: photo.url,
                                  title: photo.caption,
                                  caption: photo.fileName,
                                  alt: photo.alt,
                                })
                              }
                              className="w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Remove ${photo.caption}`}
                              onClick={() => handleDeletePhoto(undefined, photo.id)}
                              className="w-8 h-8 rounded-full bg-black/70 text-red-200 hover:bg-red-900/90 flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <figcaption className="p-3.5 space-y-1 flex-1">
                          <div className="text-xs font-semibold text-white truncate">
                            {photo.caption}
                          </div>
                          <p className="text-[11px] text-[#8c869a] truncate">{photo.fileName}</p>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={batchInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleBatchFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={slotInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleSlotFileChange(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Lightbox for Project Screenshots & Photos */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-[130] bg-black/88 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[960px] w-full rounded-2xl border border-white/15 bg-[#121520] overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close photo"
              onClick={() => setLightboxItem(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/75 text-white hover:bg-black flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-black flex items-center justify-center max-h-[74vh]">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.alt}
                className="max-h-[74vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 sm:p-5 space-y-1 border-t border-white/10">
              <div className="text-sm font-semibold text-white">{lightboxItem.title}</div>
              <p className="text-xs sm:text-sm text-[#b7b5c6]">{lightboxItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
