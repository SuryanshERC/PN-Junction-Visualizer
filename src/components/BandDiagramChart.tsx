import { useEffect, useRef } from 'react';
import type { BandDiagramData } from '../utils/semiconductorPhysics';

interface BandDiagramChartProps {
  data: {
    x: number[];
    Ec: number[];
    Ev: number[];
    EF: number[];
    Ei: number[];
  };
  bandData: BandDiagramData;
}

export default function BandDiagramChart({ data, bandData }: BandDiagramChartProps) {
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
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const xMin = Math.min(...data.x);
    const xMax = Math.max(...data.x);

    const xRange = xMax - xMin;
    const xCenter = (xMax + xMin) / 2;
    const depletionScaleFactor = 0.7;
    const adjustedXMin = xCenter - (xRange * depletionScaleFactor) / 2;
    const adjustedXMax = xCenter + (xRange * depletionScaleFactor) / 2;
    const yMin = Math.min(...data.Ev);
    const yMax = Math.max(...data.Ec);

    const yRange = yMax - yMin;
    const yPadding = yRange * 0.1;
    const adjustedYMin = yMin - yPadding;
    const adjustedYMax = yMax + yPadding;

    const xScale = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const yScale = (y: number) => padding.top + ((adjustedYMax - y) / (adjustedYMax - adjustedYMin)) * plotHeight;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight);

    const depletionStartX = xScale(-bandData.xp * 1e6);
    const depletionEndX = xScale(bandData.xn * 1e6);

    ctx.fillStyle = 'rgba(254, 202, 202, 0.3)';
    ctx.fillRect(depletionStartX, padding.top, depletionEndX - depletionStartX, plotHeight);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (plotHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotWidth, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.Ec.forEach((ec, i) => {
      const x = xScale(data.x[i]);
      const y = yScale(ec);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.Ev.forEach((ev, i) => {
      const x = xScale(data.x[i]);
      const y = yScale(ev);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

  /*  ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const efY = yScale(data.EF[0]);
    ctx.moveTo(padding.left, efY);
    ctx.lineTo(padding.left + plotWidth, efY);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    data.Ei.forEach((ei, i) => {
      const x = xScale(data.x[i]);
      const y = yScale(ei);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();*/

    ctx.setLineDash([]);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotHeight);
    ctx.lineTo(padding.left + plotWidth, padding.top + plotHeight);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const xVal = xMin + ((xMax - xMin) * i) / 4;
      const x = xScale(xVal);
      ctx.fillText(xVal.toFixed(2), x, padding.top + plotHeight + 20);
    }

    ctx.save();
    ctx.translate(padding.left - 40, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Energy (eV)', 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillText('Position (μm)', padding.left + plotWidth / 2, height - 20);

    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#ef4444';
    ctx.fillText('Ec', padding.left + 10, padding.top + 20);

    ctx.fillStyle = '#ef4444';
    ctx.fillText('Ev', padding.left + 10, padding.top + plotHeight - 10);

    /*ctx.fillStyle = '#1e293b';
    ctx.fillText('EF', padding.left + plotWidth - 40, efY - 10);

    ctx.fillStyle = '#f59e0b';
    const eiMidY = yScale(data.Ei[Math.floor(data.Ei.length / 2)]);
    ctx.fillText('Ei', padding.left + plotWidth / 2 - 20, eiMidY - 10);*/

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('p-type', padding.left + plotWidth * 0.15, padding.top - 10);
    ctx.fillText('Depletion', padding.left + plotWidth * 0.5, padding.top - 10);
    ctx.fillText('n-type', padding.left + plotWidth * 0.85, padding.top - 10);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    const arrowStartX = depletionStartX + (depletionEndX - depletionStartX) * 0.3;
    const arrowEndX = arrowStartX + 60;
    const arrowY = yScale(bandData.Vbi / 2);
    ctx.beginPath();
    ctx.moveTo(arrowStartX, arrowY);
    ctx.lineTo(arrowEndX, arrowY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(arrowEndX, arrowY);
    ctx.lineTo(arrowEndX - 5, arrowY - 3);
    ctx.lineTo(arrowEndX - 5, arrowY + 3);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px sans-serif';
    ctx.fillText('qVbi', arrowStartX + 30, arrowY - 8);
  }, [data, bandData]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: '500px' }}
    />
  );
}
