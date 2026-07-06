import { useEffect, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import type { Desafio } from '@/types';
import { formatDate } from '@/lib/formatters';
import logo from '@/assets/logo.png';

interface MatchResultCardProps {
  desafio: Desafio;
}

/**
 * Card de resultado 1080x1920 (story) de um desafio finalizado, com a logo do Boleiroffice.
 * Renderiza no <canvas> e permite baixar / compartilhar como imagem.
 */
export const MatchResultCard = ({ desafio }: MatchResultCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const logoImg = new Image();
    logoImg.src = logo;

    const draw = () => {
      // Fundo
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#7f1d1d');
      grad.addColorStop(0.5, '#1a0a0a');
      grad.addColorStop(1, '#050505');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(W / 2, 460, 40, W / 2, 460, 680);
      glow.addColorStop(0, 'rgba(220,38,38,0.35)');
      glow.addColorStop(1, 'rgba(220,38,38,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, 1050);

      ctx.textAlign = 'center';

      // Logo no topo
      if (logoImg.naturalWidth > 0) {
        const h = 150;
        const w = logoImg.naturalWidth * (h / logoImg.naturalHeight);
        ctx.drawImage(logoImg, W / 2 - w / 2, 70, w, h);
      }

      // Cabeçalho
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '600 32px Arial';
      ctx.fillText((desafio.local || desafio.bairro || '').toUpperCase(), W / 2, 300);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 92px Arial';
      ctx.fillText('RESULTADO', W / 2, 400);

      ctx.fillStyle = '#f87171';
      ctx.font = '700 38px Arial';
      ctx.fillText(formatDate(desafio.dataJogo), W / 2, 464);

      const criador = desafio.timeCriador ?? 'Time 1';
      const desafiante = desafio.timeDesafiante ?? 'Time 2';
      const pc = desafio.placarCriador ?? 0;
      const pd = desafio.placarDesafiante ?? 0;

      fitText(ctx, criador, W / 2, 660, W - 160, 68);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 210px Arial';
      ctx.fillText(`${pc}  x  ${pd}`, W / 2, 920);
      fitText(ctx, desafiante, W / 2, 1030, W - 160, 68);

      const vencedor = pc > pd ? criador : pd > pc ? desafiante : null;
      ctx.fillStyle = '#f59e0b';
      ctx.font = '800 44px Arial';
      ctx.fillText(vencedor ? `🏆 ${vencedor}` : '🤝 Empate', W / 2, 1130);

      // Linha divisória
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(140, 1200);
      ctx.lineTo(W - 140, 1200);
      ctx.stroke();

      // Artilheiros
      const gols = [...(desafio.gols ?? [])].sort((a, b) => b.quantidadeGols - a.quantidadeGols).slice(0, 6);
      if (gols.length > 0) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '700 32px Arial';
        ctx.fillText('ARTILHEIROS', W / 2, 1280);

        ctx.textAlign = 'left';
        let y = 1356;
        for (const g of gols) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 42px Arial';
          const txt = `⚽ ${g.nomeAutor} (${g.quantidadeGols}) — ${g.time}`;
          ctx.fillText(truncate(ctx, txt, W - 200), 150, y);
          y += 74;
        }
        ctx.textAlign = 'center';
      }

      // Rodapé com logo pequena
      if (logoImg.naturalWidth > 0) {
        const h = 52;
        const w = logoImg.naturalWidth * (h / logoImg.naturalHeight);
        ctx.drawImage(logoImg, W / 2 - w / 2, 1770, w, h);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '600 30px Arial';
      ctx.fillText('Boleiroffice • futebol corporativo', W / 2, 1860);

      setDataUrl(canvas.toDataURL('image/png'));
    };

    if (logoImg.complete && logoImg.naturalWidth > 0) draw();
    else {
      logoImg.onload = draw;
      logoImg.onerror = draw; // desenha sem logo se falhar
    }
  }, [desafio]);

  const nomeArquivo = `resultado-${(desafio.timeCriador ?? 'time').toLowerCase().replace(/\s+/g, '-')}.png`;

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
        await navigator.share({ files: [file], title: 'Resultado do jogo' });
        return;
      }
    } catch {
      // fallback
    }
    baixar();
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="w-full max-w-[260px] rounded-3xl border border-white/10 shadow-2xl" />
      <div className="flex gap-3">
        <button
          onClick={baixar}
          className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:opacity-90"
        >
          <Download size={16} /> Baixar
        </button>
        <button
          onClick={compartilhar}
          className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
        >
          <Share2 size={16} /> Compartilhar
        </button>
      </div>
    </div>
  );
};

function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, baseSize: number) {
  let size = baseSize;
  ctx.fillStyle = '#ffffff';
  do {
    ctx.font = `900 ${size}px Arial`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  } while (size > 28);
  ctx.fillText(text, x, y);
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 4 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
  return t + '…';
}
