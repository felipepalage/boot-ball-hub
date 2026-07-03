import { useQuery } from '@tanstack/react-query';
import { Award } from 'lucide-react';
import { conquistaService } from '@/services/conquistaService';

interface ConquistasTimeProps {
  timeId: string;
}

export const ConquistasTime = ({ timeId }: ConquistasTimeProps) => {
  const { data: conquistas = [] } = useQuery({
    queryKey: ['conquistas', timeId],
    queryFn: () => conquistaService.list(timeId),
  });

  if (conquistas.length === 0) return null;

  const desbloqueadas = conquistas.filter((c) => c.conquistado).length;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-foreground">
          <Award size={16} className="text-yellow-400" /> Conquistas
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          {desbloqueadas}/{conquistas.length}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {conquistas.map((c) => (
          <div
            key={c.tipo}
            className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
              c.conquistado ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-white/10 bg-black/20 opacity-60'
            }`}
          >
            <span className={`text-2xl ${c.conquistado ? '' : 'grayscale'}`}>{c.emoji || '🎖️'}</span>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${c.conquistado ? 'text-yellow-300' : 'text-muted-foreground'}`}>
                {c.titulo}
              </p>
              <p className="text-xs text-muted-foreground">{c.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
