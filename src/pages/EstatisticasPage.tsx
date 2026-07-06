import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, Goal, Users } from 'lucide-react';
import { rankingService } from '@/services/rankingService';

const COR_PONTOS = '#dc2626';
const COR_GOLS = '#f59e0b';
const COR_V = '#10b981';
const COR_E = '#71717a';
const COR_D = '#f43f5e';

const AXIS = { fill: '#a1a1aa', fontSize: 11 } as const;
const GRID = 'rgba(255,255,255,0.06)';

const tooltipStyle = {
  background: '#0b0b0b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12,
};

const curto = (s: string) => (s.length > 9 ? s.slice(0, 8) + '…' : s);

const Card = ({ titulo, children, hint }: { titulo: string; children: React.ReactNode; hint?: string }) => (
  <section className="rounded-[2rem] border border-white/10 bg-card p-5">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">{titulo}</h2>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
    {children}
  </section>
);

const Kpi = ({ icon, valor, label }: { icon: React.ReactNode; valor: number | string; label: string }) => (
  <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-card p-4">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">{icon}</div>
    <div>
      <p className="text-2xl font-black text-foreground">{valor}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  </div>
);

const EstatisticasPage = () => {
  const { data: ranking, isLoading } = useQuery({
    queryKey: ['estatisticas', 'ranking'],
    queryFn: () => rankingService.getAll(1, 50),
  });
  const { data: artilheiros } = useQuery({
    queryKey: ['estatisticas', 'artilheiros'],
    queryFn: () => rankingService.getScorers(1, 10),
  });

  const times = useMemo(() => ranking?.items ?? [], [ranking]);
  const scorers = useMemo(() => artilheiros?.items ?? [], [artilheiros]);

  const totalGols = times.reduce((s, t) => s + t.golsPro, 0);
  const totalPartidas = Math.round(times.reduce((s, t) => s + t.jogos, 0) / 2);

  const dadosPontos = times.slice(0, 8).map((t) => ({ nome: t.time, pontos: t.pontos }));
  const dadosRecord = times.slice(0, 8).map((t) => ({ nome: t.time, Vitórias: t.vitorias, Empates: t.empates, Derrotas: t.derrotas }));
  const dadosGols = scorers.slice(0, 8).map((s) => ({ nome: s.nomeAutor, gols: s.gols }));

  const vazio = !isLoading && times.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(8,8,8,0.95))] p-6">
        <p className="text-xs uppercase tracking-[0.34em] text-red-200/80">Visão geral</p>
        <h1 className="mt-3 flex items-center gap-3 text-4xl font-black tracking-tight text-white">
          <BarChart3 size={30} /> Estatísticas
        </h1>
        <p className="mt-2 text-base text-white/60">Desempenho dos times e artilheiros da liga.</p>
      </div>

      {isLoading && <p className="text-white/40">Carregando estatísticas…</p>}

      {vazio && (
        <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/40">
          Ainda não há jogos finalizados suficientes para gerar estatísticas.
        </div>
      )}

      {!isLoading && times.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Kpi icon={<Users size={18} />} valor={times.length} label="Times" />
            <Kpi icon={<Goal size={18} />} valor={totalGols} label="Gols" />
            <Kpi icon={<BarChart3 size={18} />} valor={totalPartidas} label="Partidas" />
          </div>

          <Card titulo="Pontos por time" hint="Top 8">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dadosPontos} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="nome" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={curto} interval={0} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="pontos" name="Pontos" fill={COR_PONTOS} radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card titulo="Aproveitamento (V/E/D)" hint="Top 8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={dadosRecord} margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="nome" tick={AXIS} axisLine={false} tickLine={false} width={78} tickFormatter={curto} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Vitórias" stackId="a" fill={COR_V} radius={[4, 0, 0, 4]} maxBarSize={22} />
                <Bar dataKey="Empates" stackId="a" fill={COR_E} maxBarSize={22} />
                <Bar dataKey="Derrotas" stackId="a" fill={COR_D} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {dadosGols.length > 0 && (
            <Card titulo="Artilheiros" hint="Top 8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={dadosGols} margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="nome" tick={AXIS} axisLine={false} tickLine={false} width={92} tickFormatter={curto} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="gols" name="Gols" fill={COR_GOLS} radius={[0, 6, 6, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default EstatisticasPage;
