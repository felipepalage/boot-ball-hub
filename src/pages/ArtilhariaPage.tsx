import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rankingService, type RankingPeriodo } from '@/services/rankingService';
import { TeamCrest } from '@/components/TeamCrest';

const PERIODOS: { id: RankingPeriodo; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'mensal', label: 'Mensal' },
  { id: 'semanal', label: 'Semanal' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

const ArtilhariaPage = () => {
  const [periodo, setPeriodo] = useState<RankingPeriodo>('geral');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['artilharia', periodo, page],
    queryFn: () => rankingService.getScorers(page, 20, periodo),
  });

  const top3 = data?.items.slice(0, 3) ?? [];
  const rest = data?.items.slice(3) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      {/* Hero */}
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(8,8,8,0.95))] p-6">
        <p className="text-xs uppercase tracking-[0.34em] text-red-200/80">Bota de Ouro</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Artilharia</h1>
        <p className="mt-2 text-base text-white/60">Os maiores goleadores da plataforma.</p>

        <div className="mt-4 flex rounded-2xl border border-white/10 bg-white/5 p-1 w-fit gap-1">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPeriodo(p.id); setPage(1); }}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] transition ${periodo === p.id ? 'bg-primary text-white' : 'text-white/50 hover:text-white'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-secondary" />
          ))}
        </div>
      )}

      {/* Top 3 podium */}
      {!isLoading && top3.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {top3.map((item, idx) => (
            <div
              key={`${item.timeId}-${item.nomeAutor}`}
              className={`relative rounded-[2rem] border p-5 text-center transition ${
                idx === 0
                  ? 'border-amber-500/40 bg-[linear-gradient(135deg,rgba(245,158,11,0.1),rgba(8,8,8,0.9))] shadow-[0_0_40px_rgba(245,158,11,0.08)]'
                  : idx === 1
                  ? 'border-slate-400/30 bg-[linear-gradient(135deg,rgba(148,163,184,0.07),rgba(8,8,8,0.9))]'
                  : 'border-amber-700/30 bg-[linear-gradient(135deg,rgba(180,83,9,0.07),rgba(8,8,8,0.9))]'
              }`}
            >
              <div className="mb-3 text-3xl">{MEDAL[idx]}</div>
              <div className="mb-2 flex justify-center">
                <TeamCrest
                  nome={item.time}
                  shape={item.escudoShape || 1}
                  corPrimaria={item.corPrimaria || '#DC2626'}
                  corSecundaria={item.corSecundaria || '#111827'}
                  size={52}
                />
              </div>
              <p className="text-base font-black text-foreground">{item.nomeAutor}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
              <div className="mt-3 flex items-center justify-center gap-1">
                <span className="text-4xl font-black text-foreground">{item.gols}</span>
                <span className="text-sm text-muted-foreground mt-2">gols</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{item.jogosComGol} jogo{item.jogosComGol !== 1 ? 's' : ''} marcados</p>
            </div>
          ))}
        </div>
      )}

      {/* Rest of the list */}
      {!isLoading && rest.length > 0 && (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-card/80">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Jogador</th>
                <th className="p-4 text-left hidden sm:table-cell">Empresa</th>
                <th className="p-4 text-center">⚽ Gols</th>
                <th className="p-4 text-center hidden sm:table-cell">Jogos</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((item) => (
                <tr key={`${item.timeId}-${item.nomeAutor}`} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition">
                  <td className="p-4 font-bold text-muted-foreground">{item.posicao}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <TeamCrest
                        nome={item.time}
                        shape={item.escudoShape || 1}
                        corPrimaria={item.corPrimaria || '#DC2626'}
                        corSecundaria={item.corSecundaria || '#111827'}
                        size={36}
                      />
                      <div>
                        <p className="font-bold text-foreground">{item.nomeAutor}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">{item.empresa}</td>
                  <td className="p-4 text-center font-black text-primary text-lg">{item.gols}</td>
                  <td className="p-4 text-center text-muted-foreground hidden sm:table-cell">{item.jogosComGol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (data?.items.length ?? 0) === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-10 text-center text-muted-foreground">
          Nenhum gol registrado ainda.
        </div>
      )}

      {/* Pagination */}
      {(data?.totalPages ?? 1) > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">
            Anterior
          </button>
          <span>Página {page} de {data?.totalPages ?? 1}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.totalPages ?? 1)} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtilhariaPage;
