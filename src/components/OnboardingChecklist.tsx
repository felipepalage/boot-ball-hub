import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** Guia de primeiros passos — aparece na Home enquanto a empresa não tem time. */
export const OnboardingChecklist = ({ temTime }: { temTime: boolean }) => {
  if (temTime) return null;

  const passos = [
    { n: 1, titulo: 'Crie o time da sua empresa', desc: 'Nome, escudo e cores.', to: '/times', cta: 'Criar time' },
    { n: 2, titulo: 'Adicione os jogadores', desc: 'Monte o elenco no perfil do time.' },
    { n: 3, titulo: 'Desafie outra empresa', desc: 'Encontre adversários e marque o primeiro jogo.', to: '/adversarios', cta: 'Ver adversários' },
  ];

  return (
    <section className="mb-6 rounded-[2rem] border border-primary/30 bg-primary/5 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Primeiros passos</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Bora colocar sua empresa em campo ⚽</h2>
      <p className="mt-1 text-sm text-muted-foreground">Falta pouco pra sua empresa entrar na disputa. Comece pelo time:</p>
      <div className="mt-4 space-y-3">
        {passos.map((p) => (
          <div key={p.n} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card/60 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-black text-primary">{p.n}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{p.titulo}</p>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
            {p.to && (
              <Link to={p.to} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:opacity-90">
                {p.cta} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
