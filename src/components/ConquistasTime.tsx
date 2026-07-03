import { useQuery } from '@tanstack/react-query';
import { Award } from 'lucide-react';
import { conquistaService } from '@/services/conquistaService';

const BADGE_ICONS: Record<string, string> = {
  VETERANO: '🏅',
  CENTENARIO: '🏆',
  INVICTO: '🛡️',
  DOMINANTE: '⚡',
};

interface ConquistasTimeProps {
  timeId: string;
}

export const ConquistasTime = ({ timeId }: ConquistasTimeProps) => {
  const { data: conquistas = [] } = useQuery({
    queryKey: ['conquistas', timeId],
    queryFn: () => conquistaService.list(timeId),
  });

  const conquistadas = conquistas.filter((c) => c.conquistado);

  if (conquistadas.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <Award size={13} />
        Conquistas
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {conquistadas.map((c) => (
          <span
            key={c.codigo}
            title={c.descricao}
            className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300"
          >
            {BADGE_ICONS[c.codigo] ?? '🎖️'} {c.titulo}
          </span>
        ))}
      </div>
    </div>
  );
};
