import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { TeamCrest } from '@/components/TeamCrest';
import { rankingService, type RankingPeriodo } from '@/services/rankingService';

type RankingTab = 'times' | 'artilheiros' | 'reputacao' | 'indicacoes';

const PERIODOS: { id: RankingPeriodo; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'mensal', label: 'Mensal' },
  { id: 'semanal', label: 'Semanal' },
];

const RankRow = ({
  pos,
  crestNome,
  escudoShape,
  corPrimaria,
  corSecundaria,
  nome,
  sub,
  chips,
  destaque,
  destaqueLabel,
}: {
  pos: number;
  crestNome: string;
  escudoShape?: number;
  corPrimaria?: string;
  corSecundaria?: string;
  nome: string;
  sub?: string;
  chips: string[];
  destaque: number | string;
  destaqueLabel: string;
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
    <div className="w-6 shrink-0 text-center text-sm font-black text-foreground">
      {pos <= 3 ? <Trophy size={15} className="mx-auto text-primary" /> : pos}
    </div>
    <TeamCrest nome={crestNome} shape={escudoShape || 1} corPrimaria={corPrimaria || '#DC2626'} corSecundaria={corSecundaria || '#111827'} size={40} />
    <div className="min-w-0 flex-1">
      <p className="truncate font-bold text-foreground">{nome}</p>
      {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      {chips.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] tabular-nums text-muted-foreground">
          {chips.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      )}
    </div>
    <div className="shrink-0 pl-1 text-right">
      <p className="text-2xl font-black tabular-nums text-primary">{destaque}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{destaqueLabel}</p>
    </div>
  </div>
);

const RankingPage = () => {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<RankingTab>('times');
  const [periodo, setPeriodo] = useState<RankingPeriodo>('geral');

  const rankingQuery = useQuery({
    queryKey: ['ranking', page, periodo],
    queryFn: () => rankingService.getAll(page, 20, periodo),
    enabled: tab === 'times',
  });

  const scorersQuery = useQuery({
    queryKey: ['ranking-artilheiros', page, periodo],
    queryFn: () => rankingService.getScorers(page, 20, periodo),
    enabled: tab === 'artilheiros',
  });

  const reputationQuery = useQuery({
    queryKey: ['ranking-reputacao', page, periodo],
    queryFn: () => rankingService.getReputation(page, 20, periodo),
    enabled: tab === 'reputacao',
  });

  const indicacoesQuery = useQuery({
    queryKey: ['ranking-indicacoes'],
    queryFn: rankingService.getIndicacoes,
    enabled: tab === 'indicacoes',
  });

  const dataset = tab === 'times' ? rankingQuery.data : tab === 'artilheiros' ? scorersQuery.data : reputationQuery.data;
  const isLoading = tab === 'times' ? rankingQuery.isLoading : tab === 'artilheiros' ? scorersQuery.isLoading : reputationQuery.isLoading;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Tabela oficial</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Ranking corporativo</h1>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'times', label: 'Times' },
            { id: 'artilheiros', label: 'Artilheiros' },
            { id: 'reputacao', label: 'Reputacao' },
            { id: 'indicacoes', label: 'Indicações' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id as RankingTab); setPage(1); }}
              className={`rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] transition ${tab === item.id ? 'bg-primary text-white' : 'border border-white/10 text-foreground hover:bg-secondary'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-2xl border border-white/10 bg-card/80 p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPeriodo(p.id); setPage(1); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] transition ${periodo === p.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'indicacoes' && (
        <div className="rounded-[2rem] border border-white/10 bg-card/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="space-y-2">
            {indicacoesQuery.isLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-secondary/40" />
            ))}
            {!indicacoesQuery.isLoading && (indicacoesQuery.data?.length ?? 0) === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">Ninguém indicou empresas ainda. Compartilhe seu link de indicação (botão "Indicar empresa" no perfil da empresa).</p>
            )}
            {indicacoesQuery.data?.map((item, i) => (
              <div key={item.empresaId} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="w-6 shrink-0 text-center text-sm font-black text-primary">{i + 1}</div>
                <div className="min-w-0 flex-1"><p className="truncate font-bold text-foreground">{item.empresaNome}</p></div>
                <div className="shrink-0 pl-1 text-right">
                  <p className="text-2xl font-black tabular-nums text-primary">{item.total}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">indicações</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab !== 'indicacoes' && (
      <>
      <div className="rounded-[2rem] border border-white/10 bg-card/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="space-y-2">
          {isLoading && Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[68px] animate-pulse rounded-2xl bg-secondary/40" />
          ))}

          {!isLoading && dataset?.items.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Sem dados nesse período ainda.</p>
          )}

          {tab === 'times' && rankingQuery.data?.items.map((item) => (
            <RankRow
              key={item.timeId}
              pos={item.posicao}
              crestNome={item.time}
              escudoShape={item.escudoShape}
              corPrimaria={item.corPrimaria}
              corSecundaria={item.corSecundaria}
              nome={item.time}
              sub={item.empresa}
              chips={[`J ${item.jogos}`, `V ${item.vitorias}`, `GP ${item.golsPro}`, `SG ${item.saldo > 0 ? `+${item.saldo}` : item.saldo}`]}
              destaque={item.pontos}
              destaqueLabel="pts"
            />
          ))}

          {tab === 'artilheiros' && scorersQuery.data?.items.map((item) => (
            <RankRow
              key={`${item.timeId}-${item.nomeAutor}`}
              pos={item.posicao}
              crestNome={item.time}
              escudoShape={item.escudoShape}
              corPrimaria={item.corPrimaria}
              corSecundaria={item.corSecundaria}
              nome={item.nomeAutor}
              sub={`${item.time} · ${item.empresa}`}
              chips={[`Jogos c/ gol ${item.jogosComGol}`]}
              destaque={item.gols}
              destaqueLabel="gols"
            />
          ))}

          {tab === 'reputacao' && reputationQuery.data?.items.map((item) => (
            <RankRow
              key={item.timeId}
              pos={item.posicao}
              crestNome={item.time}
              escudoShape={item.escudoShape}
              corPrimaria={item.corPrimaria}
              corSecundaria={item.corSecundaria}
              nome={item.time}
              sub={item.empresa}
              chips={[`✓ ${item.comparecimentos}`, `⏰ ${item.cancelamentosTardios}`, `⚡ ${item.confirmacoesRapidas}`]}
              destaque={item.indiceConfiabilidade}
              destaqueLabel="índice"
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">Anterior</button>
        <span>Pagina {dataset?.page ?? page} de {Math.max(dataset?.totalPages ?? 1, 1)}</span>
        <button onClick={() => setPage((prev) => prev + 1)} disabled={Boolean(dataset) && page >= (dataset?.totalPages ?? 1)} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">Proxima</button>
      </div>
      </>
      )}
    </div>
  );
};

export default RankingPage;
