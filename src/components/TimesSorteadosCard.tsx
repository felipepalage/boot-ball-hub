import { useEffect, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';

interface TimeItem {
  nome: string;
  jogadores: string[];
}

interface TimesSorteadosCardProps {
  times: TimeItem[];
  empresaNome?: string;
  legenda?: string; // ex.: data/horário
}

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

/** Card 1080xN com os times sorteados, pra baixar/compartilhar no grupo. */
export const TimesSorteadosCard = ({ times, empresaNome, legenda }: TimesSorteadosCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || times.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const cols = times.length <= 1 ? 1 : 2;
    const rows = Math.ceil(times.length / cols);
    const maxJog = Math.max(6, ...times.map((t) => t.jogadores.length));
    const margem = 60;
    const gap = 36;
    const cardW = (W - margem * 2 - (cols - 1) * gap) / cols;
    const linhaH = 52;
    const cardH = 104 + maxJog * linhaH + 24;
    const topo = 300;
    const rodape = 130;
    const H = topo + rows * cardH + (rows - 1) * gap + rodape;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#111827');
    grad.addColorStop(0.5, '#0a0a0c');
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W / 2, 200, 40, W / 2, 200, 560);
    glow.addColorStop(0, 'rgba(220,38,38,0.30)');
    glow.addColorStop(1, 'rgba(220,38,38,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 620);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, H - 12, W, 12);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '700 32px Arial';
    ctx.fillText('B O L E I R O F F I C E', W / 2, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 88px Arial';
    ctx.fillText('TIMES SORTEADOS', W / 2, 215);
    if (empresaNome || legenda) {
      ctx.fillStyle = '#f87171';
      ctx.font = '700 36px Arial';
      ctx.fillText([empresaNome, legenda].filter(Boolean).join('  ·  '), W / 2, 268);
    }

    times.forEach((t, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const x = margem + c * (cardW + gap);
      const y = topo + r * (cardH + gap);

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(ctx, x, y, cardW, cardH, 32);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, cardW, cardH, 32);
      ctx.stroke();

      // faixa do título
      ctx.fillStyle = '#dc2626';
      roundRect(ctx, x, y, cardW, 76, 32);
      ctx.fill();
      ctx.fillRect(x, y + 40, cardW, 36);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 40px Arial';
      ctx.fillText(clip(ctx, t.nome, cardW - 60), x + 30, y + 52);

      ctx.font = '600 34px Arial';
      t.jogadores.forEach((nome, i) => {
        const ly = y + 104 + i * linhaH;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(`${i + 1}.`, x + 30, ly + 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(clip(ctx, nome, cardW - 110), x + 78, ly + 30);
      });
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '600 34px Arial';
    ctx.fillText('boleiroffice.com.br', W / 2, H - 55);

    setDataUrl(canvas.toDataURL('image/png'));
  }, [times, empresaNome, legenda]);

  const nomeArquivo = 'times-sorteados-boleiroffice.png';

  const baixar = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = nomeArquivo;
    a.click();
  };

  const compartilhar = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], nomeArquivo, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Times sorteados · Boleiroffice' });
        return;
      }
    } catch {
      /* fallback abaixo */
    }
    baixar();
  };

  if (times.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="w-full max-w-[340px] rounded-3xl border border-white/10 shadow-2xl" />
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
