import { useEffect, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';

interface ResultadoShareCardProps {
  timeCasa: string;
  empresaCasa?: string | null;
  golsCasa: number;
  timeFora: string;
  empresaFora?: string | null;
  golsFora: number;
  dataJogo: string; // 'YYYY-MM-DD'
}

const formatarData = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function clip(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

/** Gera um card de resultado 1080x1080 (quadrado, ideal p/ Instagram/WhatsApp). */
export const ResultadoShareCard = ({ timeCasa, empresaCasa, golsCasa, timeFora, empresaFora, golsFora, dataJogo }: ResultadoShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#111827');
    grad.addColorStop(0.55, '#0a0a0c');
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W / 2, 200, 40, W / 2, 200, 560);
    glow.addColorStop(0, 'rgba(220,38,38,0.30)');
    glow.addColorStop(1, 'rgba(220,38,38,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 700);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '700 32px Arial';
    ctx.fillText('B O L E I R O F F I C E', W / 2, 130);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px Arial';
    ctx.fillText('RESULTADO', W / 2, 225);

    const casaVenceu = golsCasa > golsFora;
    const foraVenceu = golsFora > golsCasa;

    const drawRow = (time: string, empresa: string | null | undefined, gols: number, venceu: boolean, y: number) => {
      const cardX = 70, cardW = W - 140, cardH = 200;
      ctx.fillStyle = venceu ? 'rgba(245,158,11,0.10)' : 'rgba(255,255,255,0.05)';
      roundRect(ctx, cardX, y, cardW, cardH, 36); ctx.fill();
      ctx.strokeStyle = venceu ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2; roundRect(ctx, cardX, y, cardW, cardH, 36); ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 60px Arial';
      ctx.fillText(clip(ctx, time, cardW - 320), cardX + 50, y + 90);
      if (empresa) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '600 34px Arial';
        ctx.fillText(clip(ctx, empresa, cardW - 320), cardX + 50, y + 145);
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = venceu ? '#f59e0b' : '#ffffff';
      ctx.font = '900 130px Arial';
      ctx.fillText(String(gols), cardX + cardW - 50, y + 140);
      ctx.textAlign = 'center';
    };

    drawRow(timeCasa, empresaCasa, golsCasa, casaVenceu, 330);
    drawRow(timeFora, empresaFora, golsFora, foraVenceu, 570);

    if (golsCasa === golsFora) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '700 40px Arial';
      ctx.fillText('EMPATE', W / 2, 850);
    }

    ctx.fillStyle = '#f87171';
    ctx.font = '700 38px Arial';
    ctx.fillText(formatarData(dataJogo), W / 2, 940);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '600 34px Arial';
    ctx.fillText('boleiroffice.com.br', W / 2, 1010);

    setDataUrl(canvas.toDataURL('image/png'));
  }, [timeCasa, empresaCasa, golsCasa, timeFora, empresaFora, golsFora, dataJogo]);

  const nomeArquivo = `resultado-${timeCasa}-x-${timeFora}.png`.replace(/\s+/g, '-').toLowerCase();

  const baixar = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl; a.download = nomeArquivo; a.click();
  };

  const compartilhar = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], nomeArquivo, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Resultado · Boleiroffice' });
        return;
      }
    } catch {
      /* fallback abaixo */
    }
    baixar();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="w-full max-w-[320px] rounded-3xl border border-white/10 shadow-2xl" />
      <div className="flex gap-3">
        <button onClick={compartilhar} className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:opacity-90">
          <Share2 size={16} /> Compartilhar
        </button>
        <button onClick={baixar} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10">
          <Download size={16} /> Baixar
        </button>
      </div>
    </div>
  );
};
