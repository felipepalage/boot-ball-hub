import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { calendarioService } from '@/services/calendarioService';
import { authService } from '@/services/authService';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const STATUS_COLORS: Record<string, string> = {
  Confirmado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Aberto: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'Aguardando resultado': 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Finalizado: 'bg-white/10 text-muted-foreground border-white/10',
};

export default function CalendarioPage() {
  const activeTeamId = authService.getActiveTeamId?.() ?? '';
  const today = new Date();
  const [ano, setAno] = useState(today.getFullYear());
  const [mes, setMes] = useState(today.getMonth() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ['calendario', activeTeamId, ano, mes],
    queryFn: () => calendarioService.getMes(activeTeamId, ano, mes),
    enabled: !!activeTeamId,
  });

  const prev = () => {
    if (mes === 1) { setAno((y) => y - 1); setMes(12); }
    else setMes((m) => m - 1);
  };
  const next = () => {
    if (mes === 12) { setAno((y) => y + 1); setMes(1); }
    else setMes((m) => m + 1);
  };

  return (
    <div className="min-h-dvh bg-background pb-32 pt-6">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <CalendarDays size={22} className="text-primary" />
          <h1 className="text-2xl font-black tracking-tight">Agenda</h1>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-secondary/40 px-4 py-3">
          <button onClick={prev} className="rounded-xl p-2 hover:bg-white/10">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold uppercase tracking-[0.2em]">
            {MESES[mes - 1]} {ano}
          </span>
          <button onClick={next} className="rounded-xl p-2 hover:bg-white/10">
            <ChevronRight size={18} />
          </button>
        </div>

        {!activeTeamId && (
          <p className="text-center text-muted-foreground">Selecione um time para ver a agenda.</p>
        )}

        {isLoading && <p className="text-center text-muted-foreground">Carregando...</p>}

        {data && data.jogos.length === 0 && (
          <p className="text-center text-muted-foreground">Nenhum jogo neste mês.</p>
        )}

        <div className="space-y-3">
          {data?.jogos.map((jogo) => (
            <div
              key={jogo.desafioId}
              className="rounded-3xl border border-white/10 bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {jogo.dataJogo} • {jogo.horaJogo}
                  </p>
                  <p className="mt-1 text-lg font-black text-foreground">
                    vs {jogo.nomeAdversario}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {jogo.local}{jogo.bairro ? ` — ${jogo.bairro}` : ''}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    STATUS_COLORS[jogo.statusLabel] ?? 'bg-white/10 text-white border-white/10'
                  }`}
                >
                  {jogo.statusLabel}
                </span>
              </div>
              {!jogo.souCriador && (
                <p className="mt-2 text-xs text-muted-foreground">Você foi desafiado</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
