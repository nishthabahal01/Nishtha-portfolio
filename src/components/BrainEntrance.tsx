import React, { useEffect, useRef, useState } from 'react';

interface BrainEntranceProps {
  onEnterMind: () => void;
}

interface BrainSpark {
  x: number;
  y: number;
  baseRadius: number;
  phase: number;
  speed: number;
  color: string;
}

const BRAIN_SPARKS: BrainSpark[] = [
  { x: 165, y: 128, baseRadius: 3.1, phase: 0.2, speed: 0.022, color: '#93C5FD' },
  { x: 228, y: 98, baseRadius: 3.6, phase: 1.4, speed: 0.018, color: '#FDE68A' },
  { x: 295, y: 112, baseRadius: 3.0, phase: 2.3, speed: 0.025, color: '#A7F3D0' },
  { x: 352, y: 158, baseRadius: 3.4, phase: 0.8, speed: 0.02, color: '#93C5FD' },
  { x: 132, y: 186, baseRadius: 3.2, phase: 3.1, speed: 0.019, color: '#DDD6FE' },
  { x: 205, y: 174, baseRadius: 4.0, phase: 1.9, speed: 0.024, color: '#FBCFE8' },
  { x: 274, y: 182, baseRadius: 3.5, phase: 4.2, speed: 0.021, color: '#93C5FD' },
  { x: 332, y: 222, baseRadius: 3.1, phase: 2.8, speed: 0.017, color: '#A7F3D0' },
  { x: 174, y: 242, baseRadius: 3.3, phase: 0.5, speed: 0.023, color: '#FDE68A' },
  { x: 252, y: 252, baseRadius: 3.8, phase: 3.7, speed: 0.02, color: '#DDD6FE' },
  { x: 386, y: 214, baseRadius: 2.9, phase: 1.1, speed: 0.022, color: '#FBCFE8' },
  { x: 230, y: 304, baseRadius: 2.8, phase: 2.1, speed: 0.016, color: '#93C5FD' },
];

const SYNAPSE_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [0, 5],
  [1, 5],
  [1, 6],
  [2, 6],
  [3, 7],
  [3, 10],
  [4, 5],
  [4, 8],
  [5, 6],
  [5, 8],
  [6, 7],
  [6, 9],
  [7, 10],
  [8, 9],
  [9, 11],
  [7, 9],
];

export const BrainEntrance: React.FC<BrainEntranceProps> = ({ onEnterMind }) => {
  const [hovered, setHovered] = useState(false);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    let tick = 0;

    const renderFrame = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = 500;
      const height = 420;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const intensity = hovered ? 1.0 : 0.72;

      // Draw internal neural links inside brain silhouette
      SYNAPSE_LINKS.forEach(([aIdx, bIdx], linkIdx) => {
        const a = BRAIN_SPARKS[aIdx];
        const b = BRAIN_SPARKS[bIdx];

        const pulse = prefersReduced
          ? 0.55
          : 0.35 + 0.45 * Math.sin(tick * 0.025 + linkIdx * 0.7);

        ctx.beginPath();
        const midX = (a.x + b.x) / 2 + ((linkIdx % 2 === 0 ? 1 : -1) * 14);
        const midY = (a.y + b.y) / 2 - 10;
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(midX, midY, b.x, b.y);
        ctx.strokeStyle = `rgba(186, 224, 255, ${(0.14 + pulse * 0.22) * intensity})`;
        ctx.lineWidth = hovered ? 1.35 : 1.05;
        ctx.stroke();

        // Traveling action potential pulse
        if (!prefersReduced) {
          const t = ((tick * 0.008 + linkIdx * 0.17) % 1);
          const invT = 1 - t;
          const px = invT * invT * a.x + 2 * invT * t * midX + t * t * b.x;
          const py = invT * invT * a.y + 2 * invT * t * midY + t * t * b.y;

          ctx.beginPath();
          ctx.arc(px, py, hovered ? 2.1 : 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 242, 254, ${0.75 * intensity})`;
          ctx.fill();
        }
      });

      // Draw glowing synaptic nodes
      BRAIN_SPARKS.forEach((spark) => {
        const wave = prefersReduced
          ? 1
          : 0.78 + 0.32 * Math.sin(tick * spark.speed + spark.phase);
        const radius = spark.baseRadius * wave * (hovered ? 1.15 : 1);

        const glow = ctx.createRadialGradient(
          spark.x,
          spark.y,
          0,
          spark.x,
          spark.y,
          radius * 4.5
        );
        glow.addColorStop(0, spark.color);
        glow.addColorStop(0.35, `${spark.color}55`);
        glow.addColorStop(1, 'rgba(6,7,11,0)');

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, radius * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, radius * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = '#F8FAFC';
        ctx.fill();
      });

      ctx.restore();
      tick += 1;

      if (!prefersReduced) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [hovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    setPointerOffset({ x: nx, y: ny });
  };

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={onEnterMind}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPointerOffset({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      aria-label="Explore Nishtha's mind — opens interactive neural network"
      className="group relative w-full max-w-[500px] aspect-[500/420] mx-auto flex items-center justify-center rounded-3xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#06070B]"
    >
      {/* Subtle atmospheric backlight halo behind the brain */}
      <div
        aria-hidden="true"
        className="absolute inset-6 rounded-full transition-transform duration-500 ease-out pointer-events-none"
        style={{
          background: hovered
            ? 'radial-gradient(circle at 50% 48%, rgba(140, 200, 255, 0.32) 0%, rgba(196, 181, 253, 0.16) 42%, rgba(6, 7, 11, 0) 74%)'
            : 'radial-gradient(circle at 50% 48%, rgba(140, 200, 255, 0.22) 0%, rgba(167, 243, 208, 0.1) 42%, rgba(6, 7, 11, 0) 72%)',
          filter: 'blur(26px)',
          transform: `translate3d(${pointerOffset.x * 0.45}px, ${pointerOffset.y * 0.45}px, 0) scale(${
            hovered ? 1.06 : 1
          })`,
        }}
      />

      {/* Crisp backlit rim-lit brain contour SVG */}
      <svg
        viewBox="0 0 500 420"
        aria-hidden="true"
        className="relative z-10 w-full h-full transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${pointerOffset.x * 0.25}px, ${pointerOffset.y * 0.25}px, 0) scale(${
            hovered ? 1.02 : 1
          })`,
        }}
      >
        <defs>
          <radialGradient id="brainBodyFill" cx="48%" cy="44%" r="55%">
            <stop offset="0%" stopColor="#1A2438" stopOpacity="0.92" />
            <stop offset="65%" stopColor="#0E1320" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#070910" stopOpacity="0.98" />
          </radialGradient>
          <linearGradient id="brainRimStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity={hovered ? '0.95' : '0.72'} />
            <stop offset="50%" stopColor="#DDD6FE" stopOpacity={hovered ? '0.82' : '0.52'} />
            <stop offset="100%" stopColor="#A7F3D0" stopOpacity={hovered ? '0.9' : '0.62'} />
          </linearGradient>
        </defs>

        {/* Brain lateral silhouette + brainstem */}
        <path
          d="M 206 322
             C 198 342, 208 368, 224 374
             C 242 380, 256 364, 258 340
             C 260 326, 272 316, 288 318
             C 316 322, 344 304, 358 282
             C 394 274, 424 242, 426 202
             C 428 164, 404 132, 376 116
             C 356 80, 310 62, 260 66
             C 214 68, 168 88, 134 118
             C 98 148, 84 190, 96 228
             C 106 260, 136 280, 168 286
             C 182 288, 198 300, 206 322 Z"
          fill="url(#brainBodyFill)"
          stroke="url(#brainRimStroke)"
          strokeWidth={hovered ? '2.2' : '1.6'}
        />

        {/* Delicate cortical folds (sulci & gyri) */}
        <g
          fill="none"
          stroke="rgba(186, 230, 253, 0.22)"
          strokeWidth="1.25"
          strokeLinecap="round"
        >
          <path d="M 142 156 C 172 146, 194 166, 224 152 C 254 138, 276 154, 304 142" />
          <path d="M 122 204 C 154 196, 178 214, 212 202 C 242 192, 268 212, 298 198 C 324 186, 354 198, 378 182" />
          <path d="M 152 246 C 186 238, 212 256, 248 242 C 278 232, 314 248, 344 234" />
          <path d="M 186 106 C 204 128, 226 118, 246 94" />
          <path d="M 278 86 C 288 114, 312 122, 336 106" />
          <path d="M 358 134 C 344 162, 366 184, 396 178" />
          <path d="M 252 276 C 276 286, 298 278, 314 294" />
          {/* Cerebellum fine lines */}
          <path d="M 294 272 C 322 268, 352 278, 372 260" />
          <path d="M 304 288 C 330 286, 354 294, 368 278" />
        </g>
      </svg>

      {/* Live neural activity canvas overlay */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full z-20 pointer-events-none"
      />

      {/* Quiet interactive prompt underneath */}
      <span
        className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-30 text-xs tracking-wide transition-all duration-200 whitespace-nowrap ${
          hovered ? 'text-sky-200 opacity-100' : 'text-zinc-400 opacity-85'
        }`}
      >
        Click brain to enter /mind/
      </span>
    </button>
  );
};
