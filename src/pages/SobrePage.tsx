import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Swords, ShieldCheck, Trophy, Target, Users } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const passos = [
  { icon: Building2, titulo: '1. Cadastre a empresa por CNPJ', texto: 'O acesso é exclusivo para empresas. O cadastro valida o CNPJ e cria o perfil corporativo com os seus times.' },
  { icon: Swords, titulo: '2. Desafie outras empresas', texto: 'Crie um desafio com data, local e horário. A empresa adversária aceita e o jogo entra na agenda de todos.' },
  { icon: ShieldCheck, titulo: '3. Confirme o resultado', texto: 'Depois do jogo, o placar é proposto e confirmado pelas duas equipes — sem discussão sobre quem venceu.' },
  { icon: Trophy, titulo: '4. Suba no ranking', texto: 'Vitórias, saldo de gols, artilharia e reputação alimentam o ranking corporativo público automaticamente.' },
];

const faq = [
  { q: 'Quem pode se cadastrar no Boleiroffice?', a: 'Apenas empresas com CNPJ válido. O cadastro é corporativo — cada empresa entra com seus times e jogadores.' },
  { q: 'O ranking é público?', a: 'Sim. O ranking corporativo e a artilharia geral ficam visíveis para qualquer pessoa, mesmo sem login, para fortalecer a disputa entre as empresas.' },
  { q: 'Dá para organizar rachão/pelada?', a: 'Sim. Você gera um link de presença, a galera confirma pelo celular e os times são sorteados automaticamente antes do jogo.' },
  { q: 'Quanto custa?', a: 'É só cadastrar a empresa pelo CNPJ e começar a marcar os jogos.' },
];

const SobrePage = () => {
  useDocumentTitle('Sobre o Boleiroffice · Como funciona o futebol corporativo');

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/"><img src={logo} alt="Boleiroffice" className="h-20 w-auto sm:h-24" /></Link>
          <nav className="flex items-center gap-2">
            <Link to="/ranking" className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">Ranking</Link>
            <Link to="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">Cadastrar empresa</Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Sobre a plataforma</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          O que é o Boleiroffice, a plataforma de futebol corporativo entre empresas.
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          O <strong className="text-foreground">Boleiroffice</strong> é a plataforma que organiza o futebol corporativo brasileiro:
          empresas marcam amistosos entre si, aceitam desafios, confirmam os resultados e disputam um ranking
          corporativo público. Em vez de planilhas soltas e grupos de mensagem bagunçados, cada empresa tem seu
          perfil, seus times e seu histórico de jogos num só lugar.
        </p>

        <h2 className="mt-12 text-2xl font-black tracking-tight">Como funciona</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {passos.map(({ icon: Icon, titulo, texto }) => (
            <section key={titulo} className="rounded-2xl border border-white/10 bg-card p-5">
              <Icon size={22} className="text-primary" />
              <h3 className="mt-3 text-lg font-bold">{titulo}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{texto}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-black tracking-tight">Para quem é</h2>
        <p className="mt-4 leading-8 text-muted-foreground">
          Para empresas de qualquer porte que já jogam bola entre os funcionários ou querem começar. RH,
          endomarketing e os próprios boleiros da firma usam o Boleiroffice para transformar a pelada da empresa
          numa liga de verdade — com <strong className="text-foreground">amistosos corporativos</strong>,
          <strong className="text-foreground"> ranking entre empresas</strong>, artilharia geral e até sorteio de
          times para o rachão.
        </p>

        <h2 className="mt-12 text-2xl font-black tracking-tight">Perguntas frequentes</h2>
        <div className="mt-6 space-y-4">
          {faq.map((item) => (
            <section key={item.q} className="rounded-2xl border border-white/10 bg-card p-5">
              <h3 className="text-base font-bold">{item.q}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.a}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-[2rem] border border-white/10 bg-card/70 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-primary" size={26} />
            <div>
              <p className="text-lg font-black">Coloque sua empresa na disputa</p>
              <p className="text-sm text-muted-foreground">Cadastro por CNPJ. Comece a marcar amistosos hoje.</p>
            </div>
          </div>
          <Link to="/register" className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5">
            Cadastrar empresa <ArrowRight size={16} />
          </Link>
        </div>
      </article>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4">
          <Link to="/" className="transition hover:text-foreground">Início</Link>
          <Link to="/ranking" className="transition hover:text-foreground">Ranking</Link>
          <Link to="/artilharia" className="transition hover:text-foreground">Artilharia</Link>
          <Link to="/termos" className="transition hover:text-foreground">Termos</Link>
          <Link to="/privacidade" className="transition hover:text-foreground">Privacidade</Link>
        </div>
      </footer>
    </main>
  );
};

export default SobrePage;
