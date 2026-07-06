import { useMemo, useState } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import type { PartidaAmistoso } from '@/services/amistosoService';
import { iaService } from '@/services/iaService';
import { getApiErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';

interface VitoriaAmistosoOverlayProps {
  partida: PartidaAmistoso;
  onClose: () => void;
}

export const VitoriaAmistosoOverlay = ({ partida, onClose }: VitoriaAmistosoOverlayProps) => {
  const [narracao, setNarracao] = useState<string | null>(null);
  const [narrando, setNarrando] = useState(false);

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

  const gerar = async () => {
    setNarrando(true);
    try {
      const texto = await iaService.gerarNarracao({
        titulo: `${partida.time1Nome} x ${partida.time2Nome}`,
        placar: `${partida.time1Gols} x ${partida.time2Gols}`,
        artilheiros: partida.gols.map((g) => g.autorNome),
        contexto: 'Rachão amistoso entre colegas de empresa',
      });
      setNarracao(texto);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Não foi possível gerar a narração.'));
    } finally {
      setNarrando(false);
    }
  };

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

        {narracao ? (
          <p className="mt-4 rounded-2xl bg-black/30 p-3 text-sm italic text-white/80">“{narracao}”</p>
        ) : (
          <button
            onClick={gerar}
            disabled={narrando}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20 disabled:opacity-50"
          >
            <Sparkles size={14} /> {narrando ? 'Gerando...' : 'Narração da partida (IA)'}
          </button>
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
