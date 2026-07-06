import { useMemo } from 'react';
import { Trophy, X } from 'lucide-react';
import type { PartidaAmistoso } from '@/services/amistosoService';

interface VitoriaAmistosoOverlayProps {
  partida: PartidaAmistoso;
  onClose: () => void;
}

export const VitoriaAmistosoOverlay = ({ partida, onClose }: VitoriaAmistosoOverlayProps) => {
  const vencedor =
    partida.time1Gols > partida.time2Gols
      ? partida.time1Nome
      : partida.time2Gols > partida.time1Gols
      ? partida.time2Nome
      : null;

  const craque = useMemo(() => {
    const cont: Record<string, number> = {};
    for (const g of partida.gols) cont[g.autorNome] = (cont[g.autorNome] ?? 0) + 1;
    let melhor: { nome: string; gols: number } | null = null;
    for (const [nome, gols] of Object.entries(cont)) {
      if (!melhor || gols > melhor.gols) melhor = { nome, gols };
    }
    return melhor;
  }, [partida]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-3xl border border-amber-500/30 bg-[linear-gradient(160deg,rgba(245,158,11,0.14),rgba(8,8,8,0.96))] p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-white/40 transition hover:text-white">
          <X size={18} />
        </button>

        <Trophy size={40} className="mx-auto animate-bounce text-amber-400" />
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-amber-300/80">Fim de jogo</p>
        <h2 className="mt-1 text-3xl font-black text-white">{vencedor ? `${vencedor} venceu!` : 'Empate!'}</h2>

        <div className="mt-4 flex items-center justify-center gap-4 text-white">
          <span className="min-w-0 flex-1 truncate text-right text-sm text-white/60">{partida.time1Nome}</span>
          <span className="shrink-0 text-4xl font-black tabular-nums">
            {partida.time1Gols} × {partida.time2Gols}
          </span>
          <span className="min-w-0 flex-1 truncate text-left text-sm text-white/60">{partida.time2Nome}</span>
        </div>

        {craque && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-widest text-amber-300">👑 Craque da partida</p>
            <p className="mt-1 text-xl font-black text-white">{craque.nome}</p>
            <p className="text-sm text-white/50">
              {craque.gols} gol{craque.gols !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:opacity-90"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
