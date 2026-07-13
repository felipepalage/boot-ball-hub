import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link2, Copy, Check, Users } from 'lucide-react';
import { rachaoService } from '@/services/rachaoService';
import { getApiErrorMessage } from '@/lib/api-error';

const fmtHorario = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const OPCES_JOGADORES = [5, 6, 7, 8, 9, 10, 11];

export const RachaoLinkCard = () => {
  const queryClient = useQueryClient();
  const { data: evento } = useQuery({ queryKey: ['rachao', 'ativo'], queryFn: rachaoService.getAtivo, refetchInterval: 20000 });

  const [horario, setHorario] = useState('');
  const [jogadoresPorTime, setJogadoresPorTime] = useState(6);
  const [copiado, setCopiado] = useState(false);
  const [novoForm, setNovoForm] = useState(false);

  const criar = useMutation({
    mutationFn: () => rachaoService.criar(new Date(horario).toISOString(), jogadoresPorTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rachao', 'ativo'] });
      setNovoForm(false);
      setHorario('');
      toast.success('Link do rachão gerado!');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Não foi possível gerar o link.')),
  });

  const link = evento ? `${window.location.origin}/r/${evento.token}` : '';
  const copiar = () => {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  const mostrarForm = !evento || novoForm;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-card/70 p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-foreground">
        <Link2 size={16} className="text-primary" /> Link de presença
      </div>

      {mostrarForm ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (horario) criar.mutate();
          }}
        >
          <p className="text-sm text-muted-foreground">
            Crie um link pra galera confirmar presença. Os times são sorteados
            automaticamente ~2h antes — quem sobrar fica pro próximo.
          </p>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">Horário do jogo</label>
            <input
              type="datetime-local"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">Jogadores por time (linha)</label>
            <select
              value={jogadoresPorTime}
              onChange={(e) => setJogadoresPorTime(Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-white focus:border-primary focus:outline-none"
            >
              {OPCES_JOGADORES.map((n) => (
                <option key={n} value={n} className="bg-black text-white">{n} na linha (fut{n - 1})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={criar.isPending || !horario}
              className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {criar.isPending ? 'Gerando...' : 'Gerar link'}
            </button>
            {evento && (
              <button type="button" onClick={() => setNovoForm(false)} className="rounded-2xl border border-white/15 px-4 text-sm text-white/70 transition hover:bg-white/5">
                Cancelar
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input readOnly value={link} className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white/80" />
            <button onClick={copiar} className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">🕐 {fmtHorario(evento!.horarioEvento)} · sorteio automático</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${evento!.sorteioFeito ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
              {evento!.sorteioFeito ? 'Times sorteados' : 'Aguardando (sorteio ~2h antes)'}
            </span>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Users size={13} /> Confirmados ({evento!.confirmados.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {evento!.confirmados.length === 0 && <p className="text-sm text-muted-foreground">Ninguém confirmou ainda.</p>}
              {evento!.confirmados.map((c) => (
                <span key={c.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-foreground">{c.nome}{c.empresa ? ` - ${c.empresa}` : ''}</span>
              ))}
            </div>
          </div>

          <button onClick={() => setNovoForm(true)} className="w-full rounded-2xl border border-white/10 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition hover:bg-secondary">
            Criar outro rachão
          </button>
        </div>
      )}
    </section>
  );
};