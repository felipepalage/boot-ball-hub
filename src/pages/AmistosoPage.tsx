import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Trophy, Users, Shuffle, Timer } from 'lucide-react';
import { authService } from '@/services/authService';
import { amistosoService, type JogadorAmistoso, type PartidaAmistoso, type TimeAmistoso } from '@/services/amistosoService';
import { getApiErrorMessage } from '@/lib/api-error';
import { FlyerDoDia } from '@/components/FlyerDoDia';
import { useAmistosoLive } from '@/hooks/useAmistosoLive';
import { fireConfetti, playGoalSound } from '@/lib/celebrate';

type Tab = 'geral' | 'times' | 'rachao' | 'pagamentos';

const TABS: { id: Tab; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'times', label: 'Times' },
  { id: 'rachao', label: 'Rachão' },
  { id: 'pagamentos', label: 'Pagamentos' },
];

const PARTIDA_KEY = 'amistoso_partida_ativa';

const AmistosoPage = () => {
  const [tab, setTab] = useState<Tab>('geral');
  const user = authService.getCurrentUser();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      {/* Hero */}
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(8,8,8,0.95))] p-6">
        <p className="text-xs uppercase tracking-[0.34em] text-red-200/80">Rachão interno</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Modo Amistoso</h1>
        <p className="mt-2 text-base text-white/60">
          Sorteie times, controle o rachão e acompanhe artilheiros e garçons — só da sua empresa.
        </p>

        <div className="mt-4 flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] transition ${
                tab === t.id ? 'bg-primary text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'geral' && <GeralTab />}
      {tab === 'times' && <TimesTab />}
      {tab === 'rachao' && <RachaoTab empresaNome={user?.empresaNome ?? 'Sua empresa'} />}
      {tab === 'pagamentos' && <PagamentosTab />}
    </div>
  );
};

/* ============================ GERAL (elenco + sorteio) ============================ */

const GeralTab = () => {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [numeroTimes, setNumeroTimes] = useState(2);

  const { data: jogadores = [], isLoading } = useQuery({
    queryKey: ['amistoso', 'jogadores'],
    queryFn: amistosoService.getJogadores,
  });

  const addMut = useMutation({
    mutationFn: (n: string) => amistosoService.addJogador(n),
    onSuccess: () => {
      setNome('');
      queryClient.invalidateQueries({ queryKey: ['amistoso', 'jogadores'] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Algo deu errado. Tente novamente.')),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => amistosoService.removerJogador(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['amistoso', 'jogadores'] }),
    onError: (e) => toast.error(getApiErrorMessage(e, 'Algo deu errado. Tente novamente.')),
  });

  const sortearMut = useMutation({
    mutationFn: () => amistosoService.sortear([...selecionados], numeroTimes),
    onSuccess: () => {
      toast.success('Times sorteados! Confira na aba Times.');
      queryClient.invalidateQueries({ queryKey: ['amistoso', 'times'] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Algo deu errado. Tente novamente.')),
  });

  const toggle = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Adicionar jogador */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/70">Elenco</h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (nome.trim()) addMut.mutate(nome.trim());
          }}
        >
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do jogador"
            className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={addMut.isPending}
            className="flex items-center gap-1 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={18} /> Add
          </button>
        </form>
      </section>

      {/* Sorteio */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
            Sorteio ({selecionados.size} presentes)
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-white/40">Times</span>
            <select
              value={numeroTimes}
              onChange={(e) => setNumeroTimes(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white focus:outline-none"
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && <p className="text-white/40">Carregando elenco...</p>}
        {!isLoading && jogadores.length === 0 && (
          <p className="text-white/40">Nenhum jogador no elenco ainda. Adicione acima.</p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {jogadores.map((j) => {
            const on = selecionados.has(j.id);
            return (
              <div
                key={j.id}
                className={`flex items-center justify-between rounded-2xl border px-4 py-2.5 transition ${
                  on ? 'border-primary bg-primary/10' : 'border-white/10 bg-black/20'
                }`}
              >
                <label className="flex flex-1 cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={on} onChange={() => toggle(j.id)} className="h-4 w-4 accent-red-600" />
                  <span className="font-medium text-white">{j.nome}</span>
                </label>
                <button
                  onClick={() => delMut.mutate(j.id)}
                  className="text-white/30 transition hover:text-red-400"
                  title="Remover do elenco"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => sortearMut.mutate()}
          disabled={sortearMut.isPending || selecionados.size < numeroTimes}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-40"
        >
          <Shuffle size={18} /> Sortear times
        </button>
      </section>
    </div>
  );
};

/* ============================ TIMES ============================ */

const TimesTab = () => {
  const { data: times = [], isLoading } = useQuery({
    queryKey: ['amistoso', 'times'],
    queryFn: amistosoService.getTimes,
  });

  if (isLoading) return <p className="text-white/40">Carregando times...</p>;
  if (times.length === 0)
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/40">
        Nenhum time sorteado ainda. Vá na aba <span className="text-white/70">Geral</span> e sorteie.
      </div>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {times.map((t) => (
        <div key={t.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h3 className="text-lg font-black text-white">{t.nome}</h3>
            <span className="ml-auto text-xs text-white/40">{t.jogadores.length} jog.</span>
          </div>
          <ul className="space-y-1.5">
            {t.jogadores.map((nome, i) => (
              <li key={i} className="rounded-xl bg-black/20 px-3 py-2 text-sm text-white/80">
                {nome}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/* ============================ RACHÃO (partidas + ranking + flyer) ============================ */

function fmtCron(seg: number) {
  const m = Math.floor(seg / 60)
    .toString()
    .padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const RachaoTab = ({ empresaNome }: { empresaNome: string }) => {
  const queryClient = useQueryClient();
  const [partida, setPartida] = useState<PartidaAmistoso | null>(null);
  const [inicioEpoch, setInicioEpoch] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [golOpen, setGolOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const { data: jogadores = [] } = useQuery({
    queryKey: ['amistoso', 'jogadores'],
    queryFn: amistosoService.getJogadores,
  });
  const { data: times = [] } = useQuery({
    queryKey: ['amistoso', 'times'],
    queryFn: amistosoService.getTimes,
  });
  const { data: artilheiros = [] } = useQuery({
    queryKey: ['amistoso', 'artilheiros'],
    queryFn: amistosoService.getArtilheiros,
  });
  const { data: garcons = [] } = useQuery({
    queryKey: ['amistoso', 'garcons'],
    queryFn: amistosoService.getGarcons,
  });
  const { data: resumo } = useQuery({
    queryKey: ['amistoso', 'resumo-dia'],
    queryFn: () => amistosoService.getResumoDia(),
  });

  // Placar ao vivo: recarrega a partida quando outro dispositivo registra gol/finaliza
  useAmistosoLive((e) => {
    if (partida && e.partidaId === partida.id) {
      amistosoService.getPartida(partida.id).then(setPartida).catch(() => {});
      if (e.finalizada) {
        queryClient.invalidateQueries({ queryKey: ['amistoso', 'artilheiros'] });
        queryClient.invalidateQueries({ queryKey: ['amistoso', 'garcons'] });
        queryClient.invalidateQueries({ queryKey: ['amistoso', 'resumo-dia'] });
      }
    }
  });

  // Restaura partida ativa do localStorage
  useEffect(() => {
    const raw = localStorage.getItem(PARTIDA_KEY);
    if (!raw) return;
    try {
      const { id, inicio } = JSON.parse(raw) as { id: string; inicio: number };
      amistosoService
        .getPartida(id)
        .then((p) => {
          if (!p.finalizada) {
            setPartida(p);
            setInicioEpoch(inicio);
          } else {
            localStorage.removeItem(PARTIDA_KEY);
          }
        })
        .catch(() => localStorage.removeItem(PARTIDA_KEY));
    } catch {
      localStorage.removeItem(PARTIDA_KEY);
    }
  }, []);

  // Cronômetro
  useEffect(() => {
    if (inicioEpoch == null) return;
    const tick = () => setElapsed(Math.floor((Date.now() - inicioEpoch) / 1000));
    tick();
    timerRef.current = window.setInterval(tick, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [inicioEpoch]);

  const iniciarMut = useMutation({
    mutationFn: () => amistosoService.iniciarPartida(),
    onSuccess: (p) => {
      const inicio = Date.now();
      setPartida(p);
      setInicioEpoch(inicio);
      localStorage.setItem(PARTIDA_KEY, JSON.stringify({ id: p.id, inicio }));
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Algo deu errado. Tente novamente.')),
  });

  const golMut = useMutation({
    mutationFn: (payload: { timeNumero: number; autorNome: string; assistenteNome?: string | null }) =>
      amistosoService.registrarGol(partida!.id, payload),
    onSuccess: (p) => {
      setPartida(p);
      setGolOpen(false);
      fireConfetti();
      playGoalSound();
      toast.success('GOOOL! ⚽');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Algo deu errado. Tente novamente.')),
  });

  const anularMut = useMutation({
    mutationFn: (golId: string) => amistosoService.anularGol(partida!.id, golId),
    onSuccess: (p) => {
      setPartida(p);
      toast.success('Gol anulado.');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Não foi possível anular o gol.')),
  });

  const finalizarMut = useMutation({
    mutationFn: () => amistosoService.finalizarPartida(partida!.id, elapsed),
    onSuccess: () => {
      fireConfetti(220, 2400);
      toast.success('Partida finalizada e salva!');
      localStorage.removeItem(PARTIDA_KEY);
      setPartida(null);
      setInicioEpoch(null);
      setElapsed(0);
      queryClient.invalidateQueries({ queryKey: ['amistoso', 'artilheiros'] });
      queryClient.invalidateQueries({ queryKey: ['amistoso', 'garcons'] });
      queryClient.invalidateQueries({ queryKey: ['amistoso', 'resumo-dia'] });
      queryClient.invalidateQueries({ queryKey: ['amistoso', 'partidas'] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Algo deu errado. Tente novamente.')),
  });

  return (
    <div className="space-y-6">
      {/* Partida ativa / iniciar */}
      {!partida ? (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          <Timer size={40} className="mx-auto mb-3 text-primary" />
          <h2 className="text-lg font-black text-white">Nenhuma partida em andamento</h2>
          <p className="mt-1 text-sm text-white/50">Inicie uma partida entre Time 1 e Time 2.</p>
          <button
            onClick={() => iniciarMut.mutate()}
            disabled={iniciarMut.isPending}
            className="mt-4 rounded-2xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Iniciar nova partida
          </button>
        </section>
      ) : (
        <section className="rounded-3xl border border-primary/30 bg-[linear-gradient(135deg,rgba(127,29,29,0.25),rgba(8,8,8,0.9))] p-6">
          <div className="mb-4 text-center font-mono text-5xl font-black text-white">{fmtCron(elapsed)}</div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-white/50">{partida.time1Nome}</p>
              <p className="text-6xl font-black text-white">{partida.time1Gols}</p>
            </div>
            <span className="text-3xl font-black text-white/30">×</span>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-white/50">{partida.time2Nome}</p>
              <p className="text-6xl font-black text-white">{partida.time2Gols}</p>
            </div>
          </div>

          <button
            onClick={() => setGolOpen(true)}
            className="mt-6 w-full rounded-2xl bg-amber-500 py-4 text-xl font-black uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
          >
            ⚽ GOOOL!!
          </button>
          <button
            onClick={() => finalizarMut.mutate()}
            disabled={finalizarMut.isPending}
            className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Finalizar partida
          </button>

          {partida.gols.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-white/40">Gols da partida</p>
              {partida.gols.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate text-white/80">
                    ⚽ {g.autorNome}
                    <span className="text-white/40"> · {g.timeNumero === 1 ? partida.time1Nome : partida.time2Nome}</span>
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Anular o gol de ${g.autorNome}?`)) anularMut.mutate(g.id);
                    }}
                    disabled={anularMut.isPending}
                    className="ml-2 shrink-0 text-white/30 transition hover:text-rose-400 disabled:opacity-40"
                    title="Anular gol"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Ranking artilheiros / garçons */}
      <div className="grid gap-4 sm:grid-cols-2">
        <RankingCard titulo="Artilheiros" icon="👑" itens={artilheiros} sufixo="gols" />
        <RankingCard titulo="Garçons" icon="🎩" itens={garcons} sufixo="assist." />
      </div>

      {/* Resumo do dia + flyer */}
      {resumo && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">Flyer do dia</h2>
            <span className="ml-auto text-xs text-white/40">
              {resumo.totalPartidas} partidas • {resumo.totalGols} gols
            </span>
          </div>
          {resumo.totalPartidas === 0 ? (
            <p className="text-sm text-white/40">
              Nenhuma partida finalizada hoje ainda. O flyer aparece após finalizar partidas.
            </p>
          ) : (
            <FlyerDoDia resumo={resumo} empresaNome={empresaNome} />
          )}
        </section>
      )}

      {golOpen && partida && (
        <GolModal
          partida={partida}
          jogadores={jogadores}
          times={times}
          onClose={() => setGolOpen(false)}
          onConfirm={(payload) => golMut.mutate(payload)}
          pending={golMut.isPending}
        />
      )}
    </div>
  );
};

const RankingCard = ({
  titulo,
  icon,
  itens,
  sufixo,
}: {
  titulo: string;
  icon: string;
  itens: { nome: string; total: number }[];
  sufixo: string;
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white/70">
      <span>{icon}</span> {titulo}
    </h3>
    {itens.length === 0 ? (
      <p className="text-sm text-white/30">Sem dados ainda.</p>
    ) : (
      <ol className="space-y-1.5">
        {itens.slice(0, 10).map((it, i) => (
          <li key={it.nome} className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-2">
            <span className="w-5 text-center text-sm font-black text-white/40">{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-white">{it.nome}</span>
            <span className="text-sm font-black text-primary">
              {it.total} {sufixo}
            </span>
          </li>
        ))}
      </ol>
    )}
  </div>
);

const GolModal = ({
  partida,
  jogadores,
  times,
  onClose,
  onConfirm,
  pending,
}: {
  partida: PartidaAmistoso;
  jogadores: JogadorAmistoso[];
  times: TimeAmistoso[];
  onClose: () => void;
  onConfirm: (p: { timeNumero: number; autorNome: string; assistenteNome?: string | null }) => void;
  pending: boolean;
}) => {
  const [timeNumero, setTimeNumero] = useState(1);
  const [autor, setAutor] = useState('');
  const [assist, setAssist] = useState('');

  const timeNome = timeNumero === 1 ? partida.time1Nome : partida.time2Nome;

  // Jogadores do time selecionado (casando pelo nome do time sorteado).
  // Se o time não foi sorteado / não bater, cai pro elenco completo como fallback.
  const jogadoresDoTime = useMemo(() => {
    const t = times.find((x) => x.nome === timeNome);
    return t && t.jogadores.length ? t.jogadores : jogadores.map((j) => j.nome);
  }, [times, timeNome, jogadores]);

  // Ao trocar de time, limpa a seleção (o jogador é de outro time).
  useEffect(() => {
    setAutor('');
    setAssist('');
  }, [timeNumero]);

  const selectClass =
    'mb-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-white focus:border-primary focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b0b] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-black text-white">Registrar gol ⚽</h3>

        <label className="mb-1 block text-xs uppercase tracking-widest text-white/40">Time</label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {[1, 2].map((n) => (
            <button
              key={n}
              onClick={() => setTimeNumero(n)}
              className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${
                timeNumero === n ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/50'
              }`}
            >
              {n === 1 ? partida.time1Nome : partida.time2Nome}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs uppercase tracking-widest text-white/40">Quem fez o gol</label>
        <select value={autor} onChange={(e) => setAutor(e.target.value)} className={selectClass}>
          <option value="">Selecione o jogador</option>
          {jogadoresDoTime.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs uppercase tracking-widest text-white/40">Assistência (opcional)</label>
        <select value={assist} onChange={(e) => setAssist(e.target.value)} className={selectClass}>
          <option value="">Ninguém / não registrar</option>
          {jogadoresDoTime
            .filter((n) => n !== autor)
            .map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
        </select>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/15 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            disabled={!autor.trim() || pending}
            onClick={() =>
              onConfirm({ timeNumero, autorNome: autor.trim(), assistenteNome: assist.trim() || null })
            }
            className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-40"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================ PAGAMENTOS ============================ */

const PagamentosTab = () => {
  const queryClient = useQueryClient();
  const { data: jogadores = [], isLoading } = useQuery({
    queryKey: ['amistoso', 'jogadores'],
    queryFn: amistosoService.getJogadores,
  });

  const pagMut = useMutation({
    mutationFn: ({ id, pagou }: { id: string; pagou: boolean }) => amistosoService.atualizarPagamento(id, pagou),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['amistoso', 'jogadores'] }),
    onError: (e) => toast.error(getApiErrorMessage(e, 'Algo deu errado. Tente novamente.')),
  });

  const zerarMut = useMutation({
    mutationFn: () => amistosoService.zerarPagamentos(),
    onSuccess: () => {
      toast.success('Pagamentos zerados para o novo mês!');
      queryClient.invalidateQueries({ queryKey: ['amistoso', 'jogadores'] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Algo deu errado. Tente novamente.')),
  });

  const pagos = jogadores.filter((j) => j.pagouMensalidade).length;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
            Mensalidade ({pagos}/{jogadores.length} pagaram)
          </h2>
          <button
            onClick={() => {
              if (confirm('Zerar todos os pagamentos? Use ao iniciar um novo mês.')) zerarMut.mutate();
            }}
            disabled={zerarMut.isPending}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Zerar mês
          </button>
        </div>

        {isLoading && <p className="text-white/40">Carregando...</p>}
        {!isLoading && jogadores.length === 0 && (
          <p className="text-white/40">Nenhum jogador no elenco. Adicione na aba Geral.</p>
        )}

        <div className="space-y-2">
          {jogadores.map((j) => (
            <label
              key={j.id}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                j.pagouMensalidade ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-black/20'
              }`}
            >
              <span className="font-medium text-white">{j.nome}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    j.pagouMensalidade ? 'text-emerald-300' : 'text-white/30'
                  }`}
                >
                  {j.pagouMensalidade ? 'Pago' : 'Pendente'}
                </span>
                <input
                  type="checkbox"
                  checked={j.pagouMensalidade}
                  onChange={(e) => pagMut.mutate({ id: j.id, pagou: e.target.checked })}
                  className="h-5 w-5 accent-emerald-600"
                />
              </div>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AmistosoPage;
