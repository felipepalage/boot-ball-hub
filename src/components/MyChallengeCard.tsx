import { useEffect, useMemo, useState } from 'react';
import type { Desafio } from '@/types';
import { DesafioStatus } from '@/types';
import { CalendarDays, Clock3, Swords, Trophy } from 'lucide-react';
import { formatDate, formatTime, getStatusClasses, getStatusLabel } from '@/lib/formatters';
import { PresencaPanel } from '@/components/PresencaPanel';
import { MvpVotingModal } from '@/components/MvpVotingModal';
import { ChatDesafio } from '@/components/ChatDesafio';

interface MyChallengeCardProps {
  desafio: Desafio;
  currentTeamId: string;
  loading?: boolean;
  onRegistrarResultado: (desafioId: string, placarCriador: number, placarDesafiante: number) => void;
  onConfirmarResultado: (desafioId: string, placarCriador: number, placarDesafiante: number) => void;
  onRegistrarArtilheiros: (desafioId: string, payload: { golsCriador: Array<{ nomeAutor: string; quantidadeGols: number }>; golsDesafiante: Array<{ nomeAutor: string; quantidadeGols: number }> }) => void;
  onCancelarDesafio: (desafioId: string) => void;
}

type ScorerRow = { nomeAutor: string; quantidadeGols: number };

const golsToRows = (items: Desafio['gols'], timeId?: string | null): ScorerRow[] =>
  items
    .filter((item) => item.timeId === timeId)
    .map((item) => ({ nomeAutor: item.nomeAutor, quantidadeGols: item.quantidadeGols }));

const ScorersEditor = ({
  label,
  rows,
  onChange,
  placarEsperado,
}: {
  label: string;
  rows: ScorerRow[];
  onChange: (rows: ScorerRow[]) => void;
  placarEsperado: number;
}) => {
  const total = rows.reduce((s, r) => s + (Number.isFinite(r.quantidadeGols) ? r.quantidadeGols : 0), 0);
  const bate = total === placarEsperado;
  const update = (i: number, patch: Partial<ScorerRow>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="rounded-2xl border border-white/10 bg-background/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <span className={`text-xs font-bold ${bate ? 'text-emerald-400' : 'text-amber-400'}`}>
          {total}/{placarEsperado} gols
        </span>
      </div>

      <div className="space-y-2">
        {rows.length === 0 && <p className="text-xs text-muted-foreground">Nenhum artilheiro ainda.</p>}
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={r.nomeAutor}
              onChange={(e) => update(i, { nomeAutor: e.target.value })}
              placeholder="Nome do jogador"
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            />
            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-background">
              <button
                type="button"
                onClick={() => update(i, { quantidadeGols: Math.max(1, r.quantidadeGols - 1) })}
                className="px-2.5 py-1.5 text-lg font-bold text-muted-foreground transition hover:text-foreground"
                aria-label="Menos um gol"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-black text-foreground">{r.quantidadeGols}</span>
              <button
                type="button"
                onClick={() => update(i, { quantidadeGols: r.quantidadeGols + 1 })}
                className="px-2.5 py-1.5 text-lg font-bold text-muted-foreground transition hover:text-foreground"
                aria-label="Mais um gol"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-xl px-2 py-2 text-sm text-muted-foreground transition hover:text-rose-400"
              aria-label="Remover artilheiro"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...rows, { nomeAutor: '', quantidadeGols: 1 }])}
        className="mt-2 w-full rounded-xl border border-dashed border-white/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition hover:bg-secondary"
      >
        + Adicionar artilheiro
      </button>
    </div>
  );
};

export const MyChallengeCard = ({
  desafio,
  currentTeamId,
  loading = false,
  onRegistrarResultado,
  onConfirmarResultado,
  onRegistrarArtilheiros,
  onCancelarDesafio,
}: MyChallengeCardProps) => {
  const [placarCriador, setPlacarCriador] = useState('');
  const [placarDesafiante, setPlacarDesafiante] = useState('');
  const [golsCriador, setGolsCriador] = useState<ScorerRow[]>([]);
  const [golsDesafiante, setGolsDesafiante] = useState<ScorerRow[]>([]);
  const [showMvp, setShowMvp] = useState(false);

  useEffect(() => {
    const nextCriador = desafio.placarCriadorProposto ?? desafio.placarCriador ?? '';
    const nextDesafiante = desafio.placarDesafianteProposto ?? desafio.placarDesafiante ?? '';

    setPlacarCriador(nextCriador === '' ? '' : String(nextCriador));
    setPlacarDesafiante(nextDesafiante === '' ? '' : String(nextDesafiante));
    setGolsCriador(golsToRows(desafio.gols, desafio.timeCriadorId));
    setGolsDesafiante(golsToRows(desafio.gols, desafio.timeDesafianteId));
  }, [desafio]);

  const canConfirm =
    desafio.status === DesafioStatus.ResultadoPendente &&
    desafio.resultadoPropostoPorTimeId !== currentTeamId;

  const canPropose =
    desafio.status === DesafioStatus.Aceito ||
    desafio.status === DesafioStatus.ResultadoPendente;

  const canRegisterScorers = desafio.status === DesafioStatus.Finalizado;
  const canCancel = desafio.status === DesafioStatus.Aberto || desafio.status === DesafioStatus.Aceito;

  const placarPendente = useMemo(() => ({
    criador: desafio.placarCriadorProposto ?? 0,
    desafiante: desafio.placarDesafianteProposto ?? 0,
  }), [desafio]);

  const handleRegistrar = () => {
    const criador = Number(placarCriador);
    const desafiante = Number(placarDesafiante);

    if (Number.isNaN(criador) || Number.isNaN(desafiante)) {
      return;
    }

    onRegistrarResultado(desafio.id, criador, desafiante);
  };

  const cleanRows = (rows: ScorerRow[]) =>
    rows
      .map((r) => ({ nomeAutor: r.nomeAutor.trim(), quantidadeGols: r.quantidadeGols }))
      .filter((r) => r.nomeAutor && Number.isFinite(r.quantidadeGols) && r.quantidadeGols > 0);

  const handleScorers = () => {
    onRegistrarArtilheiros(desafio.id, {
      golsCriador: cleanRows(golsCriador),
      golsDesafiante: cleanRows(golsDesafiante),
    });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-card/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            <Swords size={12} />
            <span>{desafio.bairro}</span>
          </div>
          <h3 className="mt-3 text-xl font-black tracking-tight text-foreground">
            {desafio.timeCriador} x {desafio.timeDesafiante ?? 'Convite em definicao'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{desafio.local}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${getStatusClasses(desafio.status)}`}>
          {getStatusLabel(desafio.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} />
          <span>{formatDate(desafio.dataJogo)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 size={14} />
          <span>{formatTime(desafio.horaJogo)}</span>
        </div>
      </div>

      {desafio.status === DesafioStatus.Aberto && (
        <div className="mt-5 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100">
          Convite enviado e aguardando a confirmacao da equipe convidada.
        </div>
      )}

      {desafio.status === DesafioStatus.Cancelado && (
        <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          Esse desafio foi cancelado e saiu da agenda competitiva.
        </div>
      )}

      {desafio.status === DesafioStatus.Finalizado && (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Resultado confirmado</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
            {desafio.placarCriador} x {desafio.placarDesafiante}
          </p>
          <button
            onClick={() => setShowMvp(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-300 transition hover:bg-yellow-500/20"
          >
            <Trophy size={12} />
            Votar no MVP
          </button>
        </div>
      )}
      {showMvp && (
        <MvpVotingModal
          desafioId={desafio.id}
          timeCriador={desafio.timeCriador}
          timeDesafiante={desafio.timeDesafiante ?? ''}
          onClose={() => setShowMvp(false)}
        />
      )}

      {desafio.status === DesafioStatus.ResultadoPendente && (
        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300">Resultado pendente de confirmacao</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
            {placarPendente.criador} x {placarPendente.desafiante}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Proposto por {desafio.resultadoPropostoPorTime ?? 'uma das equipes'}.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Criador: {desafio.resultadoConfirmadoPeloCriador ? 'confirmou' : 'aguardando'} • Desafiante: {desafio.resultadoConfirmadoPeloDesafiante ? 'confirmou' : 'aguardando'}
          </p>
        </div>
      )}

      {canPropose && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-secondary/60 p-4">
          <p className="text-sm font-semibold text-foreground">Registrar ou ajustar placar</p>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={placarCriador}
              onChange={(event) => setPlacarCriador(event.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center text-lg font-black text-foreground outline-none transition focus:border-primary"
            />
            <span className="text-lg font-black text-muted-foreground">x</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={placarDesafiante}
              onChange={(event) => setPlacarDesafiante(event.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center text-lg font-black text-foreground outline-none transition focus:border-primary"
            />
          </div>
          <button
            onClick={handleRegistrar}
            disabled={loading || placarCriador === '' || placarDesafiante === ''}
            className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Salvando...' : desafio.status === DesafioStatus.ResultadoPendente ? 'Atualizar proposta' : 'Enviar resultado'}
          </button>
        </div>
      )}

      {canConfirm && (
        <button
          onClick={() => onConfirmarResultado(desafio.id, placarPendente.criador, placarPendente.desafiante)}
          disabled={loading}
          className="mt-4 w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/12 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Confirmando...' : 'Concordar com o placar'}
        </button>
      )}

      {canRegisterScorers && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-secondary/50 p-4">
          <p className="text-sm font-semibold text-foreground">Artilheiros da partida</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Adicione cada jogador e ajuste os gols no contador. O total deve bater com o placar.
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <ScorersEditor
              label={desafio.timeCriador}
              rows={golsCriador}
              onChange={setGolsCriador}
              placarEsperado={desafio.placarCriador ?? 0}
            />
            <ScorersEditor
              label={desafio.timeDesafiante ?? 'Desafiante'}
              rows={golsDesafiante}
              onChange={setGolsDesafiante}
              placarEsperado={desafio.placarDesafiante ?? 0}
            />
          </div>
          <button onClick={handleScorers} disabled={loading} className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-foreground transition hover:bg-secondary disabled:opacity-50">
            {loading ? 'Salvando artilheiros...' : 'Salvar artilheiros'}
          </button>
        </div>
      )}

      {(desafio.status === DesafioStatus.Aceito || desafio.status === DesafioStatus.ResultadoPendente) && (
        <PresencaPanel desafioId={desafio.id} meuTimeId={currentTeamId} />
      )}

      {canCancel && (
        <button
          onClick={() => onCancelarDesafio(desafio.id)}
          disabled={loading}
          className="mt-4 w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-rose-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Cancelar desafio'}
        </button>
      )}

      <ChatDesafio desafioId={desafio.id} />
    </div>
  );
};
