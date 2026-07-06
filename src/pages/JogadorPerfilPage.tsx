import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Target, Calendar, Flame, Star } from 'lucide-react';
import { jogadorService } from '@/services/jogadorService';
import { TeamCrest } from '@/components/TeamCrest';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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

  useDocumentTitle(jogador?.nome);

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

  // ── Gamificação (XP / nível / medalhas) — derivada das estatísticas ──
  const xp = jogador.totalGols * 10 + jogador.jogosComGol * 5 + jogador.totalJogosTime * 2;
  const nivel = Math.floor(Math.sqrt(xp / 40)) + 1;
  const xpNivelAtual = 40 * (nivel - 1) ** 2;
  const xpProxNivel = 40 * nivel ** 2;
  const progresso =
    xpProxNivel > xpNivelAtual
      ? Math.min(100, Math.round(((xp - xpNivelAtual) / (xpProxNivel - xpNivelAtual)) * 100))
      : 100;

  const mediaNum = jogador.totalJogosTime > 0 ? jogador.totalGols / jogador.totalJogosTime : 0;
  const medalhas = [
    { emoji: '🎬', titulo: 'Estreante', desc: 'Jogou a 1ª partida', ok: jogador.totalJogosTime >= 1 },
    { emoji: '🎯', titulo: 'Goleador', desc: '10+ gols', ok: jogador.totalGols >= 10 },
    { emoji: '💣', titulo: 'Matador', desc: '25+ gols', ok: jogador.totalGols >= 25 },
    { emoji: '🔥', titulo: 'Faro de gol', desc: 'Média ≥ 1 gol/jogo', ok: jogador.totalJogosTime >= 5 && mediaNum >= 1 },
    { emoji: '📅', titulo: 'Presença', desc: '10+ jogos', ok: jogador.totalJogosTime >= 10 },
    { emoji: '🏅', titulo: 'Veterano', desc: '25+ jogos', ok: jogador.totalJogosTime >= 25 },
  ];
  const medalhasOk = medalhas.filter((m) => m.ok).length;

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

      {/* Nível / XP */}
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Star size={22} className="fill-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nível</p>
              <p className="text-2xl font-black text-foreground">{nivel}</p>
            </div>
          </div>
          <p className="text-xs font-bold text-muted-foreground">{xp} XP</p>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-black/30">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progresso}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {xpProxNivel - xp} XP para o nível {nivel + 1}
        </p>
      </div>

      {/* Medalhas */}
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Medalhas</p>
          <span className="text-xs font-bold text-muted-foreground">{medalhasOk}/{medalhas.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {medalhas.map((m) => (
            <div
              key={m.titulo}
              className={`flex items-center gap-2.5 rounded-2xl border p-3 transition ${
                m.ok ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-white/10 bg-black/20 opacity-60'
              }`}
            >
              <span className={`text-xl ${m.ok ? '' : 'grayscale'}`}>{m.emoji}</span>
              <div className="min-w-0">
                <p className={`text-xs font-bold ${m.ok ? 'text-yellow-300' : 'text-muted-foreground'}`}>{m.titulo}</p>
                <p className="truncate text-[10px] text-muted-foreground">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
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
