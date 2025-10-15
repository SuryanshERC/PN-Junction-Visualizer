import { useEffect, useRef } from 'react';

interface PotentialChartProps {
  x: number[];
  potential: number[];
  depletionStart: number;
  depletionEnd: number;
  Vbi: number;
}

export default function PotentialChart({ x, potential, depletionStart, depletionEnd, Vbi }: PotentialChartProps) {
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
    const VMin = Math.min(...potential);
    const VMax = Math.max(...potential);

    // Add padding to y-axis
    const VRange = VMax - VMin;
    const VPadding = Math.max(VRange * 0.1, Math.abs(VMax) * 0.1);
    const adjustedVMin = VMin - VPadding;
    const adjustedVMax = VMax + VPadding;

    const xScale = (xVal: number) => padding.left + ((xVal - xMin) / (xMax - xMin)) * plotWidth;
    const yScale = (y: number) => padding.top + ((adjustedVMax - y) / (adjustedVMax - adjustedVMin)) * plotHeight;

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

    // Vbi reference lines
    const VbiY = yScale(Vbi);
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Vbi level line
    ctx.beginPath();
    ctx.moveTo(padding.left, VbiY);
    ctx.lineTo(padding.left + plotWidth, VbiY);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // Potential profile (using absolute values for continuous display)
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    x.forEach((xVal, i) => {
      const xCoord = xScale(xVal);
      const yCoord = yScale(Math.abs(potential[i])); // Use absolute value for continuous display
      if (i === 0) ctx.moveTo(xCoord, yCoord);
      else ctx.lineTo(xCoord, yCoord);
    });
    ctx.stroke();

    // Fill under the curve
    ctx.fillStyle = 'rgba(124, 58, 237, 0.1)';
    ctx.beginPath();
    ctx.moveTo(xScale(x[0]), yScale(0));
    for (let i = 0; i < x.length; i++) {
      ctx.lineTo(xScale(x[i]), yScale(Math.abs(potential[i]))); // Use absolute value
    }
    ctx.lineTo(xScale(x[x.length - 1]), yScale(Math.abs(potential[potential.length - 1])));
    ctx.closePath();
    ctx.fill();

    // Vbi annotation arrow
    const arrowStartX = depletionEndX + 30;
    const arrowEndX = arrowStartX + 60;
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arrowStartX, yScale(0));
    ctx.lineTo(arrowEndX, yScale(0));
    ctx.moveTo(arrowStartX, VbiY);
    ctx.lineTo(arrowEndX, VbiY);
    ctx.stroke();

    // Vertical arrow
    ctx.beginPath();
    ctx.moveTo(arrowEndX, yScale(0));
    ctx.lineTo(arrowEndX, VbiY);
    ctx.stroke();

    // Arrow heads
    ctx.beginPath();
    ctx.moveTo(arrowEndX, yScale(0));
    ctx.lineTo(arrowEndX - 5, yScale(0) + 3);
    ctx.lineTo(arrowEndX - 5, yScale(0) - 3);
    ctx.closePath();
    ctx.fillStyle = '#7c3aed';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(arrowEndX, VbiY);
    ctx.lineTo(arrowEndX - 5, VbiY + 3);
    ctx.lineTo(arrowEndX - 5, VbiY - 3);
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
      const yVal = adjustedVMin + ((adjustedVMax - adjustedVMin) * i) / 4;
      const y = yScale(yVal);
      ctx.fillText(yVal.toFixed(3), padding.left - 10, y + 4);
    }

    // Axis titles
    ctx.save();
    ctx.translate(padding.left - 40, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Potential (V)', 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillText('Position (μm)', padding.left + plotWidth / 2, height - 20);

    // Legend and annotations
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';

    // Potential label
    ctx.fillStyle = '#7c3aed';
    ctx.fillText('V(x)', padding.left + 10, padding.top + 20);

    // Region labels
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('p-type', padding.left + plotWidth * 0.15, padding.top - 10);
    ctx.fillText('Depletion', padding.left + plotWidth * 0.5, padding.top - 10);
    ctx.fillText('n-type', padding.left + plotWidth * 0.85, padding.top - 10);

    // Vbi label
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#7c3aed';
    ctx.textAlign = 'left';
    ctx.fillText('V₀', arrowEndX + 10, yScale(0) - 10);

    // Depletion width annotations
    ctx.textAlign = 'center';
    ctx.fillText('-W₁', depletionStartX, padding.top + plotHeight + 35);
    ctx.fillText('W₂', depletionEndX, padding.top + plotHeight + 35);
  }, [x, potential, depletionStart, depletionEnd, Vbi]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: '400px' }}
    />
  );
}
