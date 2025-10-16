import { useEffect, useRef } from 'react';
import type { BandDiagramData } from '../utils/semiconductorPhysics';

interface JunctionDiagramProps {
  bandData: BandDiagramData;
  NA: number;
  ND: number;
}

export default function JunctionDiagram({ bandData, NA, ND }: JunctionDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    const junctionHeight = 200;
    const junctionTop = (height - junctionHeight) / 2;

    const totalWidth = width - 2 * padding;
    const centerX = width / 2;

    const depletionWidthPixels = (bandData.W * 1e6 / 2) * 150;
    const xpPixels = (bandData.xp * 1e6 / bandData.W / 1e6) * depletionWidthPixels;
    const xnPixels = (bandData.xn * 1e6 / bandData.W / 1e6) * depletionWidthPixels;

    const pRegionEnd = centerX - xpPixels;
    const nRegionStart = centerX + xnPixels;

    const maxDoping = Math.max(NA, ND);
    const pIntensity = Math.min(255, 100 + (NA / maxDoping) * 155);
    const nIntensity = Math.min(255, 100 + (ND / maxDoping) * 155);

    const pGradient = ctx.createLinearGradient(padding, 0, pRegionEnd, 0);
    pGradient.addColorStop(0, `rgb(${pIntensity}, 100, 100)`);
    pGradient.addColorStop(1, `rgb(255, 180, 180)`);

    ctx.fillStyle = pGradient;
    ctx.fillRect(padding, junctionTop, pRegionEnd - padding, junctionHeight);

    const depletionGradient = ctx.createLinearGradient(pRegionEnd, 0, nRegionStart, 0);
    depletionGradient.addColorStop(0, 'rgb(255, 220, 220)');
    depletionGradient.addColorStop(0.5, 'rgb(255, 240, 240)');
    depletionGradient.addColorStop(1, 'rgb(220, 220, 255)');

    ctx.fillStyle = depletionGradient;
    ctx.fillRect(pRegionEnd, junctionTop, nRegionStart - pRegionEnd, junctionHeight);

    const nGradient = ctx.createLinearGradient(nRegionStart, 0, width - padding, 0);
    nGradient.addColorStop(0, `rgb(180, 180, 255)`);
    nGradient.addColorStop(1, `rgb(100, 100, ${nIntensity})`);

    ctx.fillStyle = nGradient;
    ctx.fillRect(nRegionStart, junctionTop, width - padding - nRegionStart, junctionHeight);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, junctionTop, totalWidth, junctionHeight);

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, junctionTop - 20);
    ctx.lineTo(centerX, junctionTop + junctionHeight + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pRegionEnd, junctionTop);
    ctx.lineTo(pRegionEnd, junctionTop + junctionHeight);
    ctx.stroke();

    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(nRegionStart, junctionTop);
    ctx.lineTo(nRegionStart, junctionTop + junctionHeight);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('P-Type', padding + (pRegionEnd - padding) / 2, junctionTop + junctionHeight / 2);
    ctx.fillText('N-Type', nRegionStart + (width - padding - nRegionStart) / 2, junctionTop + junctionHeight / 2);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Depletion Region', centerX, junctionTop + junctionHeight / 2);

    const drawArrow = (x1: number, y1: number, x2: number, y2: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const headlen = 8;
      const angle = Math.atan2(y2 - y1, x2 - x1);

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    };

    const arrowY = junctionTop + junctionHeight + 40;

    drawArrow(pRegionEnd, arrowY, pRegionEnd - 40, arrowY, '#3b82f6');
    drawArrow(nRegionStart, arrowY, nRegionStart + 40, arrowY, '#3b82f6');

    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`xp = ${(bandData.xp * 1e6).toFixed(3)} μm`, pRegionEnd - 20, arrowY + 20);
    ctx.fillText(`xn = ${(bandData.xn * 1e6).toFixed(3)} μm`, nRegionStart + 20, arrowY + 20);

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    const totalArrowY = junctionTop - 40;
    drawArrow(pRegionEnd, totalArrowY, nRegionStart, totalArrowY, '#059669');

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`W = ${(bandData.W * 1e6).toFixed(3)} μm`, centerX, totalArrowY - 10);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText(`NA = ${NA.toExponential(2)} cm⁻³`, padding + 5, junctionTop + 20);
    ctx.textAlign = 'right';
    ctx.fillText(`ND = ${ND.toExponential(2)} cm⁻³`, width - padding - 5, junctionTop + 20);

  }, [bandData, NA, ND]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: '400px' }}
    />
  );
}
