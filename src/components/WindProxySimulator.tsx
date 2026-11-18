import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

export const WindProxySimulator: React.FC = () => {
  const [aspectRatio, setAspectRatio] = useState(1.2); // Canyon H/W ratio (0.4 to 2.4)
  const [windAngle, setWindAngle] = useState(18); // Degrees (-45 to +45)
  const [porosity, setPorosity] = useState(20); // Ground-level passage % (0 to 60)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Qualitative flow regime derived from H/W canyon ratio (Oke's flow classification proxy)
  const flowRegime =
    aspectRatio < 0.75
      ? 'Isolated Roughness Flow'
      : aspectRatio < 1.45
      ? 'Wake Interference Flow'
      : 'Skimming Canyon Vortex';

  const pedestrianComfort =
    porosity > 35 && Math.abs(windAngle) > 25
      ? 'Elevated Breezy Channeling'
      : aspectRatio > 1.65 && porosity < 15
      ? 'Stagnant Leeward Eddy'
      : 'Moderate Cross-Canyon Circulation';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId = 0;
    let tick = 0;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = 640;
      const h = 280;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Dark blueprint canvas background
      ctx.fillStyle = '#0B0F18';
      ctx.fillRect(0, 0, w, h);

      // Ground plane
      const groundY = 236;
      ctx.fillStyle = '#151D2B';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.strokeStyle = '#364A66';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Canyon geometry scaled cleanly by aspectRatio
      const canyonWidth = Math.max(78, Math.min(200, 170 / Math.max(0.6, aspectRatio * 0.85)));
      const bldgHeight = Math.max(54, Math.min(168, canyonWidth * aspectRatio * 0.76));
      const bldgWidth = 86;

      const leftBldgX = w / 2 - canyonWidth / 2 - bldgWidth;
      const rightBldgX = w / 2 + canyonWidth / 2;
      const bldgY = groundY - bldgHeight;
      const gapHeight = (porosity / 100) * 34;

      // Draw Windward & Leeward Building Masses
      const drawBuilding = (bx: number) => {
        ctx.fillStyle = '#1D2739';
        ctx.strokeStyle = '#7AA2C4';
        ctx.lineWidth = 1.4;
        ctx.fillRect(bx, bldgY, bldgWidth, bldgHeight - gapHeight);
        ctx.strokeRect(bx, bldgY, bldgWidth, bldgHeight - gapHeight);

        if (gapHeight > 2) {
          ctx.fillStyle = 'rgba(122, 162, 196, 0.35)';
          ctx.fillRect(bx + 8, groundY - gapHeight, 6, gapHeight);
          ctx.fillRect(bx + bldgWidth - 14, groundY - gapHeight, 6, gapHeight);
        }
      };

      drawBuilding(leftBldgX);
      drawBuilding(rightBldgX);

      // Streamline simulation (proxy visualization)
      const angleRad = (windAngle * Math.PI) / 180;
      const phaseOffset = prefersReduced ? 0 : (tick * 0.025) % 1;
      const streamlineCount = 7;

      for (let i = 0; i < streamlineCount; i++) {
        const baseY = 38 + i * 26;
        ctx.beginPath();
        for (let sx = 12; sx <= w - 12; sx += 10) {
          let py = baseY + Math.sin(angleRad) * (sx - w / 2) * 0.14;

          const overLeft = sx > leftBldgX - 30 && sx < leftBldgX + bldgWidth + 20;
          const overRight = sx > rightBldgX - 20 && sx < rightBldgX + bldgWidth + 30;
          const inCanyon = sx >= leftBldgX + bldgWidth && sx <= rightBldgX;

          if (overLeft || overRight) {
            const targetRoofY = bldgY - 14 - i * 10;
            if (py > targetRoofY) {
              py = py * 0.35 + targetRoofY * 0.65;
            }
          } else if (inCanyon && baseY > 110) {
            const dipFactor = Math.max(0, 1.3 - aspectRatio * 0.55);
            py += Math.sin(((sx - (leftBldgX + bldgWidth)) / canyonWidth) * Math.PI) * 28 * dipFactor;
          }

          py = Math.min(groundY - 8, Math.max(16, py));

          if (sx === 12) ctx.moveTo(sx, py);
          else ctx.lineTo(sx, py);
        }

        ctx.strokeStyle = i < 3 ? 'rgba(99, 179, 237, 0.65)' : 'rgba(94, 234, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -phaseOffset * 28;
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Canyon recirculation vortex indicator
      const vortexCenterX = w / 2;
      const vortexCenterY = groundY - Math.min(bldgHeight * 0.48, 70);
      const vortexRadius = Math.min(canyonWidth * 0.32, bldgHeight * 0.34, 42);

      if (aspectRatio >= 0.7) {
        const spin = prefersReduced ? 0 : tick * 0.03;
        ctx.beginPath();
        ctx.arc(vortexCenterX, vortexCenterY, vortexRadius, spin, spin + Math.PI * 1.45);
        ctx.strokeStyle = 'rgba(195, 176, 246, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
          vortexCenterX,
          vortexCenterY,
          vortexRadius * 0.58,
          spin + 1.2,
          spin + 1.2 + Math.PI * 1.25
        );
        ctx.strokeStyle = 'rgba(94, 234, 212, 0.55)';
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      if (porosity >= 15) {
        const arrowY = groundY - Math.max(6, gapHeight * 0.48);
        ctx.beginPath();
        ctx.moveTo(leftBldgX - 24, arrowY);
        ctx.lineTo(rightBldgX + bldgWidth + 24, arrowY);
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.lineDashOffset = -phaseOffset * 18;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Labels inside canvas
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Prevailing Wind', 18, 22);
      ctx.fillText(`Canyon H/W ≈ ${aspectRatio.toFixed(1)}`, w / 2 - 42, groundY + 24);

      ctx.restore();
      tick += 1;
      if (!prefersReduced) {
        animId = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [aspectRatio, windAngle, porosity]);

  return (
    <div className="rounded-xl border border-white/15 bg-[#161924] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold text-white">
            Interactive Proxy Canyon Explorer
          </h4>
          <p className="text-xs text-[#b7b5c6] mt-0.5">
            Adjust geometry and wind direction to inspect qualitative flow regimes.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-medium text-[#97d4ec]">{flowRegime}</div>
          <div className="text-xs text-[#9c99ad]">{pedestrianComfort}</div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-white/12 bg-[#0B0F18]">
        <canvas
          ref={canvasRef}
          aria-label={`Interactive proxy wind streamline diagram showing ${flowRegime} at canyon ratio ${aspectRatio.toFixed(
            1
          )}`}
          className="w-full h-auto block"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <label className="block space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#d2cfe0]">
            <span>Canyon Ratio (H/W)</span>
            <span className="font-mono-tabular font-medium text-white">{aspectRatio.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="2.4"
            step="0.1"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(parseFloat(e.target.value))}
            className="w-full accent-[#c3b0f6] cursor-pointer"
          />
        </label>

        <label className="block space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#d2cfe0]">
            <span>Wind Incidence</span>
            <span className="font-mono-tabular font-medium text-white">{windAngle}°</span>
          </div>
          <input
            type="range"
            min="-45"
            max="45"
            step="3"
            value={windAngle}
            onChange={(e) => setWindAngle(parseInt(e.target.value, 10))}
            className="w-full accent-[#c3b0f6] cursor-pointer"
          />
        </label>

        <label className="block space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#d2cfe0]">
            <span>Podium Porosity</span>
            <span className="font-mono-tabular font-medium text-white">{porosity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={porosity}
            onChange={(e) => setPorosity(parseInt(e.target.value, 10))}
            className="w-full accent-[#c3b0f6] cursor-pointer"
          />
        </label>
      </div>

      {/* Mandatory proxy disclaimer */}
      <div className="flex items-start gap-2.5 rounded-lg bg-[#0e1420] border border-[#97d4ec]/25 px-3.5 py-2.5 text-xs text-[#cbd5e1]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#97d4ec]" />
        <p className="leading-relaxed">
          Wind-simulator results are preliminary proxy-model outputs for early design intuition only,
          not certified CFD or engineering approval.
        </p>
      </div>
    </div>
  );
};
