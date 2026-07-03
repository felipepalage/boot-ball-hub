import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { TeamCrest } from '@/components/TeamCrest';
import { rankingService, type RankingPeriodo } from '@/services/rankingService';

type RankingTab = 'times' | 'artilheiros' | 'reputacao';

const PERIODOS: { id: RankingPeriodo; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'mensal', label: 'Mensal' },
  { id: 'semanal', label: 'Semanal' },
];

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

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-card/80 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-left">Empresa</th>
                {tab === 'times' && <><th className="p-4 text-center">J</th><th className="p-4 text-center">V</th><th className="p-4 text-center">GP</th><th className="p-4 text-center">SG</th><th className="p-4 text-center">PTS</th></>}
                {tab === 'artilheiros' && <><th className="p-4 text-center">Gols</th><th className="p-4 text-center">Jogos</th></>}
                {tab === 'reputacao' && <><th className="p-4 text-center">Compareceu</th><th className="p-4 text-center">Cancelou tarde</th><th className="p-4 text-center">Confirmou rapido</th><th className="p-4 text-center">Indice</th></>}
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-white/5 animate-pulse">
                  <td className="p-4"><div className="h-4 w-6 rounded bg-secondary" /></td>
                  <td className="p-4"><div className="h-4 w-28 rounded bg-secondary" /></td>
                  <td className="p-4"><div className="h-4 w-24 rounded bg-secondary" /></td>
                  <td className="p-4"><div className="mx-auto h-4 w-8 rounded bg-secondary" /></td>
                </tr>
              ))}

              {tab === 'times' && rankingQuery.data?.items.map((item) => (
                <tr key={item.timeId} className="border-b border-white/5 last:border-0">
                  <td className="p-4 font-black text-foreground"><span className="flex items-center gap-2">{item.posicao <= 3 && <Trophy size={15} className="text-primary" />}{item.posicao}</span></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <TeamCrest nome={item.time} shape={item.escudoShape || 1} corPrimaria={item.corPrimaria || '#DC2626'} corSecundaria={item.corSecundaria || '#111827'} size={44} />
                      <p className="font-bold text-foreground">{item.time}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{item.empresa}</td>
                  <td className="p-4 text-center tabular-nums text-foreground">{item.jogos}</td>
                  <td className="p-4 text-center tabular-nums text-foreground">{item.vitorias}</td>
                  <td className="p-4 text-center tabular-nums text-foreground">{item.golsPro}</td>
                  <td className="p-4 text-center tabular-nums font-semibold text-foreground">{item.saldo > 0 ? `+${item.saldo}` : item.saldo}</td>
                  <td className="p-4 text-center tabular-nums font-black text-primary">{item.pontos}</td>
                </tr>
              ))}

              {tab === 'artilheiros' && scorersQuery.data?.items.map((item) => (
                <tr key={`${item.timeId}-${item.nomeAutor}`} className="border-b border-white/5 last:border-0">
                  <td className="p-4 font-black text-foreground">{item.posicao}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <TeamCrest nome={item.time} shape={item.escudoShape || 1} corPrimaria={item.corPrimaria || '#DC2626'} corSecundaria={item.corSecundaria || '#111827'} size={44} />
                      <div>
                        <p className="font-bold text-foreground">{item.nomeAutor}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{item.empresa}</td>
                  <td className="p-4 text-center font-black text-primary">{item.gols}</td>
                  <td className="p-4 text-center text-foreground">{item.jogosComGol}</td>
                </tr>
              ))}

              {tab === 'reputacao' && reputationQuery.data?.items.map((item) => (
                <tr key={item.timeId} className="border-b border-white/5 last:border-0">
                  <td className="p-4 font-black text-foreground">{item.posicao}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <TeamCrest nome={item.time} shape={item.escudoShape || 1} corPrimaria={item.corPrimaria || '#DC2626'} corSecundaria={item.corSecundaria || '#111827'} size={44} />
                      <p className="font-bold text-foreground">{item.time}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{item.empresa}</td>
                  <td className="p-4 text-center text-foreground">{item.comparecimentos}</td>
                  <td className="p-4 text-center text-foreground">{item.cancelamentosTardios}</td>
                  <td className="p-4 text-center text-foreground">{item.confirmacoesRapidas}</td>
                  <td className="p-4 text-center font-black text-primary">{item.indiceConfiabilidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">Anterior</button>
        <span>Pagina {dataset?.page ?? page} de {Math.max(dataset?.totalPages ?? 1, 1)}</span>
        <button onClick={() => setPage((prev) => prev + 1)} disabled={Boolean(dataset) && page >= (dataset?.totalPages ?? 1)} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">Proxima</button>
      </div>
    </div>
  );
};

export default RankingPage;
