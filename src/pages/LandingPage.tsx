import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Building2, ShieldCheck, Trophy, Target, CalendarCheck, Newspaper, Users } from 'lucide-react';
import logo from '@/assets/logo.png';
import { TeamCrest } from '@/components/TeamCrest';
import { rankingService } from '@/services/rankingService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const benefits = [
  { icon: Building2, title: 'Cadastro empresarial por CNPJ', text: 'Cada empresa entra com CNPJ valido, perfil publico e times corporativos vinculados.' },
  { icon: CalendarCheck, title: 'Amistosos com fluxo organizado', text: 'Convites, aceite, placar, confirmacao de resultado e historico em um so lugar.' },
  { icon: Trophy, title: 'Ranking corporativo publico', text: 'Times, artilheiros e reputacao ficam visiveis para fortalecer a disputa entre empresas.' },
  { icon: Newspaper, title: 'Feed e prova social', text: 'Jogos finalizados viram conteudo para divulgar a empresa e movimentar a comunidade.' },
];

const LandingPage = () => {
  useDocumentTitle('Boleiroffice | Futebol corporativo entre empresas');

  const ranking = useQuery({
    queryKey: ['landing-ranking'],
    queryFn: () => rankingService.getAll(1, 5, 'geral'),
  });

  const artilheiros = useQuery({
    queryKey: ['landing-artilheiros'],
    queryFn: () => rankingService.getScorers(1, 5, 'geral'),
  });

  const topTimes = ranking.data?.items ?? [];
  const topScorers = artilheiros.data?.items ?? [];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="relative min-h-[92dvh] overflow-hidden bg-[#050505]">
        <div className="absolute inset-0">
          <img src={logo} alt="" className="absolute left-1/2 top-1/2 h-[520px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.055)_0_1px,transparent_1px_96px),repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_72px)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.5)_0%,rgba(5,5,5,0.82)_58%,#09090b_100%)]" />
        </div>

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Boleiroffice" className="h-12 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/64 md:flex">
            <Link to="/ranking" className="transition hover:text-white">Ranking</Link>
            <Link to="/artilharia" className="transition hover:text-white">Artilharia</Link>
            <Link to="/login" className="transition hover:text-white">Entrar</Link>
          </nav>
          <Link to="/register" className="rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:opacity-90">
            Cadastrar empresa
          </Link>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-red-200/80">Futebol corporativo brasileiro</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              A plataforma para empresas marcarem jogos e disputarem ranking.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              O Boleiroffice organiza amistosos entre empresas, valida resultados, registra artilheiros e cria uma vitrine publica para times corporativos. O cadastro e empresarial e feito por CNPJ.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5">
                Cadastrar por CNPJ <ArrowRight size={18} />
              </Link>
              <Link to="/ranking" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/10">
                Ver ranking geral
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="border border-white/10 bg-black/45 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">Ranking corporativo</p>
                  <h2 className="text-2xl font-black text-white">Top empresas</h2>
                </div>
                <Trophy className="text-primary" size={28} />
              </div>
              <div className="space-y-2">
                {topTimes.length === 0 && <p className="py-8 text-center text-sm text-white/45">Ranking carregando...</p>}
                {topTimes.map((item, index) => (
                  <Link key={item.timeId} to="/ranking" className="flex items-center gap-3 border border-white/8 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.06]">
                    <span className="w-6 text-center text-sm font-black text-primary">{index + 1}</span>
                    <TeamCrest nome={item.time} shape={item.escudoShape || 1} corPrimaria={item.corPrimaria || '#DC2626'} corSecundaria={item.corSecundaria || '#111827'} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{item.time}</p>
                      <p className="truncate text-xs text-white/45">{item.empresa}</p>
                    </div>
                    <span className="text-lg font-black text-white">{item.pontos}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/70">
                <Target size={16} className="text-primary" /> Artilharia publica
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {topScorers.slice(0, 4).map((item) => (
                  <Link key={`${item.timeId}-${item.nomeAutor}`} to="/artilharia" className="border border-white/8 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.06]">
                    <p className="truncate text-sm font-bold text-white">{item.nomeAutor}</p>
                    <p className="truncate text-xs text-white/45">{item.time} - {item.gols} gols</p>
                  </Link>
                ))}
                {topScorers.length === 0 && <p className="text-sm text-white/45">Artilharia carregando...</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Como funciona</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Da empresa cadastrada ao jogo publicado no ranking.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="border border-white/10 bg-card p-5">
              <Icon size={24} className="text-primary" />
              <h3 className="mt-4 text-lg font-black text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-card/70 px-4 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Para empresas com CNPJ</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">Coloque sua empresa no futebol corporativo.</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">Cadastre sua organizacao, crie os times e comece a disputar amistosos com ranking publico.</p>
          </div>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5">
            Criar conta empresarial <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;