import { useQuery } from '@tanstack/react-query';
import { Target, Check } from 'lucide-react';
import { rankingService } from '@/services/rankingService';

interface MissoesSemanaProps {
  timeId: string;
}

export const MissoesSemana = ({ timeId }: MissoesSemanaProps) => {
  const { data } = useQuery({
    queryKey: ['ranking', 'semanal', 'missoes'],
    queryFn: () => rankingService.getAll(1, 100, 'semanal'),
    enabled: Boolean(timeId),
  });

  if (!timeId) return null;

  const time = data?.items.find((i) => i.timeId === timeId);
  const jogos = time?.jogos ?? 0;
  const vitorias = time?.vitorias ?? 0;
  const gols = time?.golsPro ?? 0;

  const missoes = [
    { emoji: '📅', titulo: 'Dispute 3 partidas na semana', progresso: jogos, meta: 3, xp: 30 },
    { emoji: '🏆', titulo: 'Vença 2 jogos na semana', progresso: vitorias, meta: 2, xp: 50 },
    { emoji: '⚽', titulo: 'Marque 5 gols na semana', progresso: gols, meta: 5, xp: 40 },
  ];

  const xpTotal = missoes.filter((m) => m.progresso >= m.meta).reduce((s, m) => s + m.xp, 0);
  const xpPossivel = missoes.reduce((s, m) => s + m.xp, 0);

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-card/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-foreground">
          <Target size={16} className="text-primary" /> Missões da semana
        </div>
        <span className="text-xs font-bold text-primary">
          {xpTotal}/{xpPossivel} XP
        </span>
      </div>

      <div className="space-y-3">
        {missoes.map((m) => {
          const done = m.progresso >= m.meta;
          const pct = Math.min(100, Math.round((m.progresso / m.meta) * 100));
          return (
            <div key={m.titulo} className={`rounded-2xl border p-3 transition ${done ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-black/20'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span>{m.emoji}</span> {m.titulo}
                </p>
                <span className={`flex shrink-0 items-center gap-1 text-xs font-bold ${done ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {done ? <><Check size={13} /> +{m.xp} XP</> : `${m.progresso}/${m.meta}`}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                <div className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
