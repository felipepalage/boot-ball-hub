import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeedJogo } from '@/types';
import { TeamCrest } from '@/components/TeamCrest';
import { formatDateTime } from '@/lib/formatters';
import { reacaoFeedService, EMOJIS_REACAO } from '@/services/reacaoFeedService';
import { authService } from '@/services/authService';
import { ComentariosFeed } from '@/components/ComentariosFeed';
import { toast } from 'sonner';

interface MatchFeedCardProps {
  match: FeedJogo;
}

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const ReactionBar = ({ desafioId }: { desafioId: string }) => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['reacoes', desafioId],
    queryFn: () => reacaoFeedService.get(desafioId),
  });

  const mutation = useMutation({
    mutationFn: (emoji: string) => reacaoFeedService.reagir(desafioId, emoji),
    onSuccess: (updated) => {
      queryClient.setQueryData(['reacoes', desafioId], updated);
    },
    onError: () => toast.error('Erro ao reagir.'),
  });

  const contagemPorEmoji = Object.fromEntries(data?.contagens.map((c) => [c.emoji, c.total]) ?? []);

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-6 py-3">
      {EMOJIS_REACAO.map((emoji) => {
        const count = contagemPorEmoji[emoji] ?? 0;
        const mine = data?.minhaReacao === emoji;
        return (
          <button
            key={emoji}
            onClick={() => {
              if (!authService.isAuthenticated()) return toast.error('Faça login para reagir.');
              mutation.mutate(emoji);
            }}
            disabled={mutation.isPending}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition hover:-translate-y-0.5 ${
              mine
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-white/10 bg-white/5 text-foreground hover:border-white/20'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-xs font-bold">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export const MatchFeedCard = ({ match }: MatchFeedCardProps) => (
  <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
    <div className="border-b border-white/10 bg-[#111827] px-6 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-300">Plantao do amistoso corporativo</p>
        {match.jogoDaRodada && <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Jogo da rodada</span>}
        {match.destaqueDoDia && <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Destaque do dia</span>}
      </div>
    </div>

    <div className="p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{formatDateTime(match.dataJogo, match.horaJogo)} • {match.local} • {match.bairro}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">{match.manchete}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{match.resumo}</p>
      <p className="mt-3 text-sm font-semibold text-primary">{match.chamadaEditorial}</p>
      {match.artilheirosResumo && <p className="mt-2 text-sm text-muted-foreground">{match.artilheirosResumo}</p>}

      <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center gap-3 md:justify-end">
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{match.empresaCriadora}</p>
            <p className="text-xl font-black text-foreground">{match.timeCriador}</p>
          </div>
          <TeamCrest nome={match.timeCriador} shape={match.timeCriadorEscudoShape || 1} corPrimaria={match.timeCriadorCorPrimaria || '#DC2626'} corSecundaria={match.timeCriadorCorSecundaria || '#111827'} size={56} />
        </div>

        <div className="flex items-center justify-center rounded-[1.25rem] bg-foreground px-5 py-4 text-2xl font-black tabular-nums text-background">
          {match.placarCriador ?? 0} x {match.placarDesafiante ?? 0}
        </div>

        <div className="flex items-center gap-3">
          <TeamCrest nome={match.timeDesafiante} shape={match.timeDesafianteEscudoShape || 1} corPrimaria={match.timeDesafianteCorPrimaria || '#DC2626'} corSecundaria={match.timeDesafianteCorSecundaria || '#111827'} size={56} />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{match.empresaDesafiante}</p>
            <p className="text-xl font-black text-foreground">{match.timeDesafiante}</p>
          </div>
        </div>
      </div>
    </div>

    <ReactionBar desafioId={match.id} />
    <ComentariosFeed desafioId={match.id} />
  </article>
);
