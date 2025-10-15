import { useEffect, useRef } from 'react';

interface CarrierDensityChartProps {
  x: number[];
  n: number[];
  p: number[];
  NA: number;
  ND: number;
  depletionStart: number;
  depletionEnd: number;
}

export default function CarrierDensityChart({ x, n, p, NA, ND, depletionStart, depletionEnd }: CarrierDensityChartProps) {
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
    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const xMin = Math.min(...x);
    const xMax = Math.max(...x);

    const allValues = [...n, ...p].filter(v => v > 0);
    const logMin = Math.floor(Math.log10(Math.min(...allValues)));
    const logMax = Math.ceil(Math.log10(Math.max(...allValues)));

    const xScale = (xVal: number) => padding.left + ((xVal - xMin) / (xMax - xMin)) * plotWidth;
    const yScale = (val: number) => {
      if (val <= 0) return padding.top + plotHeight;
      const logVal = Math.log10(val);
      return padding.top + plotHeight - ((logVal - logMin) / (logMax - logMin)) * plotHeight;
    };

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight);

    const depStartX = xScale(depletionStart);
    const depEndX = xScale(depletionEnd);
    ctx.fillStyle = 'rgba(254, 202, 202, 0.2)';
    ctx.fillRect(depStartX, padding.top, depEndX - depStartX, plotHeight);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = logMin; i <= logMax; i++) {
      const y = yScale(Math.pow(10, i));
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotWidth, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`10^${i}`, padding.left - 5, y + 4);
    }

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    const NAy = yScale(NA);
    ctx.beginPath();
    ctx.moveTo(padding.left, NAy);
    ctx.lineTo(padding.left + plotWidth, NAy);
    ctx.stroke();

    ctx.strokeStyle = '#8b5cf6';
    const NDy = yScale(ND);
    ctx.beginPath();
    ctx.moveTo(padding.left, NDy);
    ctx.lineTo(padding.left + plotWidth, NDy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    n.forEach((nVal, i) => {
      if (nVal > 0) {
        const xVal = xScale(x[i]);
        const yVal = yScale(nVal);
        if (i === 0) ctx.moveTo(xVal, yVal);
        else ctx.lineTo(xVal, yVal);
      }
    });
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    p.forEach((pVal, i) => {
      if (pVal > 0) {
        const xVal = xScale(x[i]);
        const yVal = yScale(pVal);
        if (i === 0) ctx.moveTo(xVal, yVal);
        else ctx.lineTo(xVal, yVal);
      }
    });
    ctx.stroke();

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
      const xPos = xScale(xVal);
      ctx.fillText(xVal.toFixed(2), xPos, padding.top + plotHeight + 20);
    }

    ctx.save();
    ctx.translate(padding.left - 60, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Carrier Density (cm⁻³)', 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillText('Position (μm)', padding.left + plotWidth / 2, height - 20);

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'left';
    ctx.fillText('n(x)', padding.left + 10, padding.top + 20);

    ctx.fillStyle = '#ef4444';
    ctx.fillText('p(x)', padding.left + 10, padding.top + 35);

    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('ND', padding.left + plotWidth - 50, NDy - 10);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('NA', padding.left + 50, NAy - 10);
  }, [x, n, p, NA, ND, depletionStart, depletionEnd]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: '400px' }}
    />
  );
}
