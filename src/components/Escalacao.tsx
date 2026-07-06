import { useMemo, useState } from 'react';

interface Jogador {
  id: string;
  nome: string;
  numeroCamisa?: number;
}

const FORMACOES: Record<string, number[]> = {
  '4-4-2': [1, 4, 4, 2],
  '4-3-3': [1, 4, 3, 3],
  '3-5-2': [1, 3, 5, 2],
  '3-4-3': [1, 3, 4, 3],
};

interface EscalacaoProps {
  jogadores: Jogador[];
  corPrimaria?: string;
}

export const Escalacao = ({ jogadores, corPrimaria }: EscalacaoProps) => {
  const [formacao, setFormacao] = useState('4-4-2');
  const cor = corPrimaria || '#DC2626';
  const linhas = FORMACOES[formacao];

  const { marcadores, banco } = useMemo(() => {
    const totalSlots = linhas.reduce((a, b) => a + b, 0);
    const titulares = jogadores.slice(0, totalSlots);
    const nLinhas = linhas.length;
    const marks: { x: number; y: number; jog?: Jogador }[] = [];
    let idx = 0;
    linhas.forEach((count, li) => {
      const y = 90 - (li / (nLinhas - 1)) * 78; // GK embaixo (90%), ataque em cima (12%)
      for (let i = 0; i < count; i++) {
        const x = ((i + 1) / (count + 1)) * 100;
        marks.push({ x, y, jog: titulares[idx] });
        idx++;
      }
    });
    return { marcadores: marks, banco: jogadores.slice(totalSlots) };
  }, [jogadores, linhas]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Escalação</h2>
        <select
          value={formacao}
          onChange={(e) => setFormacao(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          {Object.keys(FORMACOES).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div
        className="relative mx-auto aspect-[2/3] w-full max-w-xs overflow-hidden rounded-2xl border border-emerald-700/40"
        style={{ background: 'repeating-linear-gradient(0deg,#14532d 0,#14532d 7%,#166534 7%,#166534 14%)' }}
      >
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        <div className="absolute left-1/2 top-0 h-[14%] w-[46%] -translate-x-1/2 border-x border-b border-white/20" />
        <div className="absolute bottom-0 left-1/2 h-[14%] w-[46%] -translate-x-1/2 border-x border-t border-white/20" />

        {marcadores.map((m, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
            <div
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white shadow-lg"
              style={{ background: cor, border: '2px solid rgba(255,255,255,0.65)' }}
            >
              {m.jog?.numeroCamisa ?? ''}
            </div>
            <p className="mx-auto mt-0.5 max-w-[64px] truncate text-[9px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
              {m.jog ? m.jog.nome.split(' ')[0] : '—'}
            </p>
          </div>
        ))}
      </div>

      {banco.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Banco</p>
          <div className="flex flex-wrap gap-2">
            {banco.map((j) => (
              <span key={j.id} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-foreground">
                {j.numeroCamisa ? `#${j.numeroCamisa} ` : ''}
                {j.nome}
              </span>
            ))}
          </div>
        </div>
      )}

      {jogadores.length === 0 && (
        <p className="mt-3 text-center text-sm text-muted-foreground">Adicione jogadores ao elenco pra montar a escalação.</p>
      )}
    </section>
  );
};
