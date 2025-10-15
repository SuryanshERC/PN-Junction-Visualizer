import { useEffect, useRef } from 'react';
import type { ChargeDensityData } from '../utils/poissonCalculations';

interface ChargeDensityChartProps {
  data: ChargeDensityData;
}

export default function ChargeDensityChart({ data }: ChargeDensityChartProps) {
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
    const rhoMin = Math.min(...data.rho);
    const rhoMax = Math.max(...data.rho);

    // Add padding to y-axis
    const rhoRange = rhoMax - rhoMin;
    const rhoPadding = Math.max(rhoRange * 0.1, Math.abs(rhoMax) * 0.1);
    const adjustedRhoMin = rhoMin - rhoPadding;
    const adjustedRhoMax = rhoMax + rhoPadding;

    const xScale = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const yScale = (y: number) => padding.top + ((adjustedRhoMax - y) / (adjustedRhoMax - adjustedRhoMin)) * plotHeight;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight);

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (plotHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotWidth, y);
      ctx.stroke();
    }

    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (plotWidth * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + plotHeight);
      ctx.stroke();
    }

    // Zero line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    const zeroY = yScale(0);
    ctx.beginPath();
    ctx.moveTo(padding.left, zeroY);
    ctx.lineTo(padding.left + plotWidth, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Depletion region boundaries
    const depletionStartX = xScale(-data.xp);
    const depletionEndX = xScale(data.xn);
    
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Left boundary (-xp)
    ctx.beginPath();
    ctx.moveTo(depletionStartX, padding.top);
    ctx.lineTo(depletionStartX, padding.top + plotHeight);
    ctx.stroke();
    
    // Right boundary (xn)
    ctx.beginPath();
    ctx.moveTo(depletionEndX, padding.top);
    ctx.lineTo(depletionEndX, padding.top + plotHeight);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // Charge density profile (piecewise constant - straight horizontal lines)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    data.x.forEach((x, i) => {
      const xCoord = xScale(x);
      const yCoord = yScale(data.rho[i]); // Use original values (negative and positive)
      if (i === 0) ctx.moveTo(xCoord, yCoord);
      else ctx.lineTo(xCoord, yCoord);
    });
    ctx.stroke();

    // Fill regions (p-side negative, n-side positive)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; // Red for p-side negative charge
    ctx.beginPath();
    ctx.moveTo(xScale(-data.xp), yScale(0));
    for (let i = 0; i < data.x.length; i++) {
      if (data.x[i] >= -data.xp && data.x[i] <= 0) {
        ctx.lineTo(xScale(data.x[i]), yScale(data.rho[i])); // Use original negative value
      }
    }
    ctx.lineTo(xScale(0), yScale(0));
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'; // Green for n-side positive charge
    ctx.beginPath();
    ctx.moveTo(xScale(0), yScale(0));
    for (let i = 0; i < data.x.length; i++) {
      if (data.x[i] >= 0 && data.x[i] <= data.xn) {
        ctx.lineTo(xScale(data.x[i]), yScale(data.rho[i])); // Use original positive value
      }
    }
    ctx.lineTo(xScale(data.xn), yScale(0));
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotHeight);
    ctx.lineTo(padding.left + plotWidth, padding.top + plotHeight);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#334155';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels
    for (let i = 0; i <= 4; i++) {
      const xVal = xMin + ((xMax - xMin) * i) / 4;
      const x = xScale(xVal);
      ctx.fillText(xVal.toFixed(2), x, padding.top + plotHeight + 20);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const yVal = adjustedRhoMin + ((adjustedRhoMax - adjustedRhoMin) * i) / 4;
      const y = yScale(yVal);
      ctx.fillText(yVal.toExponential(1), padding.left - 10, y + 4);
    }

    // Axis titles
    ctx.save();
    ctx.translate(padding.left - 40, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Charge Density (C/cm³)', 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillText('Position (μm)', padding.left + plotWidth / 2, height - 20);

    // Legend and annotations
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';

    // Charge density label
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('ρ(x)', padding.left + 10, padding.top + 20);

    // Region labels
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('p-type', padding.left + plotWidth * 0.15, padding.top - 10);
    ctx.fillText('Depletion', padding.left + plotWidth * 0.5, padding.top - 10);
    ctx.fillText('n-type', padding.left + plotWidth * 0.85, padding.top - 10);

    // Charge signs (negative on p-side, positive on n-side)
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('-', padding.left + plotWidth * 0.25, zeroY + 15); // Below zero line for negative
    ctx.fillStyle = '#22c55e';
    ctx.fillText('+', padding.left + plotWidth * 0.75, zeroY - 10); // Above zero line for positive

    // Depletion width annotations
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText(`-W₁`, depletionStartX, padding.top + plotHeight + 35);
    ctx.fillText(`W₂`, depletionEndX, padding.top + plotHeight + 35);
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: '400px' }}
    />
  );
}
