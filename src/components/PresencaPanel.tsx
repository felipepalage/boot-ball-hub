import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Users } from 'lucide-react';
import { presencaService } from '@/services/presencaService';
import { jogadorService } from '@/services/jogadorService';
import { toast } from 'sonner';

interface Props {
  desafioId: string;
  meuTimeId: string;
}

export const PresencaPanel = ({ desafioId, meuTimeId }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: presenca } = useQuery({
    queryKey: ['presenca', desafioId],
    queryFn: () => presencaService.get(desafioId),
    enabled: open,
  });

  const { data: meuElenco } = useQuery({
    queryKey: ['jogadores-time', meuTimeId],
    queryFn: () => jogadorService.getByTime(meuTimeId),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: ({ jogadorId, confirmado }: { jogadorId: string; confirmado: boolean }) =>
      presencaService.confirmar(desafioId, jogadorId, confirmado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presenca', desafioId] });
    },
    onError: () => toast.error('Erro ao atualizar presença.'),
  });

  const confirmadosIds = new Set(presenca?.confirmados.map((p) => p.jogadorId) ?? []);
  const pendentesIds = new Set(presenca?.pendentes.map((p) => p.jogadorId) ?? []);
  const totalConfirmados = presenca?.confirmados.length ?? 0;

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-white/70 transition hover:text-white"
      >
        <span className="flex items-center gap-2">
          <Users size={14} />
          Confirmação de presença
          {totalConfirmados > 0 && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
              {totalConfirmados} confirmado{totalConfirmados > 1 ? 's' : ''}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3">
          {!meuElenco?.length ? (
            <p className="text-xs text-muted-foreground">Cadastre jogadores no perfil do time para confirmar presenças.</p>
          ) : (
            <div className="space-y-2">
              {meuElenco.map((jogador) => {
                const confirmado = confirmadosIds.has(jogador.id);
                const pendente = pendentesIds.has(jogador.id);
                const loading = mutation.isPending;

                return (
                  <div key={jogador.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-black text-primary">
                        {jogador.numeroCamisa}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{jogador.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{jogador.posicao}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {confirmado && <span className="text-[10px] font-bold text-emerald-400">Confirmado</span>}
                      {pendente && <span className="text-[10px] font-bold text-red-400">Ausente</span>}
                      <button
                        onClick={() => mutation.mutate({ jogadorId: jogador.id, confirmado: true })}
                        disabled={loading}
                        className={`rounded-lg p-1.5 transition ${confirmado ? 'text-emerald-400' : 'text-white/30 hover:text-emerald-400'}`}
                        title="Confirmar"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => mutation.mutate({ jogadorId: jogador.id, confirmado: false })}
                        disabled={loading}
                        className={`rounded-lg p-1.5 transition ${pendente ? 'text-red-400' : 'text-white/30 hover:text-red-400'}`}
                        title="Marcar ausente"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
