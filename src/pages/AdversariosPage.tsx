import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Users, Swords } from 'lucide-react';
import { TeamCrest } from '@/components/TeamCrest';
import { SkeletonCard } from '@/components/SkeletonCard';
import { timeService } from '@/services/timeService';
import { authService } from '@/services/authService';

const NIVEIS = ['', 'Iniciante', 'Intermediário', 'Avançado', 'Profissional'];

const AdversariosPage = () => {
  const currentUser = authService.getCurrentUser();
  const [busca, setBusca] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adversarios'],
    queryFn: () => timeService.getAll(1, 100),
  });

  const adversarios = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return (data?.items ?? [])
      .filter((t) => t.empresaId !== currentUser?.empresaId)
      .filter((t) =>
        !q ||
        t.nome.toLowerCase().includes(q) ||
        t.empresaNome.toLowerCase().includes(q) ||
        (t.cidade ?? '').toLowerCase().includes(q) ||
        (t.bairroBase ?? '').toLowerCase().includes(q),
      );
  }, [data?.items, busca, currentUser?.empresaId]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Encontrar adversários</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Times de outras empresas</h1>
        </div>
        <Link to="/desafios/novo" className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5">
          <Swords size={16} /> Criar desafio
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-card/70 px-4 py-2.5">
        <Search size={16} className="text-muted-foreground" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por time, empresa, cidade ou bairro"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-3">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

        {!isLoading && adversarios.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-10 text-center text-muted-foreground">
            Nenhum time de outra empresa por aqui ainda. Convide empresas pra jogar!
          </div>
        )}

        {adversarios.map((t) => (
          <Link
            key={t.id}
            to={`/times/${t.id}`}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-card/80 p-4 transition hover:bg-secondary"
          >
            <TeamCrest nome={t.nome} shape={t.escudoShape || 1} corPrimaria={t.corPrimaria || '#DC2626'} corSecundaria={t.corSecundaria || '#111827'} size={48} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-foreground">{t.nome}</p>
              <p className="truncate text-sm text-muted-foreground">{t.empresaNome}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={12} />{t.bairroBase}{t.cidade ? `, ${t.cidade}` : ''}</span>
                <span className="flex items-center gap-1"><Users size={12} />{t.totalJogadores} jogador{t.totalJogadores !== 1 ? 'es' : ''}</span>
                {t.nivel > 0 && <span className="rounded-full border border-white/10 px-2">{NIVEIS[t.nivel] ?? `Nível ${t.nivel}`}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdversariosPage;
