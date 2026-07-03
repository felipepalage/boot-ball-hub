import { useQuery } from '@tanstack/react-query';
import { Swords } from 'lucide-react';
import { rivalidadeService } from '@/services/rivalidadeService';

interface RivaisTimeProps {
  timeId: string;
}

export const RivaisTime = ({ timeId }: RivaisTimeProps) => {
  const { data: rivais = [] } = useQuery({
    queryKey: ['rivais', timeId],
    queryFn: () => rivalidadeService.list(timeId),
  });

  if (rivais.length === 0) return null;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-card p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-foreground">
        <Swords size={16} className="text-primary" /> Confrontos diretos
      </div>
      <div className="space-y-2">
        {rivais.map((r) => (
          <div key={r.timeId} className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{r.nomeTime}</p>
              <p className="text-xs text-muted-foreground">
                {r.totalJogos} jogo{r.totalJogos !== 1 ? 's' : ''}
                {r.bairroBase ? ` • ${r.bairroBase}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-xs font-black">
              <span className="rounded-lg bg-emerald-500/15 px-2 py-1 text-emerald-400">{r.vitorias}V</span>
              <span className="rounded-lg bg-white/10 px-2 py-1 text-muted-foreground">{r.empates}E</span>
              <span className="rounded-lg bg-rose-500/15 px-2 py-1 text-rose-400">{r.derrotas}D</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
