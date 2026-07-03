import { useEffect, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import type { ResumoDia } from '@/services/amistosoService';

interface FlyerDoDiaProps {
  resumo: ResumoDia;
  empresaNome: string;
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Gera um flyer 1080x1920 (formato story) com o resumo do dia do rachão.
 * Renderiza no <canvas>, exibe preview e permite baixar/compartilhar como imagem.
 */
export const FlyerDoDia = ({ resumo, empresaNome }: FlyerDoDiaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // Fundo gradiente
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.5, '#1a0a0a');
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Brilho decorativo
    const glow = ctx.createRadialGradient(W / 2, 340, 40, W / 2, 340, 620);
    glow.addColorStop(0, 'rgba(220,38,38,0.35)');
    glow.addColorStop(1, 'rgba(220,38,38,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 900);

    ctx.textAlign = 'center';

    // Cabeçalho
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '600 34px Arial';
    ctx.fillText(empresaNome.toUpperCase(), W / 2, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 96px Arial';
    ctx.fillText('RACHÃO DO DIA', W / 2, 300);

    ctx.fillStyle = '#f87171';
    ctx.font = '700 40px Arial';
    ctx.fillText(formatarData(resumo.data), W / 2, 370);

    // Bola / emoji
    ctx.font = '160px Arial';
    ctx.fillText('⚽', W / 2, 620);

    // Destaques
    const drawDestaque = (emoji: string, titulo: string, nome: string, sub: string, y: number) => {
      // card
      const cardX = 90;
      const cardW = W - 180;
      const cardH = 230;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(ctx, cardX, y, cardW, cardH, 40);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, cardX, y, cardW, cardH, 40);
      ctx.stroke();

      ctx.font = '90px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(emoji, cardX + 50, y + 145);

      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '700 30px Arial';
      ctx.fillText(titulo.toUpperCase(), cardX + 190, y + 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 62px Arial';
      ctx.fillText(nome, cardX + 190, y + 150);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '700 34px Arial';
      ctx.fillText(sub, cardX + 190, y + 200);

      ctx.textAlign = 'center';
    };

    drawDestaque(
      '👑',
      'Artilheiro do dia',
      resumo.artilheiroDia?.nome ?? '—',
      resumo.artilheiroDia ? `${resumo.artilheiroDia.total} gol(s)` : 'sem gols',
      760,
    );
    drawDestaque(
      '🎩',
      'Garçom do dia',
      resumo.garcomDia?.nome ?? '—',
      resumo.garcomDia ? `${resumo.garcomDia.total} assist.` : 'sem assistências',
      1030,
    );

    // Estatísticas
    const drawStat = (valor: string, label: string, cx: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 110px Arial';
      ctx.fillText(valor, cx, 1420);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '700 32px Arial';
      ctx.fillText(label.toUpperCase(), cx, 1480);
    };
    drawStat(String(resumo.totalPartidas), 'Partidas', W / 2 - 240);
    drawStat(String(resumo.totalGols), 'Gols', W / 2 + 240);

    // Rodapé
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '600 32px Arial';
    ctx.fillText('Boleiroffice • Modo Amistoso', W / 2, 1820);

    setDataUrl(canvas.toDataURL('image/png'));
  }, [resumo, empresaNome]);

  const nomeArquivo = `rachao-${resumo.data.slice(0, 10)}.png`;

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
        await navigator.share({ files: [file], title: 'Rachão do dia' });
        return;
      }
    } catch {
      // fallback abaixo
    }
    baixar();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[280px] rounded-3xl border border-white/10 shadow-2xl"
      />
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
