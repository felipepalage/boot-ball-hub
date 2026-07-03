import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, X, Star } from 'lucide-react';
import { mvpService } from '@/services/mvpService';
import { toast } from 'sonner';

interface Props {
  desafioId: string;
  timeCriador: string;
  timeDesafiante: string;
  onClose: () => void;
}

export const MvpVotingModal = ({ desafioId, timeCriador, timeDesafiante, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['mvp', desafioId],
    queryFn: () => mvpService.get(desafioId),
    onSuccess: (d) => {
      if (d.jogadorVotadoIdPelaMinhaEmpresa) {
        setSelected(d.jogadorVotadoIdPelaMinhaEmpresa);
      }
    },
  });

  const mutation = useMutation({
    mutationFn: (jogadorId: string) => mvpService.votar(desafioId, jogadorId),
    onSuccess: (d) => {
      queryClient.setQueryData(['mvp', desafioId], d);
      setSelected(d.jogadorVotadoIdPelaMinhaEmpresa);
      toast.success('Voto registrado!');
    },
    onError: () => toast.error('Erro ao votar.'),
  });

  const maxVotos = Math.max(...(data?.candidatos.map((c) => c.totalVotos) ?? [1]), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" />
            <h2 className="text-base font-black tracking-tight text-foreground">Votação MVP</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 transition hover:bg-secondary">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="mb-4 text-xs text-muted-foreground">
            {timeCriador} x {timeDesafiante} — Vote no melhor jogador da partida.
          </p>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-secondary/50" />
              ))}
            </div>
          ) : !data?.candidatos.length ? (
            <p className="text-center text-sm text-muted-foreground">
              Nenhum jogador cadastrado nos times desta partida.
            </p>
          ) : (
            <div className="space-y-2">
              {data.candidatos.map((c) => {
                const isSelected = selected === c.jogadorId;
                const barWidth = maxVotos > 0 ? Math.round((c.totalVotos / maxVotos) * 100) : 0;

                return (
                  <button
                    key={c.jogadorId}
                    onClick={() => mutation.mutate(c.jogadorId)}
                    disabled={mutation.isPending}
                    className={`relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-yellow-500/40 bg-yellow-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-yellow-500/8 transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[10px] font-black text-primary">
                          {c.numeroCamisa}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-foreground">{c.nome}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.posicao} · {c.nomeTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-yellow-400">{c.totalVotos}</span>
                        {isSelected && <Star size={12} className="fill-yellow-400 text-yellow-400" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
