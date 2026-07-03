import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Target, Calendar, Flame } from 'lucide-react';
import { jogadorService } from '@/services/jogadorService';
import { TeamCrest } from '@/components/TeamCrest';

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="rounded-2xl border border-white/10 bg-card p-4 text-center">
    <p className="text-3xl font-black text-foreground">{value}</p>
    {sub && <p className="text-xs text-primary font-bold">{sub}</p>}
    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
  </div>
);

const JogadorPerfilPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: jogador, isLoading } = useQuery({
    queryKey: ['jogador-perfil', id],
    queryFn: () => jogadorService.getPerfil(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 animate-pulse space-y-4">
        <div className="h-8 w-32 rounded-xl bg-secondary" />
        <div className="h-48 rounded-[2rem] bg-secondary" />
      </div>
    );
  }

  if (!jogador) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-12 text-center text-muted-foreground">
        Jogador não encontrado.
      </div>
    );
  }

  const mediaGols = jogador.totalJogosTime > 0
    ? (jogador.totalGols / jogador.totalJogosTime).toFixed(2)
    : '0.00';

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <Link to={`/times/${jogador.timeId}`} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ChevronLeft size={16} /> Voltar ao time
      </Link>

      {/* Hero */}
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(8,8,8,0.95))] p-6">
        <div className="flex items-center gap-5">
          {/* Jersey number display */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white"
            style={{ background: `linear-gradient(135deg, ${jogador.corPrimaria}, ${jogador.corSecundaria})` }}
          >
            #{jogador.numeroCamisa}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">
              {jogador.posicao}
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white truncate">
              {jogador.nome}
            </h1>
            <Link to={`/times/${jogador.timeId}`} className="mt-2 flex items-center gap-2 hover:opacity-80 transition">
              <TeamCrest
                nome={jogador.timeNome}
                shape={jogador.escudoShape}
                corPrimaria={jogador.corPrimaria}
                corSecundaria={jogador.corSecundaria}
                size={22}
              />
              <span className="text-sm text-white/70">{jogador.timeNome}</span>
              <span className="text-xs text-white/40">· {jogador.nomeEmpresa}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Gols marcados" value={jogador.totalGols} />
        <StatCard label="Jogos com gol" value={jogador.jogosComGol} />
        <StatCard label="Média/jogo" value={mediaGols} sub="gols/jogo" />
      </div>

      {/* Context */}
      <div className="rounded-[2rem] border border-white/10 bg-card p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Contexto do time
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Calendar size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Jogos do time</p>
            <p className="text-xs text-muted-foreground">{jogador.totalJogosTime} jogos finalizados</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Target size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Taxa de conversão</p>
            <p className="text-xs text-muted-foreground">
              Marcou em {jogador.totalJogosTime > 0 ? Math.round((jogador.jogosComGol / jogador.totalJogosTime) * 100) : 0}% dos jogos do time
            </p>
          </div>
        </div>
        {jogador.totalGols > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Flame size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Artilharia</p>
              <p className="text-xs text-muted-foreground">
                {jogador.totalGols} gols em {jogador.jogosComGol} partida{jogador.jogosComGol !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JogadorPerfilPage;
