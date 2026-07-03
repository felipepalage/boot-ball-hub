import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MatchFeedCard } from '@/components/MatchFeedCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { feedService } from '@/services/feedService';

type FeedFilter = 'todos' | 'rodada' | 'destaque';

const FILTERS: { id: FeedFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'rodada', label: 'Jogo da Rodada' },
  { id: 'destaque', label: 'Destaque do Dia' },
];

const FeedPage = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FeedFilter>('todos');

  const { data: jogos, isLoading } = useQuery({
    queryKey: ['feed-jogos', page],
    queryFn: () => feedService.getJogos(page, 10),
  });

  const allItems = jogos?.items ?? [];
  const filtered =
    filter === 'rodada' ? allItems.filter((j) => j.jogoDaRodada) :
    filter === 'destaque' ? allItems.filter((j) => j.destaqueDoDia) :
    allItems;

  const destaque = filtered[0];
  const restante = filtered.slice(1);

  function handleFilter(f: FeedFilter) {
    setFilter(f);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(8,8,8,0.95))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.34em] text-red-200/80">Redacao Boleiroffice</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Ultimos resultados do futebol corporativo</h1>
        <p className="mt-3 max-w-3xl text-base text-white/72">
          Vitorias, empates e historias das equipes publicadas em formato de manchete, sempre puxando os dados oficiais das partidas finalizadas.
        </p>
        {/* Filter tabs */}
        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition ${
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'border border-white/20 text-white/60 hover:border-white/40 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {isLoading && Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
        {!isLoading && destaque && <MatchFeedCard match={destaque} />}
        {!isLoading && restante.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {restante.map((jogo) => <MatchFeedCard key={jogo.id} match={jogo} />)}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
            {filter === 'todos' ? 'Nenhum jogo finalizado ainda.' : 'Nenhum resultado nesse filtro ainda.'}
          </div>
        )}
      </div>

      {filter === 'todos' && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
          <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">Anterior</button>
          <span>Pagina {jogos?.page ?? page} de {Math.max(jogos?.totalPages ?? 1, 1)}</span>
          <button onClick={() => setPage((prev) => prev + 1)} disabled={Boolean(jogos) && page >= (jogos?.totalPages ?? 1)} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">Proxima</button>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
