import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronLeft, Trophy, Users, Calendar, Play, ChevronRight } from 'lucide-react';
import { torneioService, TORNEIO_STATUS, TORNEIO_FORMATO, PARTIDA_STATUS, type PartidaTorneio } from '@/services/torneioService';
import { timeService } from '@/services/timeService';
import { authService } from '@/services/authService';
import { TeamCrest } from '@/components/TeamCrest';
import { toast } from 'sonner';

const FASE_ORDER = ['Rodada 1', 'Rodada 2', 'Rodada 3', 'Rodada 4', 'Oitavas', 'Oitavas de Final', 'Quartas', 'Quartas de Final', 'Semis', 'Semifinal', '3º Lugar', 'Terceiro Lugar', 'Final'];

const sortFases = (fases: string[]) =>
  [...fases].sort((a, b) => {
    const ia = FASE_ORDER.findIndex((f) => f.toLowerCase() === a.toLowerCase());
    const ib = FASE_ORDER.findIndex((f) => f.toLowerCase() === b.toLowerCase());
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

const STATUS_COLOR: Record<number, string> = {
  0: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  1: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  2: 'bg-white/5 text-white/50 border-white/10',
  3: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const PartidaCard = ({ partida }: { partida: PartidaTorneio }) => {
  const done = partida.status === 1 || partida.status === 2;
  const mandanteWon = done && (partida.placarMandante ?? 0) > (partida.placarVisitante ?? 0);
  const visitanteWon = done && (partida.placarVisitante ?? 0) > (partida.placarMandante ?? 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-background p-3 min-w-[180px]">
      {/* Mandante */}
      <div className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${mandanteWon ? 'bg-primary/10' : ''}`}>
        <TeamCrest
          nome={partida.timeMandante}
          shape={partida.timeMandanteEscudoShape}
          corPrimaria={partida.timeMandanteCorPrimaria}
          corSecundaria={partida.timeMandanteCorSecundaria}
          size={20}
        />
        <span className={`flex-1 truncate text-xs font-bold ${mandanteWon ? 'text-foreground' : 'text-muted-foreground'}`}>
          {partida.timeMandante}
        </span>
        {done && (
          <span className={`text-sm font-black tabular-nums ${mandanteWon ? 'text-foreground' : 'text-muted-foreground'}`}>
            {partida.placarMandante ?? '—'}
          </span>
        )}
      </div>

      {/* Separator */}
      <div className="my-1 border-t border-white/5" />

      {/* Visitante */}
      <div className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${visitanteWon ? 'bg-primary/10' : ''}`}>
        {partida.timeVisitante ? (
          <>
            <TeamCrest
              nome={partida.timeVisitante}
              shape={partida.timeVisitanteEscudoShape}
              corPrimaria={partida.timeVisitanteCorPrimaria}
              corSecundaria={partida.timeVisitanteCorSecundaria}
              size={20}
            />
            <span className={`flex-1 truncate text-xs font-bold ${visitanteWon ? 'text-foreground' : 'text-muted-foreground'}`}>
              {partida.timeVisitante}
            </span>
            {done && (
              <span className={`text-sm font-black tabular-nums ${visitanteWon ? 'text-foreground' : 'text-muted-foreground'}`}>
                {partida.placarVisitante ?? '—'}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-white/20 italic">A definir</span>
        )}
      </div>

      {partida.status === 2 && (
        <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-wider text-red-400">W.O.</p>
      )}
    </div>
  );
};

const TorneioDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const currentUser = authService.getCurrentUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'bracket' | 'times'>('bracket');

  const { data: torneio, isLoading } = useQuery({
    queryKey: ['torneio', id],
    queryFn: () => torneioService.getById(id!),
    enabled: !!id,
  });

  const { data: meusTimesData } = useQuery({
    queryKey: ['minha-empresa', currentUser?.empresaId],
    queryFn: async () => {
      const { empresaService } = await import('@/services/empresaService');
      return empresaService.getById(currentUser!.empresaId);
    },
    enabled: !!currentUser,
  });

  const inscreverMutation = useMutation({
    mutationFn: (timeId: string) => torneioService.inscrever(id!, timeId),
    onSuccess: () => {
      toast.success('Time inscrito.');
      queryClient.invalidateQueries({ queryKey: ['torneio', id] });
    },
    onError: () => toast.error('Erro ao inscrever time.'),
  });

  const iniciarMutation = useMutation({
    mutationFn: () => torneioService.iniciar(id!),
    onSuccess: () => {
      toast.success('Torneio iniciado!');
      queryClient.invalidateQueries({ queryKey: ['torneio', id] });
    },
    onError: () => toast.error('Erro ao iniciar torneio.'),
  });

  if (isLoading || !torneio) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 animate-pulse space-y-4">
        <div className="h-8 w-32 rounded-xl bg-secondary" />
        <div className="h-40 rounded-[2rem] bg-secondary" />
      </div>
    );
  }

  const isOrganizador = currentUser?.empresaId === torneio.empresaOrganizadoraId;
  const meusTimes = meusTimesData?.times ?? [];
  const timesInscritos = new Set(torneio.inscricoes.map((i) => i.timeId));
  const timesNaoInscritos = meusTimes.filter((t) => !timesInscritos.has(t.id));

  // Build bracket
  const fases = sortFases([...new Set(torneio.partidas.map((p) => p.fase))]);
  const partidasPorFase: Record<string, PartidaTorneio[]> = {};
  for (const p of torneio.partidas) {
    if (!partidasPorFase[p.fase]) partidasPorFase[p.fase] = [];
    partidasPorFase[p.fase].push(p);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <Link to="/torneios" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ChevronLeft size={16} /> Torneios
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(8,8,8,0.95))] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-red-200/70">
              {torneio.empresaOrganizadora} · {TORNEIO_FORMATO[torneio.formato]}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">{torneio.nome}</h1>
            {torneio.descricao && <p className="mt-1 text-sm text-white/60">{torneio.descricao}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Users size={12} /> {torneio.totalInscritos} times
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(torneio.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <span className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] ${STATUS_COLOR[torneio.status]}`}>
            {TORNEIO_STATUS[torneio.status]}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {torneio.status === 0 && timesNaoInscritos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {timesNaoInscritos.map((t) => (
                <button
                  key={t.id}
                  onClick={() => inscreverMutation.mutate(t.id)}
                  disabled={inscreverMutation.isPending}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
                >
                  <TeamCrest nome={t.nome} shape={t.escudoShape ?? 1} corPrimaria={t.corPrimaria ?? '#DC2626'} corSecundaria={t.corSecundaria ?? '#111827'} size={16} />
                  Inscrever {t.nome}
                </button>
              ))}
            </div>
          )}
          {isOrganizador && torneio.status === 0 && torneio.totalInscritos >= 2 && (
            <button
              onClick={() => iniciarMutation.mutate()}
              disabled={iniciarMutation.isPending}
              className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Play size={14} /> Iniciar torneio
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {(['bracket', 'times'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-2xl px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] transition ${activeTab === tab ? 'bg-primary text-white' : 'border border-white/10 text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'bracket' ? (torneio.formato === 0 ? 'Chaveamento' : 'Grupos') : 'Times'}
          </button>
        ))}
      </div>

      {/* Bracket View */}
      {activeTab === 'bracket' && (
        <>
          {torneio.partidas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-10 text-center text-muted-foreground">
              {torneio.status === 0
                ? 'O chaveamento será gerado quando o torneio for iniciado.'
                : 'Nenhuma partida cadastrada ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max">
                {fases.map((fase, fi) => (
                  <div key={fase} className="flex flex-col gap-2">
                    {/* Phase header */}
                    <div className="mb-2 flex items-center gap-2">
                      {fi > 0 && <ChevronRight size={14} className="text-white/20" />}
                      <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                        {fase}
                      </span>
                    </div>
                    {/* Match cards for this phase */}
                    <div className="flex flex-col gap-3">
                      {partidasPorFase[fase]?.map((p) => (
                        <PartidaCard key={p.id} partida={p} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Teams View */}
      {activeTab === 'times' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {torneio.inscricoes.length === 0 && (
            <div className="col-span-2 rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
              Nenhum time inscrito ainda.
            </div>
          )}
          {torneio.inscricoes.map((insc) => (
            <Link
              key={insc.timeId}
              to={`/times/${insc.timeId}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card p-4 transition hover:border-primary/30"
            >
              <TeamCrest
                nome={insc.nomeTime}
                shape={insc.escudoShape}
                corPrimaria={insc.corPrimaria}
                corSecundaria={insc.corSecundaria}
                size={44}
              />
              <div>
                <p className="font-bold text-foreground">{insc.nomeTime}</p>
                <p className="text-xs text-muted-foreground">{insc.nomeEmpresa}</p>
                {insc.grupoLetra && (
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Grupo {insc.grupoLetra}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TorneioDetalhePage;
