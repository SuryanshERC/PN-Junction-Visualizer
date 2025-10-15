import { useEffect, useRef } from 'react';

interface ElectricFieldChartProps {
  x: number[];
  E: number[];
  depletionStart: number;
  depletionEnd: number;
}

export default function ElectricFieldChart({ x, E, depletionStart, depletionEnd }: ElectricFieldChartProps) {
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

    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const EMin = Math.min(...E, 0);
    const EMax = Math.max(...E, 0);

    const maxAbsE = Math.max(Math.abs(EMin), Math.abs(EMax));
    const fixedYRange = maxAbsE > 0 ? maxAbsE * 1.2 : 1e5;

    const adjustedEMin = 0;
    const adjustedEMax = fixedYRange;

    const xScale = (xVal: number) => padding.left + ((xVal - xMin) / (xMax - xMin)) * plotWidth;
    const yScale = (y: number) => padding.top + ((adjustedEMax - y) / (adjustedEMax - adjustedEMin)) * plotHeight;

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
    const depletionStartX = xScale(depletionStart);
    const depletionEndX = xScale(depletionEnd);
    
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(depletionStartX, padding.top);
    ctx.lineTo(depletionStartX, padding.top + plotHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(depletionEndX, padding.top);
    ctx.lineTo(depletionEndX, padding.top + plotHeight);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // Find maximum field point
    let maxFieldX = xScale(0);
    let maxFieldValue = 0;
    for (let i = 0; i < x.length; i++) {
      if (Math.abs(E[i]) > Math.abs(maxFieldValue)) {
        maxFieldValue = Math.abs(E[i]); // Use absolute value for maximum
        maxFieldX = xScale(x[i]);
      }
    }

    // Electric field profile (using absolute values for continuous display)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    x.forEach((xVal, i) => {
      const xCoord = xScale(xVal);
      const yCoord = yScale(Math.abs(E[i])); // Take absolute value for continuous display
      if (i === 0) ctx.moveTo(xCoord, yCoord);
      else ctx.lineTo(xCoord, yCoord);
    });
    ctx.stroke();

    // Fill under the curve
    ctx.fillStyle = 'rgba(220, 38, 38, 0.1)';
    ctx.beginPath();
    ctx.moveTo(xScale(x[0]), zeroY);
    for (let i = 0; i < x.length; i++) {
      ctx.lineTo(xScale(x[i]), yScale(Math.abs(E[i]))); // Use absolute value
    }
    ctx.lineTo(xScale(x[x.length - 1]), zeroY);
    ctx.closePath();
    ctx.fill();

    // Mark maximum field point
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(maxFieldX, yScale(maxFieldValue), 4, 0, 2 * Math.PI);
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
      const yVal = adjustedEMin + ((adjustedEMax - adjustedEMin) * i) / 4;
      const y = yScale(yVal);
      ctx.fillText(yVal.toExponential(1), padding.left - 10, y + 4);
    }

    // Axis titles
    ctx.save();
    ctx.translate(padding.left - 40, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Electric Field (V/cm)', 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillText('Position (μm)', padding.left + plotWidth / 2, height - 20);

    // Legend and annotations
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';

    // Electric field label
    ctx.fillStyle = '#dc2626';
    ctx.fillText('E(x)', padding.left + 10, padding.top + 20);

    // Region labels
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('p-type', padding.left + plotWidth * 0.15, padding.top - 10);
    ctx.fillText('Depletion', padding.left + plotWidth * 0.5, padding.top - 10);
    ctx.fillText('n-type', padding.left + plotWidth * 0.85, padding.top - 10);

    // Maximum field annotation
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'center';
    ctx.fillText('Emax', maxFieldX, yScale(maxFieldValue) - 10);

    // Field direction arrows
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#dc2626';
    
    // Arrow in p-side (pointing right)
    const arrowX1 = padding.left + plotWidth * 0.3;
    const arrowY1 = yScale(fixedYRange * 0.2);
    ctx.beginPath();
    ctx.moveTo(arrowX1 - 20, arrowY1);
    ctx.lineTo(arrowX1 + 20, arrowY1);
    ctx.lineTo(arrowX1 + 15, arrowY1 - 3);
    ctx.moveTo(arrowX1 + 20, arrowY1);
    ctx.lineTo(arrowX1 + 15, arrowY1 + 3);
    ctx.stroke();

    // Arrow in n-side (pointing left)
    const arrowX2 = padding.left + plotWidth * 0.7;
    const arrowY2 = yScale(fixedYRange * 0.2);
    ctx.beginPath();
    ctx.moveTo(arrowX2 + 20, arrowY2);
    ctx.lineTo(arrowX2 - 20, arrowY2);
    ctx.lineTo(arrowX2 - 15, arrowY2 - 3);
    ctx.moveTo(arrowX2 - 20, arrowY2);
    ctx.lineTo(arrowX2 - 15, arrowY2 + 3);
    ctx.stroke();
  }, [x, E, depletionStart, depletionEnd]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: '400px' }}
    />
  );
}
